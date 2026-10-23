import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { isExecutive, canAssignRole } from '@/lib/permissions'
import { logAuditEvent } from '@/lib/audit'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const updateUserSchema = z.object({
  targetUserId: z.string().uuid(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
})

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !isExecutive(user.role)) {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs (Président et Vice-Président)' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        studentNumber: true,
        department: true,
        studyYear: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, users })
  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json(
      { error: 'Impossible de récupérer la liste des utilisateurs' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !isExecutive(user.role)) {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs (Président et Vice-Président)' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = updateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { targetUserId, role, isActive } = parsed.data

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'Utilisateur cible introuvable' }, { status: 404 })
    }

    const isSelf = user.id === targetUserId

    // Role modification checks
    if (role && role !== targetUser.role) {
      if (!canAssignRole(user.role, role, isSelf)) {
        await logAuditEvent({
          actorId: user.id,
          actorEmail: user.email,
          action: 'ROLE_ELEVATION_DENIED',
          resourceType: 'USER',
          resourceId: targetUserId,
          details: { attemptedRole: role, actorRole: user.role, isSelf },
          result: 'DENIED',
        })
        return NextResponse.json(
          {
            error:
              'Privilèges insuffisants : l\'auto-élévation de rôle est strictement interdite, et seul le Président peut nommer des dirigeants exécutifs.',
          },
          { status: 403 }
        )
      }
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(role && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    })

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'USER_ADMIN_UPDATE',
      resourceType: 'USER',
      resourceId: targetUserId,
      details: { previousRole: targetUser.role, newRole: role, isActive },
      result: 'SUCCESS',
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du profil' },
      { status: 500 }
    )
  }
}
