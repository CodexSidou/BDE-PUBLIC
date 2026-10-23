import { prisma } from './prisma'
import { AuditResult } from '@prisma/client'

export interface LogAuditParams {
  actorId?: string
  actorEmail?: string
  action: string
  resourceType: string
  resourceId?: string
  details?: Record<string, unknown> | string
  ipAddress?: string
  result?: AuditResult
}

export async function logAuditEvent({
  actorId,
  actorEmail,
  action,
  resourceType,
  resourceId,
  details,
  ipAddress,
  result = 'SUCCESS',
}: LogAuditParams) {
  try {
    const stringDetails =
      typeof details === 'object' ? JSON.stringify(details) : details

    await prisma.auditLog.create({
      data: {
        actorId,
        actorEmail,
        action,
        resourceType,
        resourceId,
        details: stringDetails,
        ipAddress,
        result,
      },
    })
  } catch (error) {
    // Audit log should never crash the main transaction
    console.error('[AUDIT_ERROR] Failed to write audit record:', error)
  }
}
