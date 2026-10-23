import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { isExecutive } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/Sidebar'
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
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar user={user} />
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        <SettingsClient
          user={user}
          stats={{
            usersCount,
            projectsCount,
            eventsCount,
            badgesCount,
          }}
        />
      </main>
    </div>
  )
}
