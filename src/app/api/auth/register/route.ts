import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Le prénom est requis'),
  lastName: z.string().min(2, 'Le nom est requis'),
  studentNumber: z.string().optional(),
  department: z.string().optional(),
  studyYear: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données de formulaire invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password, firstName, lastName, studentNumber, department, studyYear } =
      parsed.data

    const cleanEmail = email.toLowerCase().trim()

    // Verify email uniqueness
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

    // ALWAYS assign STUDENT role by default to prevent privilege escalation!
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        studentNumber: studentNumber?.trim() || null,
        department: department?.trim() || 'Informatique & SI',
        studyYear: studyYear?.trim() || 'Licence 1',
        role: UserRole.STUDENT, // Strictly enforced default role
        isActive: true,
      },
    })

    // Generate welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: 'Bienvenue sur INSIM CONNECT !',
        message: 'Votre compte étudiant a été activé. Découvrez vos cours, événements, projets et participez à la vie du campus.',
        type: 'SYSTEM',
        link: '/dashboard',
      },
    })

    await logAuditEvent({
      actorId: newUser.id,
      actorEmail: newUser.email,
      action: 'USER_REGISTERED',
      resourceType: 'USER',
      resourceId: newUser.id,
      details: { assignedRole: 'STUDENT' },
      result: 'SUCCESS',
    })

    const sessionUser = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      role: newUser.role,
      studentNumber: newUser.studentNumber,
      department: newUser.department,
      studyYear: newUser.studyYear,
      avatarUrl: newUser.avatarUrl,
    }

    const token = await createSessionToken(sessionUser)
    await setSessionCookie(token)

    return NextResponse.json({
      success: true,
      user: sessionUser,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement' },
      { status: 500 }
    )
  }
}
