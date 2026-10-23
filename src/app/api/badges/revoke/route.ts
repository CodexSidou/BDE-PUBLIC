import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { isExecutive, canManageProject } from '@/lib/permissions'
import { logAuditEvent } from '@/lib/audit'
import { BadgeStatus } from '@prisma/client'
import { z } from 'zod'

const revokeSchema = z.object({
  badgeId: z.string().uuid(),
  reason: z.string().min(3, 'Raison de révocation requise'),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = revokeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { badgeId, reason } = parsed.data

    const badge = await prisma.digitalBadge.findUnique({
      where: { id: badgeId },
      include: {
        project: { select: { managerId: true } },
      },
    })

    if (!badge) {
      return NextResponse.json({ error: 'Badge introuvable' }, { status: 404 })
    }

    // Permission check
    if (badge.project) {
      if (!canManageProject(user.role, user.id, badge.project.managerId)) {
        return NextResponse.json(
          { error: 'Permissions insuffisantes pour révoquer ce badge' },
          { status: 403 }
        )
      }
    } else {
      if (!isExecutive(user.role)) {
        return NextResponse.json(
          { error: 'Seuls les dirigeants exécutifs peuvent révoquer ce badge' },
          { status: 403 }
        )
      }
    }

    const updated = await prisma.digitalBadge.update({
      where: { id: badgeId },
      data: {
        status: BadgeStatus.REVOKED,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    })

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'BADGE_REVOKED',
      resourceType: 'BADGE',
      resourceId: badge.id,
      details: { badgeCode: badge.badgeCode, reason },
      result: 'SUCCESS',
    })

    return NextResponse.json({ success: true, badge: updated })
  } catch (error) {
    console.error('Revoke badge error:', error)
    return NextResponse.json(
      { error: 'Impossible de révoquer le badge' },
      { status: 500 }
    )
  }
}
