import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import DashboardIdeasClient from './DashboardIdeasClient'

export const dynamic = 'force-dynamic'

export default async function DashboardIdeasPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login?callback=/dashboard/ideas')
  }

  const [ideas, polls, userVotes] = await Promise.all([
    prisma.idea.findMany({
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.poll.findMany({
      include: {
        options: {
          include: {
            _count: {
              select: { votes: true },
            },
          },
        },
        _count: {
          select: { votes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.vote.findMany({
      where: { userId: user.id },
      select: { pollId: true, optionId: true },
    }),
  ])

  // Sanitize anonymous ideas for privacy
  const sanitizedIdeas = ideas.map((idea) => {
    if (idea.isAnonymous && idea.authorId !== user.id && user.role !== 'PRESIDENT') {
      return {
        ...idea,
        author: {
          id: 'anonymous',
          firstName: 'Étudiant',
          lastName: 'Anonyme',
          role: 'STUDENT',
        },
      }
    }
    return idea
  })

  return (
    <DashboardIdeasClient
      user={user}
      initialIdeas={JSON.parse(JSON.stringify(sanitizedIdeas))}
      initialPolls={JSON.parse(JSON.stringify(polls))}
      initialUserVotes={JSON.parse(JSON.stringify(userVotes))}
    />
  )
}
