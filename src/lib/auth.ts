import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'
import { SessionUser, UserRole } from '@/types'

const AUTH_COOKIE_NAME = 'insim_session'
const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'insim_connect_super_secret_session_jwt_key_2026_x89a'
)

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    studentNumber: user.studentNumber,
    department: user.department,
    studyYear: user.studyYear,
    avatarUrl: user.avatarUrl,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY)
}

export async function setSessionCookie(token: string) {
  const cookieStore = cookies()
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

export async function clearSessionCookie() {
  const cookieStore = cookies()
  cookieStore.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return null
    }

    const { payload } = await jwtVerify(token, SECRET_KEY)
    const userId = payload.id as string

    if (!userId) {
      return null
    }

    // Always verify user is still active in database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        studentNumber: true,
        department: true,
        studyYear: true,
        avatarUrl: true,
        isActive: true,
      },
    })

    if (!dbUser || !dbUser.isActive) {
      return null
    }

    return {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      role: dbUser.role as UserRole,
      studentNumber: dbUser.studentNumber,
      department: dbUser.department,
      studyYear: dbUser.studyYear,
      avatarUrl: dbUser.avatarUrl,
    }
  } catch (err) {
    return null
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('UNAUTHORIZED: Authentication required')
  }
  return user
}

export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth()
  if (!allowedRoles.includes(user.role)) {
    throw new Error('FORBIDDEN: Insufficient permissions')
  }
  return user
}
