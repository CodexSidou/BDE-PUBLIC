import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { getFinancialSummary } from '@/lib/finance'
import { isBdeStaff, isFinanceManager } from '@/lib/permissions'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    if (!isBdeStaff(user.role)) {
      return NextResponse.json(
        { error: 'Accès interdit. Réservé aux membres accrédités du BDE.' },
        { status: 403 }
      )
    }

    const summary = await getFinancialSummary(user.role)
    const isManager = isFinanceManager(user.role)

    // For normal BDE members: provide investment transparency in read-only mode
    if (!isManager) {
      return NextResponse.json({
        readOnly: true,
        userRole: user.role,
        summary: {
          availableBalance: summary.availableBalance,
          totalPaidExpenses: summary.totalPaidExpenses,
          totalReservedBudgets: summary.totalReservedBudgets,
          totalIncome: summary.totalIncome,
          pendingExpensesCount: summary.pendingExpensesCount,
          pendingExpensesTotal: summary.pendingExpensesTotal,
          approvedUnpaidTotal: summary.approvedUnpaidTotal,
          projectInvestments: summary.projectInvestments,
        },
      })
    }

    // For Treasurer, VP, President: Full manager access
    return NextResponse.json({
      readOnly: false,
      userRole: user.role,
      summary,
    })
  } catch (error) {
    console.error('Financial summary error:', error)
    return NextResponse.json(
      { error: 'Impossible de calculer la synthèse financière' },
      { status: 500 }
    )
  }
}
