import { prisma } from './prisma'
import { FinancialSummary, UserRole } from '@/types'
import { isFinanceManager, isBdeStaff } from './permissions'

/**
 * Calculates current BDE financial metrics using precise Decimal aggregation:
 * Available balance = Opening balance + Confirmed income - Confirmed paid expenditure - Reserved funds
 */
export async function getFinancialSummary(
  userRole: UserRole,
  openingBalance = 0.0 // Default initial BDE treasury opening balance starts at 0 DZD
): Promise<FinancialSummary> {
  // Check permission: at least BDE_MEMBER is required for investment summaries
  if (!isBdeStaff(userRole)) {
    throw new Error('FORBIDDEN: You do not have access to financial summaries')
  }

  // 1. Confirmed Income transactions
  const incomeAgg = await prisma.financialTransaction.aggregate({
    where: {
      type: 'INCOMING_FUNDS',
      status: 'CONFIRMED',
    },
    _sum: {
      amount: true,
    },
  })
  const totalIncome = Number(incomeAgg._sum.amount ?? 0)

  // 2. Confirmed Paid Expenses (actual cash outflow)
  const paidExpenseAgg = await prisma.financialTransaction.aggregate({
    where: {
      type: 'EXPENSE_PAYMENT',
      status: 'CONFIRMED',
    },
    _sum: {
      amount: true,
    },
  })
  const totalPaidExpenses = Number(paidExpenseAgg._sum.amount ?? 0)

  // 3. Reserved project budgets (active budgets committed to projects)
  const budgets = await prisma.projectBudget.findMany({
    include: {
      project: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
  })

  // 4. Project-by-project investments (all confirmed payments linked to each project)
  const projectExpenses = await prisma.financialTransaction.groupBy({
    by: ['projectId'],
    where: {
      type: 'EXPENSE_PAYMENT',
      status: 'CONFIRMED',
      projectId: { not: null },
    },
    _sum: {
      amount: true,
    },
  })

  const projectExpenseMap = new Map<string, number>()
  for (const pe of projectExpenses) {
    if (pe.projectId) {
      projectExpenseMap.set(pe.projectId, Number(pe._sum.amount ?? 0))
    }
  }

  const projectInvestments = budgets.map((b) => {
    const allocated = Number(b.allocatedAmount)
    const totalInvested = projectExpenseMap.get(b.projectId) ?? 0
    return {
      projectId: b.projectId,
      projectTitle: b.project.title,
      allocatedBudget: allocated,
      totalInvested: Math.round(totalInvested * 100) / 100,
    }
  })

  // 5. Reserved funds: sum of remaining budget allocations committed to active/planned projects
  let totalReservedBudgets = 0
  for (const b of budgets) {
    if (b.project.status === 'ACTIVE' || b.project.status === 'PLANNED') {
      const allocated = Number(b.allocatedAmount)
      const spent = projectExpenseMap.get(b.projectId) ?? 0
      const remainingReserved = Math.max(0, allocated - spent)
      totalReservedBudgets += remainingReserved
    }
  }

  // 6. Pending expense requests (SUBMITTED or UNDER_REVIEW)
  const pendingRequests = await prisma.expenseRequest.findMany({
    where: {
      status: { in: ['SUBMITTED', 'UNDER_REVIEW'] },
    },
    select: {
      requestedAmount: true,
    },
  })
  const pendingExpensesCount = pendingRequests.length
  const pendingExpensesTotal = pendingRequests.reduce(
    (sum, r) => sum + Number(r.requestedAmount),
    0
  )

  // 7. Approved but unpaid expenses (approved, awaiting actual treasurer payout)
  const approvedUnpaidRequests = await prisma.expenseRequest.findMany({
    where: {
      status: 'APPROVED',
    },
    select: {
      requestedAmount: true,
    },
  })
  const approvedUnpaidTotal = approvedUnpaidRequests.reduce(
    (sum, r) => sum + Number(r.requestedAmount),
    0
  )

  // Available cash balance:
  // Available balance = Opening balance + Confirmed income - Confirmed paid expenditure - Applicable reserved funds
  const netCash = openingBalance + totalIncome - totalPaidExpenses
  const availableBalance = Math.max(0, netCash - totalReservedBudgets)

  return {
    openingBalance: Math.round(openingBalance * 100) / 100,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalPaidExpenses: Math.round(totalPaidExpenses * 100) / 100,
    availableBalance: Math.round(availableBalance * 100) / 100,
    totalReservedBudgets: Math.round(totalReservedBudgets * 100) / 100,
    pendingExpensesCount,
    pendingExpensesTotal: Math.round(pendingExpensesTotal * 100) / 100,
    approvedUnpaidTotal: Math.round(approvedUnpaidTotal * 100) / 100,
    projectInvestments,
  }
}
