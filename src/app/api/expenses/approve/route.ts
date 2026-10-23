import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { canApproveExpense } from '@/lib/permissions'
import { logAuditEvent } from '@/lib/audit'
import { ExpenseStatus } from '@prisma/client'
import { z } from 'zod'

const reviewSchema = z.object({
  expenseId: z.string().uuid(),
  decision: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = reviewSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { expenseId, decision, notes } = parsed.data

    const expense = await prisma.expenseRequest.findUnique({
      where: { id: expenseId },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true, email: true } },
        project: { select: { title: true } },
      },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
    }

    // STRICT NON-NEGOTIABLE RULE: Requesters can NEVER approve their own expense request!
    if (!canApproveExpense(user.role, user.id, expense.requesterId)) {
      await logAuditEvent({
        actorId: user.id,
        actorEmail: user.email,
        action: 'EXPENSE_SELF_APPROVAL_ATTEMPT_DENIED',
        resourceType: 'EXPENSE',
        resourceId: expense.id,
        details: { requesterId: expense.requesterId, userId: user.id },
        result: 'DENIED',
      })
      return NextResponse.json(
        {
          error:
            'Violation de conformité : Un utilisateur ne peut jamais valider ou approuver sa propre demande de dépense.',
        },
        { status: 403 }
      )
    }

    const newStatus =
      decision === 'APPROVE' ? ExpenseStatus.APPROVED : ExpenseStatus.REJECTED

    const updated = await prisma.expenseRequest.update({
      where: { id: expenseId },
      data: {
        status: newStatus,
        reviewerId: user.id,
        reviewNotes: notes || null,
        reviewedAt: new Date(),
      },
    })

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: expense.requesterId,
        title:
          decision === 'APPROVE'
            ? 'Demande de dépense approuvée'
            : 'Demande de dépense rejetée',
        message: `Votre demande pour "${expense.title}" a été ${
          decision === 'APPROVE'
            ? 'approuvée par la direction financière (en attente de décaissement)'
            : 'rejetée'
        }${notes ? ` (Motif : ${notes})` : ''}.`,
        type: 'FINANCE',
        link: '/dashboard/expenses',
      },
    })

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: decision === 'APPROVE' ? 'EXPENSE_APPROVED' : 'EXPENSE_REJECTED',
      resourceType: 'EXPENSE',
      resourceId: expense.id,
      details: { decision, notes, amount: Number(expense.requestedAmount) },
      result: 'SUCCESS',
    })

    return NextResponse.json({ success: true, expense: updated })
  } catch (error) {
    console.error('Expense approval error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la demande' },
      { status: 500 }
    )
  }
}
