import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/Sidebar'
import EventsDashboardClient from './EventsDashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardEventsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callback=/dashboard/events')
  }

  const events = await prisma.event.findMany({
    include: {
      organizer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      registrations: {
        where: { userId: user.id },
        select: {
          id: true,
          attended: true,
        },
      },
      _count: {
        select: {
          registrations: true,
        },
      },
    },
    orderBy: { startsAt: 'asc' },
  })

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar user={user} />
      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <EventsDashboardClient
          user={user}
          initialEvents={JSON.parse(JSON.stringify(events))}
        />
      </main>
    </div>
  )
}
