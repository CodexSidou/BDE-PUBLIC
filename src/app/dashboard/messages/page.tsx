import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { isExecutive } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import MessagesClient from './MessagesClient'

export const dynamic = 'force-dynamic'

export default async function DashboardMessagesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callback=/dashboard/messages')
  }

  if (!isExecutive(user.role)) {
    redirect('/unauthorized')
  }

  const [initialMessages, unreadCount, totalCount] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.contactMessage.count({
      where: { isRead: false },
    }),
    prisma.contactMessage.count(),
  ])

  // Convert Date objects to ISO strings for client hydration safety
  const serializedMessages = initialMessages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
    readAt: m.readAt ? m.readAt.toISOString() : null,
    repliedAt: m.repliedAt ? m.repliedAt.toISOString() : null,
  }))

  return (
    <MessagesClient
      initialMessages={serializedMessages}
      initialStats={{ total: totalCount, unread: unreadCount }}
      user={user}
    />
  )
}
