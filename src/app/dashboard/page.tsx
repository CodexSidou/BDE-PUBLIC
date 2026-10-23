import React from 'react'
import Link from 'next/link'
import {
  Calendar,
  CheckSquare,
  Award,
  Bell,
  Sparkles,
  ArrowRight,
  Lightbulb,
  Clock,
  MapPin,
  FolderKanban,
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const revalidate = 0

export default async function StudentDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Fetch student personalized data
  const [badges, registrations, assignedTasks, notifications, recentIdeas] =
    await Promise.all([
      prisma.digitalBadge.findMany({
        where: { userId: user.id },
        include: { project: { select: { title: true } } },
      }),
      prisma.eventRegistration.findMany({
        where: { userId: user.id },
        include: { event: true },
        take: 3,
        orderBy: { event: { startsAt: 'asc' } },
      }),
      prisma.task.findMany({
        where: { assigneeId: user.id },
        include: { project: { select: { title: true } } },
        take: 4,
        orderBy: { dueDate: 'asc' },
      }),
      prisma.notification.findMany({
        where: { userId: user.id },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.idea.findMany({
        where: { authorId: user.id },
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
    ])

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-navy-850 via-navy-900 to-navy-950 border border-white/10 relative overflow-hidden shadow-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent-glow text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Espace Personnel Étudiant</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Bienvenue, {user.firstName} {user.lastName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Filière : {user.department || 'Non renseignée'} • {user.studyYear || 'L1'} • N°{' '}
              <span className="font-mono text-accent-glow">
                {user.studentNumber || 'INSIM-2026'}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/badges"
              className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all hover:scale-105"
            >
              <Award className="w-4 h-4" />
              <span>Mon Badge INSIM ID</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Tasks & Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned Tasks */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Mes Tâches Assignées</h3>
              </div>
              <Link
                href="/dashboard/tasks"
                className="text-xs text-accent-glow hover:underline font-medium"
              >
                Voir tout
              </Link>
            </div>

            {assignedTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Aucune tâche ne vous est assignée pour le moment.
              </p>
            ) : (
              <div className="space-y-2.5">
                {assignedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-navy-850/70 border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">{t.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Projet : {t.project.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered Upcoming Events */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent-glow" />
                <h3 className="text-sm font-bold text-white">
                  Mes Événements Inscrits
                </h3>
              </div>
              <Link
                href="/events"
                className="text-xs text-accent-glow hover:underline font-medium"
              >
                Découvrir le calendrier
              </Link>
            </div>

            {registrations.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Vous n&apos;êtes inscrit à aucun événement pour l&apos;instant.{' '}
                <Link href="/events" className="text-accent-glow underline">
                  Parcourir les événements
                </Link>
              </p>
            ) : (
              <div className="space-y-2.5">
                {registrations.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-navy-850/70 border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {r.event.title}
                      </p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-accent" />
                        <span>{r.event.location}</span>
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-300">
                      {new Date(r.event.startsAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Badges & Notifications */}
        <div className="space-y-6">
          {/* Badge Preview Card */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Mon Statut INSIM ID</h3>
              </div>
            </div>

            {badges.length > 0 ? (
              <div className="p-4 rounded-xl bg-navy-850/80 border border-accent/30 text-center space-y-2">
                <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {badges[0].status}
                </span>
                <p className="text-xs font-bold text-white">{badges[0].roleTitle}</p>
                <p className="text-[10px] font-mono text-accent-glow font-bold">
                  {badges[0].badgeCode}
                </p>
                <Link
                  href="/dashboard/badges"
                  className="inline-block text-xs text-accent-glow hover:underline pt-2 font-medium"
                >
                  Télécharger / Imprimer la carte
                </Link>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-navy-850/50 border border-white/5 text-center text-xs text-slate-400 space-y-2">
                <p>Aucun badge de fonction actif.</p>
                <Link
                  href="/dashboard/badges"
                  className="text-accent-glow hover:underline block text-xs"
                >
                  Générer mon badge étudiant
                </Link>
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="glass-panel p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Notifications</h3>
              </div>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">
                Toutes les notifications ont été lues.
              </p>
            ) : (
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-xs ${
                      n.isRead
                        ? 'bg-navy-850/40 border-white/5 text-slate-400'
                        : 'bg-navy-850/90 border-accent/30 text-white font-medium'
                    }`}
                  >
                    <p className="font-semibold">{n.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
