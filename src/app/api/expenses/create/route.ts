import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { logAuditEvent } from '@/lib/audit'
import { ExpenseCategory, ExpenseStatus, UserRole } from '@prisma/client'
import { z } from 'zod'

const expenseSchema = z.object({
  title: z.string().min(3, 'Titre requis'),
  description: z.string().min(5, 'Description détaillée requise'),
  category: z.nativeEnum(ExpenseCategory).default(ExpenseCategory.OTHER),
  requestedAmount: z.number().positive('Le montant doit être positif'),
  projectId: z.string().uuid('ID projet invalide'),
  receiptUrl: z.string().optional(),
  receiptFileName: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (!hasPermission(user.role, 'create_expense_request')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour soumettre une dépense' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = expenseSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { title, description, category, requestedAmount, projectId, receiptUrl, receiptFileName } =
      parsed.data

    // Check project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })
    }

    const expense = await prisma.expenseRequest.create({
      data: {
        title,
        description,
        category,
        requestedAmount,
        projectId,
        requesterId: user.id,
        status: ExpenseStatus.SUBMITTED,
        receiptUrl: receiptUrl || null,
        receiptFileName: receiptFileName || null,
      },
    })

    // Notify financial executives (Treasurer, VP, President)
    const executives = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.TREASURER, UserRole.VICE_PRESIDENT, UserRole.PRESIDENT] },
      },
      select: { id: true },
    })

    for (const exec of executives) {
      if (exec.id !== user.id) {
        await prisma.notification.create({
          data: {
            userId: exec.id,
            title: 'Nouvelle demande de dépense',
            message: `${user.firstName} ${user.lastName} a soumis une demande de ${requestedAmount} DZD pour "${project.title}".`,
            type: 'FINANCE',
            link: '/dashboard/expenses',
          },
        })
      }
    }

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'EXPENSE_REQUESTED',
      resourceType: 'EXPENSE',
      resourceId: expense.id,
      details: { amount: requestedAmount, projectId, title },
      result: 'SUCCESS',
    })

    return NextResponse.json({ success: true, expense })
  } catch (error) {
    console.error('Expense request error:', error)
    return NextResponse.json(
      { error: 'Impossible de soumettre la demande de dépense' },
      { status: 500 }
    )
  }
}
