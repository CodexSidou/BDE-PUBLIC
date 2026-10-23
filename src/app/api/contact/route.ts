import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { isExecutive } from '@/lib/permissions'
import { z } from 'zod'

const contactSubmissionSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  email: z.string().email('Adresse email invalide'),
  subject: z.string().min(3, 'Le sujet doit contenir au moins 3 caractères').max(150),
  category: z.string().default('Général'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères').max(5000),
})

const updateMessageSchema = z.object({
  id: z.string().uuid(),
  isRead: z.boolean().optional(),
  replied: z.boolean().optional(),
  notes: z.string().optional(),
})

// Public endpoint: Submit a contact message
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = contactSubmissionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { name, email, subject, category, message } = parsed.data

    // 1. Save message to database
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        category: category.trim(),
        message: message.trim(),
      },
    })

    // 2. Notify all Presidents and Vice-Presidents
    const executives = await prisma.user.findMany({
      where: {
        role: { in: ['PRESIDENT', 'VICE_PRESIDENT'] },
        isActive: true,
      },
      select: { id: true },
    })

    if (executives.length > 0) {
      const snippet = message.length > 100 ? `${message.slice(0, 100)}...` : message
      await prisma.notification.createMany({
        data: executives.map((exec) => ({
          userId: exec.id,
          title: `Nouveau message [${category}] : ${subject}`,
          message: `De ${name} (${email}) : "${snippet}"`,
          type: 'CONTACT',
          link: '/dashboard/messages',
        })),
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Votre message a été transmis avec succès au Bureau des Étudiants.',
      id: contactMessage.id,
    })
  } catch (error) {
    console.error('Contact submission error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}

// Executive endpoint: List messages for President & Vice-President
export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !isExecutive(user.role)) {
      return NextResponse.json(
        { error: 'Accès réservé au Président et Vice-Président' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const unreadOnly = searchParams.get('unread') === 'true'

    const where: any = {}
    if (category && category !== 'ALL') {
      where.category = category
    }
    if (unreadOnly) {
      where.isRead = false
    }

    const [messages, unreadCount, totalCount] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactMessage.count({
        where: { isRead: false },
      }),
      prisma.contactMessage.count(),
    ])

    return NextResponse.json({
      success: true,
      messages,
      stats: {
        total: totalCount,
        unread: unreadCount,
      },
    })
  } catch (error) {
    console.error('List contact messages error:', error)
    return NextResponse.json(
      { error: 'Impossible de récupérer les messages' },
      { status: 500 }
    )
  }
}

// Executive endpoint: Mark as read/replied or add internal notes
export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !isExecutive(user.role)) {
      return NextResponse.json(
        { error: 'Accès réservé au Président et Vice-Président' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = updateMessageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { id, isRead, replied, notes } = parsed.data

    const updateData: any = {}
    if (typeof isRead === 'boolean') {
      updateData.isRead = isRead
      updateData.readAt = isRead ? new Date() : null
    }
    if (typeof replied === 'boolean') {
      updateData.replied = replied
      updateData.repliedAt = replied ? new Date() : null
    }
    if (typeof notes === 'string') {
      updateData.notes = notes
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ success: true, message: updated })
  } catch (error) {
    console.error('Update contact message error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du message' },
      { status: 500 }
    )
  }
}

// Executive endpoint: Delete a message
export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !isExecutive(user.role)) {
      return NextResponse.json(
        { error: 'Accès réservé au Président et Vice-Président' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    await prisma.contactMessage.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Message supprimé' })
  } catch (error) {
    console.error('Delete contact message error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
