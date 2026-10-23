import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  CreditCard,
  PlusCircle,
  Download,
  Filter,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  DollarSign,
  ArrowRight,
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { isBdeStaff, isFinanceManager } from '@/lib/permissions'
import { getFinancialSummary } from '@/lib/finance'
import { prisma } from '@/lib/prisma'
import FinancialMetrics from '@/components/FinancialMetrics'

export const revalidate = 0

export default async function FinancesPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  if (!isBdeStaff(user.role)) {
    redirect('/dashboard') // Normal students don't have access to finances
  }

  const isManager = isFinanceManager(user.role)
  const summary = await getFinancialSummary(user.role)

  // Fetch all transactions for the ledger
  const transactions = await prisma.financialTransaction.findMany({
    include: {
      project: { select: { title: true } },
      recordedBy: { select: { firstName: true, lastName: true } },
    },
    orderBy: { date: 'desc' },
  })

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isManager
                ? 'Gestion Budgétaire & Grand Livre Financier'
                : 'Transparence Financière BDE'}
            </h1>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isManager
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}
            >
              {isManager ? 'Mode Gestionnaire' : 'Mode Consultation'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Traçabilité intégrale des fonds, subventions et investissements par projet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/expenses"
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold border border-white/10 flex items-center gap-2 transition-colors"
          >
            <span>Demandes de dépenses</span>
          </Link>
        </div>
      </div>

      {/* Financial Metrics Cards & Project Investment Breakdown */}
      <FinancialMetrics summary={summary} userRole={user.role} />

      {/* Financial Transactions Ledger */}
      <div className="glass-panel rounded-2xl border border-white/10 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-accent-glow" />
              <span>Grand Livre des Transactions Comptables</span>
            </h3>
            <p className="text-xs text-slate-400">
              Historique officiel et auditable de tous les flux financiers
            </p>
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">
            Aucune transaction enregistrée.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Réf. Transaction</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Description / Bénéficiaire</th>
                  <th className="py-3 px-4">Projet BDE</th>
                  <th className="py-3 px-4">Enregistré par</th>
                  <th className="py-3 px-4 rounded-r-lg text-right">Montant (DZD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((tx) => {
                  const isIncome = tx.type === 'INCOMING_FUNDS'
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-accent-glow">
                        {tx.transactionCode}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {new Date(tx.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isIncome
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {isIncome ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {isIncome ? 'Recette' : 'Dépense'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{tx.sourceOrPayee}</p>
                        <p className="text-[11px] text-slate-400">{tx.description}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {tx.project ? tx.project.title : 'Trésorerie Générale'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {tx.recordedBy.firstName} {tx.recordedBy.lastName}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-black text-sm ${
                          isIncome ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {new Intl.NumberFormat('fr-DZ', {
                          style: 'currency',
                          currency: 'DZD',
                          maximumFractionDigits: 0,
                        }).format(Number(tx.amount))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
