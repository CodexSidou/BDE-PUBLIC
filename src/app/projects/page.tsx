import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { FolderKanban, Users, Calendar, ArrowRight, DollarSign, Sparkles } from 'lucide-react'

export const revalidate = 0

export default async function PublicProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { isPublic: true },
    include: {
      manager: { select: { firstName: true, lastName: true } },
      budget: true,
      _count: { select: { memberships: true, tasks: true, events: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent-glow text-xs font-semibold mb-3">
          <FolderKanban className="w-4 h-4" />
          <span>Initiatives & Pôles Collaboratifs</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Projets & Réalisations du BDE
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Découvrez les pôles opérationnels de l&apos;institut, portés par les étudiants et financés par le Bureau des Étudiants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const budget = project.budget ? Number(project.budget.allocatedAmount) : 0
          return (
            <div
              key={project.id}
              className="p-6 rounded-3xl glass-panel border border-white/10 hover:border-accent/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold px-2.5 py-0.5 rounded-full bg-accent/20 text-accent-glow text-[10px] uppercase">
                    {project.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    {project.status}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-white tracking-tight line-clamp-1">
                  {project.title}
                </h2>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {project.description}
                </p>

                <div className="pt-2 text-xs text-slate-400 space-y-1">
                  <p>
                    Responsable :{' '}
                    <strong className="text-white">
                      {project.manager.firstName} {project.manager.lastName}
                    </strong>
                  </p>
                  <p className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-accent" />
                    <span>{project._count.memberships} membres d&apos;équipe actifs</span>
                  </p>
                </div>
              </div>

              <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">
                    Budget Alloué
                  </span>
                  <span className="font-bold text-white text-sm">
                    {new Intl.NumberFormat('fr-DZ', {
                      style: 'currency',
                      currency: 'DZD',
                      maximumFractionDigits: 0,
                    }).format(budget)}
                  </span>
                </div>

                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-xs border border-white/10 flex items-center gap-1 transition-colors"
                >
                  <span>Participer</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
