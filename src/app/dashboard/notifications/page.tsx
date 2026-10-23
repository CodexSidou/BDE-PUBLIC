import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/Sidebar'
import NotificationsClient from './NotificationsClient'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callback=/dashboard/notifications')
  }

  // Fetch real notifications for user
  let notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // If new user with no notifications, let's create a welcome notification in the database
  if (notifications.length === 0) {
    const welcomeNotif = await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Bienvenue sur INSIM CONNECT !',
        message: 'Votre compte est actif. Vous pouvez générer votre Badge INSIM ID, consulter les projets et participer aux événements du campus.',
        type: 'SYSTEM',
        link: '/dashboard/badges',
      },
    })
    notifications = [welcomeNotif]
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar user={user} />
      <main className="flex-1 p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <NotificationsClient initialNotifications={JSON.parse(JSON.stringify(notifications))} />
      </main>
    </div>
  )
}
