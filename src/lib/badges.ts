import QRCode from 'qrcode'
import crypto from 'crypto'
import { prisma } from './prisma'

export interface BadgeVerificationResult {
  isValid: boolean
  status: 'VALID' | 'EXPIRED' | 'REVOKED' | 'NOT_FOUND'
  badgeCode: string
  memberDisplayName?: string
  projectTitle?: string
  roleTitle?: string
  issueDate?: string
  expiresAt?: string | null
  revokedAt?: string | null
  revokedReason?: string | null
  verifiedAt: string
}

/**
 * Generates an unguessable, secure cryptographic code for a badge
 * Example: "INSIM-8B4F-29E1-C34A"
 */
export function generateBadgeCode(): string {
  const bytes = crypto.randomBytes(6).toString('hex').toUpperCase()
  return `INSIM-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}-${bytes.slice(8, 12)}`
}

/**
 * Generates a QR Code Data URL pointing to the public verification endpoint
 */
export async function generateQrCodeDataUrl(badgeCode: string, baseUrl?: string): Promise<string> {
  const origin = baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const verifyUrl = `${origin}/verify/${encodeURIComponent(badgeCode)}`
  return QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 256,
    color: {
      dark: '#0A1120',
      light: '#FFFFFF',
    },
  })
}

/**
 * Securely verifies a badge code against the database.
 * Never exposes passwords, raw financial details, or internal files.
 */
export async function verifyBadgeByCode(badgeCode: string): Promise<BadgeVerificationResult> {
  const now = new Date()
  const cleanCode = badgeCode.trim().toUpperCase()

  const badge = await prisma.digitalBadge.findUnique({
    where: { badgeCode: cleanCode },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          avatarUrl: true,
          department: true,
          studyYear: true,
        },
      },
      project: {
        select: {
          title: true,
        },
      },
    },
  })

  if (!badge) {
    return {
      isValid: false,
      status: 'NOT_FOUND',
      badgeCode: cleanCode,
      verifiedAt: now.toISOString(),
    }
  }

  // Check if explicitly revoked
  if (badge.status === 'REVOKED') {
    return {
      isValid: false,
      status: 'REVOKED',
      badgeCode: badge.badgeCode,
      memberDisplayName: `${badge.user.firstName} ${badge.user.lastName}`,
      projectTitle: badge.project?.title || 'INSIM BDE Officiel',
      roleTitle: badge.roleTitle,
      issueDate: badge.issueDate.toISOString(),
      revokedAt: badge.revokedAt ? badge.revokedAt.toISOString() : null,
      revokedReason: badge.revokedReason || 'Autorisation retirée par les administrateurs BDE',
      verifiedAt: now.toISOString(),
    }
  }

  // Check if expired
  if (badge.expiresAt && badge.expiresAt < now) {
    return {
      isValid: false,
      status: 'EXPIRED',
      badgeCode: badge.badgeCode,
      memberDisplayName: `${badge.user.firstName} ${badge.user.lastName}`,
      projectTitle: badge.project?.title || 'INSIM BDE Officiel',
      roleTitle: badge.roleTitle,
      issueDate: badge.issueDate.toISOString(),
      expiresAt: badge.expiresAt.toISOString(),
      verifiedAt: now.toISOString(),
    }
  }

  // Badge is VALID
  return {
    isValid: true,
    status: 'VALID',
    badgeCode: badge.badgeCode,
    memberDisplayName: `${badge.user.firstName} ${badge.user.lastName}`,
    projectTitle: badge.project?.title || 'INSIM BDE Officiel',
    roleTitle: badge.roleTitle,
    issueDate: badge.issueDate.toISOString(),
    expiresAt: badge.expiresAt ? badge.expiresAt.toISOString() : null,
    verifiedAt: now.toISOString(),
  }
}
