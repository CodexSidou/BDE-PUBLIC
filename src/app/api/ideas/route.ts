import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { IdeaStatus } from '@prisma/client'
import { z } from 'zod'

const createIdeaSchema = z.object({
  title: z.string().min(5, 'Titre requis (au moins 5 caractères)'),
  description: z.string().min(10, 'Description détaillée requise'),
  category: z.string().min(2, 'Catégorie requise'),
  isAnonymous: z.boolean().default(false),
})

export async function GET() {
  try {
    const ideas = await prisma.idea.findMany({
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const polls = await prisma.poll.findMany({
      where: { isPublic: true },
      include: {
        options: true,
        _count: { select: { votes: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Mask author info if anonymous
    const sanitizedIdeas = ideas.map((idea) => {
      if (idea.isAnonymous) {
        return {
          ...idea,
          author: {
            id: 'anonymous',
            firstName: 'Étudiant',
            lastName: 'Anonyme',
            avatarUrl: null,
          },
        }
      }
      return idea
    })

    return NextResponse.json({ success: true, ideas: sanitizedIdeas, polls })
  } catch (error) {
    console.error('Get ideas error:', error)
    return NextResponse.json({ error: 'Erreur lors du chargement des idées' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Connectez-vous pour proposer une idée' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = createIdeaSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { title, description, category, isAnonymous } = parsed.data

    const idea = await prisma.idea.create({
      data: {
        title,
        description,
        category,
        isAnonymous,
        authorId: user.id,
        status: IdeaStatus.SUBMITTED,
      },
    })

    try {
      const { notifyBdeStaff } = await import('@/lib/notifications')
      await notifyBdeStaff({
        title: `Nouvelle idée : ${title}`,
        message: `${isAnonymous ? 'Un étudiant' : `${user.firstName} ${user.lastName}`} a soumis une proposition dans "${category}".`,
        type: 'IDEA',
        link: '/dashboard/ideas',
      })
    } catch (err) {
      console.error('Failed to notify BDE staff of idea:', err)
    }

    return NextResponse.json({ success: true, idea })
  } catch (error) {
    console.error('Create idea error:', error)
    return NextResponse.json({ error: 'Impossible d\'enregistrer votre idée' }, { status: 500 })
  }
}
