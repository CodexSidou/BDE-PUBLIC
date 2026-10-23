import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { isFinanceManager } from '@/lib/permissions'
import { logAuditEvent } from '@/lib/audit'
import { ExpenseStatus, TransactionType, TransactionStatus } from '@prisma/client'
import crypto from 'crypto'
import { z } from 'zod'

const paySchema = z.object({
  expenseId: z.string().uuid(),
  payee: z.string().min(2, 'Nom du bénéficiaire requis'),
  receiptReference: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (!isFinanceManager(user.role)) {
      return NextResponse.json(
        { error: 'Seuls le Trésorier, la Vice-Présidence ou la Présidence peuvent décaisser des fonds.' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = paySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { expenseId, payee, receiptReference } = parsed.data

    const expense = await prisma.expenseRequest.findUnique({
      where: { id: expenseId },
    })

    if (!expense) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 })
    }

    if (expense.status !== ExpenseStatus.APPROVED) {
      return NextResponse.json(
        { error: 'Cette dépense doit être au préalable approuvée avant son paiement.' },
        { status: 400 }
      )
    }

    const code = `TX-DEP-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

    // Multi-step transaction write to guarantee financial consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark expense as paid
      const updatedExpense = await tx.expenseRequest.update({
        where: { id: expenseId },
        data: {
          status: ExpenseStatus.PAID,
          paidAt: new Date(),
          paidById: user.id,
        },
      })

      // 2. Create financial ledger transaction
      const transaction = await tx.financialTransaction.create({
        data: {
          transactionCode: code,
          type: TransactionType.EXPENSE_PAYMENT,
          amount: expense.requestedAmount,
          currency: 'DZD',
          projectId: expense.projectId,
          expenseRequestId: expense.id,
          recordedById: user.id,
          approvedById: expense.reviewerId || user.id,
          status: TransactionStatus.CONFIRMED,
          description: `Paiement dépense : ${expense.title}`,
          sourceOrPayee: payee,
          receiptReference: receiptReference || null,
        },
      })

      // 3. Notify requester
      await tx.notification.create({
        data: {
          userId: expense.requesterId,
          title: 'Dépense payée',
          message: `Le règlement de ${expense.requestedAmount} DZD pour "${expense.title}" a été effectué (${code}).`,
          type: 'FINANCE',
          link: '/dashboard/finances',
        },
      })

      return { updatedExpense, transaction }
    })

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'EXPENSE_PAID',
      resourceType: 'TRANSACTION',
      resourceId: result.transaction.id,
      details: {
        expenseId,
        transactionCode: code,
        amount: Number(expense.requestedAmount),
        payee,
      },
      result: 'SUCCESS',
    })

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
      expense: result.updatedExpense,
    })
  } catch (error) {
    console.error('Payment transaction error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement du décaissement' },
      { status: 500 }
    )
  }
}
