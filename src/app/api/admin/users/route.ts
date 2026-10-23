import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, hashPassword } from '@/lib/auth'
import { isExecutive, canAssignRole } from '@/lib/permissions'
import { logAuditEvent } from '@/lib/audit'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const createMemberSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  role: z.nativeEnum(UserRole).default(UserRole.BDE_MEMBER),
  studentNumber: z.string().optional(),
  department: z.string().optional(),
  studyYear: z.string().optional(),
})

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

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !isExecutive(user.role)) {
      return NextResponse.json(
        { error: 'Accès réservé aux administrateurs (Président et Vice-Président)' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = createMemberSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password, firstName, lastName, role, studentNumber, department, studyYear } =
      parsed.data

    // Check role assignment authority
    if (!canAssignRole(user.role, role, false)) {
      await logAuditEvent({
        actorId: user.id,
        actorEmail: user.email,
        action: 'MEMBER_CREATION_ROLE_DENIED',
        resourceType: 'USER',
        details: { attemptedRole: role, actorRole: user.role },
        result: 'DENIED',
      })
      return NextResponse.json(
        {
          error:
            'Privilèges insuffisants pour attribuer ce rôle. Seul le Président peut nommer des dirigeants exécutifs.',
        },
        { status: 403 }
      )
    }

    const cleanEmail = email.toLowerCase().trim()

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Un compte avec cette adresse email existe déjà.' },
        { status: 409 }
      )
    }

    const passwordHash = await hashPassword(password)

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentNumber: studentNumber?.trim() || null,
        department: department?.trim() || 'Informatique & SI',
        studyYear: studyYear?.trim() || 'Licence 1',
        role,
        isActive: true,
      },
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
    })

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'MEMBER_ACCOUNT_CREATED',
      resourceType: 'USER',
      resourceId: newUser.id,
      details: {
        createdUserId: newUser.id,
        createdEmail: cleanEmail,
        assignedRole: role,
        createdByName: `${user.firstName} ${user.lastName}`,
        createdByRole: user.role,
      },
      result: 'SUCCESS',
    })

    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: 'Bienvenue sur INSIM CONNECT',
        message: `Votre compte a été créé directement par ${user.firstName} ${user.lastName} (${user.role === 'PRESIDENT' ? 'Président' : 'Vice-Président'}) avec le rôle ${role}. Bienvenue au BDE !`,
        type: 'SYSTEM',
        link: '/dashboard',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Compte membre créé avec succès.',
      user: newUser,
    })
  } catch (error) {
    console.error('Create member error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte membre.' },
      { status: 500 }
    )
  }
}
