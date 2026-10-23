import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'INSIM CONNECT — Plateforme Officielle du Bureau des Étudiants INSIM',
  description:
    'Portail unifié des étudiants et du BDE INSIM : gestion de projets, transparence financière, événements, vie de campus et badges numériques INSIM ID certifiés par QR code.',
  keywords: ['INSIM', 'BDE', 'Étudiants', 'Algérie', 'Campus', 'Projets', 'INSIM ID', 'Finances'],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  let unreadNotificationsCount = 0
  if (user) {
    try {
      unreadNotificationsCount = await prisma.notification.count({
        where: { userId: user.id, isRead: false },
      })
    } catch {
      unreadNotificationsCount = 0
    }
  }

  return (
    <html lang="fr" className="dark">
      <body className="bg-navy-950 text-slate-100 flex flex-col min-h-screen antialiased selection:bg-accent selection:text-white">
        <Navbar user={user} unreadNotificationsCount={unreadNotificationsCount} />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
