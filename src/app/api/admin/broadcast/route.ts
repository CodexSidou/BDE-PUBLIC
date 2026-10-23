import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { isExecutive } from '@/lib/permissions'
import { notifyAllUsers } from '@/lib/notifications'
import { logAuditEvent } from '@/lib/audit'
import { z } from 'zod'

const broadcastSchema = z.object({
  title: z.string().min(3, 'Titre requis'),
  message: z.string().min(5, 'Message requis'),
  link: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (!isExecutive(user.role)) {
      return NextResponse.json(
        { error: 'Action réservée aux membres de la direction BDE (Président / Vice-Président)' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = broadcastSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { title, message, link } = parsed.data

    const count = await notifyAllUsers({
      title: `[COMMUNIQUÉ OFFICIEL BDE] ${title}`,
      message,
      type: 'SYSTEM',
      link: link || '/dashboard/notifications',
    })

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'BROADCAST_SENT',
      resourceType: 'SYSTEM',
      details: { title, message, recipientsCount: count },
      result: 'SUCCESS',
    })

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error('Broadcast error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la diffusion du message' },
      { status: 500 }
    )
  }
}
