import React from 'react'
import { redirect } from 'next/navigation'
import {
  ShieldAlert,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Activity,
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { isExecutive } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export const revalidate = 0

export default async function AuditLogsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const isFinanceOrExec = [
    'TREASURER',
    'VICE_PRESIDENT',
    'PRESIDENT',
  ].includes(user.role)

  if (!isFinanceOrExec) {
    redirect('/dashboard')
  }

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Journal d&apos;Audit & Sécurité
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30">
              Conformité ISO / OWASP
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Traçabilité immuable des opérations administratives, approbations financières et révocations de badges
          </p>
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Horodatage</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Opérateur</th>
                <th className="py-3 px-4">Ressource</th>
                <th className="py-3 px-4">Résultat</th>
                <th className="py-3 px-4 rounded-r-lg">Détails</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('fr-FR')}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-accent-glow">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {log.actorEmail || 'Système'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 uppercase text-[10px] font-semibold">
                    {log.resourceType}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.result === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {log.result === 'SUCCESS' ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {log.result}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px] max-w-xs truncate">
                    {log.details || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
