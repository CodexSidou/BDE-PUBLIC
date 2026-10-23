'use client'

import React from 'react'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  PiggyBank,
  CheckCircle2,
  Info,
  DollarSign,
  PieChart,
} from 'lucide-react'
import { FinancialSummary, UserRole } from '@/types'
import { isFinanceManager } from '@/lib/permissions'

interface FinancialMetricsProps {
  summary: FinancialSummary
  userRole: UserRole
}

export default function FinancialMetrics({
  summary,
  userRole,
}: FinancialMetricsProps) {
  const isManager = isFinanceManager(userRole)

  const formatDZD = (val: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="space-y-6">
      {/* Read-Only Notice for BDE Members */}
      {!isManager && (
        <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-start gap-3">
          <Info className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-cyan-200">
            <p className="font-semibold text-cyan-300">
              Transparence Financière BDE (Mode Lecture Seule)
            </p>
            <p className="mt-0.5 text-cyan-200/80">
              En tant que membre officiel du BDE, vous avez une visibilité totale sur les investissements réalisés et engagés par projet, conformément aux principes de transparence démocratique d&apos;INSIM.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Solde Disponible */}
        <div className="p-5 rounded-2xl glass-card border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Solde Disponible Net
            </span>
            <div className="w-9 h-9 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent-glow">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-white tracking-tight">
            {formatDZD(summary.availableBalance)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Solde initial + Recettes - Dépenses - Réservé</span>
          </p>
        </div>

        {/* Total Investi & Payé */}
        <div className="p-5 rounded-2xl glass-card border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Total Dépenses Réglées
            </span>
            <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-white tracking-tight">
            {formatDZD(summary.totalPaidExpenses)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Paiements officiellement confirmés
          </p>
        </div>

        {/* Recettes Confirmées */}
        <div className="p-5 rounded-2xl glass-card border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Recettes & Cotisations
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-white tracking-tight">
            {formatDZD(summary.totalIncome)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Fonds encaissés et subventions
          </p>
        </div>

        {/* Fonds Réservés aux Projets */}
        <div className="p-5 rounded-2xl glass-card border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Budgets Réservés
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-white tracking-tight">
            {formatDZD(summary.totalReservedBudgets)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Engagés pour projets en cours
          </p>
        </div>
      </div>

      {/* Pending / Approval Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-navy-850/80 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Demandes de dépenses en attente</p>
              <p className="text-base font-bold text-white">
                {summary.pendingExpensesCount} demande(s) ({formatDZD(summary.pendingExpensesTotal)})
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-850/80 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-accent-glow">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Approuvées non encore décaissées</p>
              <p className="text-base font-bold text-white">
                {formatDZD(summary.approvedUnpaidTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project-by-Project Investments Breakdown Table */}
      <div className="glass-panel rounded-2xl border border-white/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-accent-glow" />
            <h3 className="text-base font-bold text-white">
              Répartition des Investissements par Projet
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {summary.projectInvestments.length} projet(s) audités
          </span>
        </div>

        {summary.projectInvestments.length === 0 ? (
          <p className="text-center py-6 text-sm text-slate-400">
            Aucun projet avec budget enregistré pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Projet BDE</th>
                  <th className="py-3 px-4">Budget Alloué</th>
                  <th className="py-3 px-4">Montant Investi (Payé)</th>
                  <th className="py-3 px-4">Taux d&apos;Exécution</th>
                  <th className="py-3 px-4 rounded-r-lg text-right">Solde Restant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {summary.projectInvestments.map((pi) => {
                  const percent =
                    pi.allocatedBudget > 0
                      ? Math.min(100, Math.round((pi.totalInvested / pi.allocatedBudget) * 100))
                      : 0
                  const remaining = Math.max(0, pi.allocatedBudget - pi.totalInvested)
                  return (
                    <tr key={pi.projectId} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {pi.projectTitle}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        {formatDZD(pi.allocatedBudget)}
                      </td>
                      <td className="py-3.5 px-4 text-accent-glow font-medium">
                        {formatDZD(pi.totalInvested)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-white/10 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                percent > 90
                                  ? 'bg-red-500'
                                  : percent > 60
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-300">
                            {percent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-400 font-semibold">
                        {formatDZD(remaining)}
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
