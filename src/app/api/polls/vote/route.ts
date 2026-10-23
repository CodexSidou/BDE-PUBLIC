import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const voteSchema = z.object({
  pollId: z.string().uuid(),
  optionId: z.string().uuid(),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Veuillez vous connecter pour voter' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const parsed = voteSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Données de vote invalides' }, { status: 400 })
    }

    const { pollId, optionId } = parsed.data

    // Check poll status
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    })

    if (!poll || poll.isClosed) {
      return NextResponse.json(
        { error: 'Ce sondage est clôturé ou introuvable' },
        { status: 400 }
      )
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        pollId_userId: {
          pollId,
          userId: user.id,
        },
      },
    })

    if (existingVote) {
      return NextResponse.json(
        { error: 'Vous avez déjà exprimé votre vote pour ce sondage.' },
        { status: 409 }
      )
    }

    // Transaction to record vote and increment count
    await prisma.$transaction(async (tx) => {
      await tx.vote.create({
        data: {
          pollId,
          optionId,
          userId: user.id,
        },
      })

      await tx.pollOption.update({
        where: { id: optionId },
        data: {
          votesCount: { increment: 1 },
        },
      })
    })

    return NextResponse.json({ success: true, message: 'Votre vote a été pris en compte avec succès.' })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement de votre vote' },
      { status: 500 }
    )
  }
}
