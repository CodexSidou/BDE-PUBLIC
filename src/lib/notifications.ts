import { prisma } from './prisma'
import { NotificationType } from '@prisma/client'

/**
 * Create a notification for a specific user
 */
export async function createNotification({
  userId,
  title,
  message,
  type = 'SYSTEM',
  link,
}: {
  userId: string
  title: string
  message: string
  type?: NotificationType
  link?: string
}) {
  try {
    return await prisma.notification.create({
      data: { userId, title, message, type, link },
    })
  } catch (error) {
    console.error('[NOTIFICATION] Failed to create:', error)
    return null
  }
}

/**
 * Send a notification to ALL users (e.g. when president creates an event)
 */
export async function notifyAllUsers({
  title,
  message,
  type = 'SYSTEM',
  link,
  excludeUserId,
}: {
  title: string
  message: string
  type?: NotificationType
  link?: string
  excludeUserId?: string
}) {
  try {
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { id: true },
    })

    if (users.length === 0) return

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title,
        message,
        type,
        link: link || undefined,
      })),
    })
  } catch (error) {
    console.error('[NOTIFICATION] Failed to notify all users:', error)
  }
}

/**
 * Send a notification to all BDE staff members
 */
export async function notifyBdeStaff({
  title,
  message,
  type = 'SYSTEM',
  link,
  excludeUserId,
}: {
  title: string
  message: string
  type?: NotificationType
  link?: string
  excludeUserId?: string
}) {
  try {
    const bdeRoles = ['BDE_MEMBER', 'PROJECT_MANAGER', 'TREASURER', 'VICE_PRESIDENT', 'PRESIDENT'] as const
    
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: [...bdeRoles] },
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
      select: { id: true },
    })

    if (users.length === 0) return

    await prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title,
        message,
        type,
        link: link || undefined,
      })),
    })
  } catch (error) {
    console.error('[NOTIFICATION] Failed to notify BDE staff:', error)
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    })
  } catch {
    return 0
  }
}
