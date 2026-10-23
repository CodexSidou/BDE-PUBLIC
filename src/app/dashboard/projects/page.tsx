import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProjectsDashboardClient from './ProjectsDashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardProjectsPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callback=/dashboard/projects')
  }

  const projects = await prisma.project.findMany({
    include: {
      manager: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      budget: true,
      tasks: {
        select: {
          id: true,
          status: true,
        },
      },
      _count: {
        select: {
          memberships: true,
          tasks: true,
          events: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <ProjectsDashboardClient
      user={user}
      initialProjects={JSON.parse(JSON.stringify(projects))}
    />
  )
}
