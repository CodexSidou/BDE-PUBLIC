import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSessionToken, setSessionCookie } from '@/lib/auth'
import { logAuditEvent } from '@/lib/audit'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z.string().min(6, 'Mot de passe trop court'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      await logAuditEvent({
        actorId: user.id,
        actorEmail: user.email,
        action: 'LOGIN_BLOCKED_INACTIVE',
        resourceType: 'USER',
        resourceId: user.id,
        result: 'DENIED',
      })
      return NextResponse.json(
        { error: 'Votre compte a été désactivé par l\'administration BDE.' },
        { status: 403 }
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      await logAuditEvent({
        actorEmail: email,
        action: 'LOGIN_FAILED_BAD_PASSWORD',
        resourceType: 'USER',
        resourceId: user.id,
        result: 'DENIED',
      })
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      studentNumber: user.studentNumber,
      department: user.department,
      studyYear: user.studyYear,
      avatarUrl: user.avatarUrl,
    }

    const token = await createSessionToken(sessionUser)
    await setSessionCookie(token)

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'LOGIN_SUCCESS',
      resourceType: 'USER',
      resourceId: user.id,
      result: 'SUCCESS',
    })

    return NextResponse.json({
      success: true,
      user: sessionUser,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Une erreur interne est survenue lors de la connexion' },
      { status: 500 }
    )
  }
}
