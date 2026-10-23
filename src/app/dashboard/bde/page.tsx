import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  FolderKanban,
  CheckSquare,
  Users,
  CreditCard,
  PlusCircle,
  Award,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { isBdeStaff, isFinanceManager } from '@/lib/permissions'
import { getFinancialSummary } from '@/lib/finance'
import { prisma } from '@/lib/prisma'
import FinancialMetrics from '@/components/FinancialMetrics'

export const revalidate = 0

export default async function BdeDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  if (!isBdeStaff(user.role)) {
    redirect('/dashboard') // Normal students redirected to student dashboard
  }

  // Fetch BDE operational metrics
  const [projects, tasks, summary, pendingExpenses] = await Promise.all([
    prisma.project.findMany({
      include: {
        budget: true,
        manager: { select: { firstName: true, lastName: true } },
        _count: { select: { tasks: true, memberships: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 4,
    }),
    prisma.task.findMany({
      include: {
        project: { select: { title: true } },
        assignee: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    getFinancialSummary(user.role),
    prisma.expenseRequest.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } },
      include: {
        requester: { select: { firstName: true, lastName: true } },
        project: { select: { title: true } },
      },
      take: 3,
    }),
  ])

  const isFinance = isFinanceManager(user.role)

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-850 via-navy-900 to-navy-950 border border-white/10 relative overflow-hidden shadow-card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-accent-cyan text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Console Centrale du Bureau des Étudiants</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Espace BDE INSIM • Mandat en Cours
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Connecté en tant que{' '}
              <strong className="text-white">{user.firstName} {user.lastName}</strong> (
              <span className="text-accent-glow font-bold">{user.role}</span>)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/dashboard/expenses"
              className="px-4 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-bold border border-white/10 flex items-center gap-2 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Demande de Dépense</span>
            </Link>
            <Link
              href="/dashboard/tasks"
              className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nouvelle Tâche</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Financial Section (Mandatory Transparency for normal BDE members, Full Ledger for Finance Managers) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isFinance
                ? 'Tableau de Bord Financier & Trésorerie BDE'
                : 'Transparence Financière & Suivi des Investissements BDE'}
            </h2>
            <p className="text-xs text-slate-400">
              {isFinance
                ? 'Gestion intégrale des flux financiers, autorisations et décaissements'
                : 'Accès en lecture seule aux investissements et budgets engagés par projet'}
            </p>
          </div>
          <Link
            href="/dashboard/finances"
            className="text-xs text-accent-glow hover:underline font-semibold flex items-center gap-1"
          >
            <span>Ouvrir le grand livre</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <FinancialMetrics summary={summary} userRole={user.role} />
      </div>

      {/* Projects & Tasks Operational Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="w-4 h-4 text-accent-glow" />
              <h3 className="text-sm font-bold text-white">Projets Actifs du BDE</h3>
            </div>
            <Link
              href="/dashboard/projects"
              className="text-xs text-accent-glow hover:underline font-medium"
            >
              Tous les projets
            </Link>
          </div>

          <div className="space-y-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="p-3.5 rounded-xl bg-navy-850/70 border border-white/5 flex items-center justify-between"
              >
                <div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-accent/20 text-accent-glow uppercase">
                    {p.category}
                  </span>
                  <p className="text-xs font-bold text-white mt-1">{p.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Responsable : {p.manager.firstName} {p.manager.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-400 block">
                    {new Intl.NumberFormat('fr-DZ', {
                      style: 'currency',
                      currency: 'DZD',
                      maximumFractionDigits: 0,
                    }).format(p.budget ? Number(p.budget.allocatedAmount) : 0)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {p._count.tasks} tâche(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Avancement des Tâches</h3>
            </div>
            <Link
              href="/dashboard/tasks"
              className="text-xs text-accent-glow hover:underline font-medium"
            >
              Tableau Kanban
            </Link>
          </div>

          <div className="space-y-2.5">
            {tasks.map((t) => (
              <div
                key={t.id}
                className="p-3 rounded-xl bg-navy-850/70 border border-white/5 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-semibold text-white">{t.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {t.project.title} • Assigné à :{' '}
                    {t.assignee
                      ? `${t.assignee.firstName} ${t.assignee.lastName}`
                      : 'Non assigné'}
                  </p>
                </div>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    t.status === 'COMPLETED'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : t.status === 'IN_PROGRESS'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-slate-500/20 text-slate-300'
                  }`}
                >
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
