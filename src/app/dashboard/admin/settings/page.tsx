import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { isExecutive } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callback=/dashboard/admin/settings')
  }

  if (!isExecutive(user.role)) {
    redirect('/unauthorized')
  }

  const [usersCount, projectsCount, eventsCount, badgesCount] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.event.count(),
    prisma.digitalBadge.count(),
  ])

  return (
    <SettingsClient
      user={user}
      stats={{
        usersCount,
        projectsCount,
        eventsCount,
        badgesCount,
      }}
    />
  )
}
