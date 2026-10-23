import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { isExecutive, canManageProject } from '@/lib/permissions'
import { generateBadgeCode, generateQrCodeDataUrl } from '@/lib/badges'
import { logAuditEvent } from '@/lib/audit'
import { BadgeStatus } from '@prisma/client'
import { z } from 'zod'

const badgeSchema = z.object({
  targetUserId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  roleTitle: z.string().min(2, 'Titre de rôle requis'),
  expiresAt: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = badgeSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { targetUserId, projectId, roleTitle, expiresAt } = parsed.data

    // Check authorization:
    // If projectId provided, user must be manager of that project or Executive
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
      })
      if (!project) {
        return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })
      }
      if (!canManageProject(user.role, user.id, project.managerId)) {
        return NextResponse.json(
          { error: 'Vous ne pouvez générer des badges que pour les projets que vous dirigez.' },
          { status: 403 }
        )
      }
    } else {
      // General BDE badges can only be issued by Executives (President / VP)
      if (!isExecutive(user.role)) {
        return NextResponse.json(
          { error: 'Seuls la Présidence et la Vice-Présidence peuvent émettre des badges officiels généraux.' },
          { status: 403 }
        )
      }
    }

    const badgeCode = generateBadgeCode()
    const qrCodeDataUrl = await generateQrCodeDataUrl(badgeCode)

    const badge = await prisma.digitalBadge.create({
      data: {
        badgeCode,
        userId: targetUserId,
        projectId: projectId || null,
        roleTitle,
        issueDate: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: BadgeStatus.VALID,
        issuerId: user.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            studentNumber: true,
            department: true,
            studyYear: true,
            avatarUrl: true,
          },
        },
        project: {
          select: {
            title: true,
          },
        },
      },
    })

    // Notify user of newly minted badge
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: 'Nouveau Badge INSIM ID délivré',
        message: `Votre badge officiel (${roleTitle}) avec QR code certifié est disponible au téléchargement.`,
        type: 'BADGE',
        link: '/dashboard/badges',
      },
    })

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'BADGE_GENERATED',
      resourceType: 'BADGE',
      resourceId: badge.id,
      details: { badgeCode, targetUserId, roleTitle, projectId },
      result: 'SUCCESS',
    })

    return NextResponse.json({
      success: true,
      badge,
      qrCodeDataUrl,
    })
  } catch (error) {
    console.error('Generate badge error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du badge' },
      { status: 500 }
    )
  }
}
