import React from 'react'
import Link from 'next/link'
import {
  Shield,
  FolderKanban,
  Award,
  CreditCard,
  Calendar,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Users,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const revalidate = 0

export default async function HomePage() {
  const user = await getCurrentUser()

  // Fetch real statistics from database
  const [
    usersCount,
    projectsCount,
    eventsCount,
    badgesCount,
    recentAnnouncements,
    featuredProjects,
    upcomingEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count({ where: { isPublic: true } }),
    prisma.event.count({ where: { isPublic: true, status: 'UPCOMING' } }),
    prisma.digitalBadge.count({ where: { status: 'VALID' } }),
    prisma.announcement.findMany({
      where: { isPublic: true },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      include: { author: { select: { firstName: true, lastName: true } } },
    }),
    prisma.project.findMany({
      where: { isPublic: true },
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        budget: true,
        manager: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.event.findMany({
      where: { isPublic: true },
      take: 2,
      orderBy: { startsAt: 'asc' },
      include: { organizer: { select: { firstName: true, lastName: true } } },
    }),
  ])

  return (
    <div className="relative overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-accent-electric/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent-glow text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Plateforme Officielle du Bureau des Étudiants INSIM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.1]">
            L&apos;Écosystème Numérique de la Vie Étudiante à{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-cyan">
              l&apos;INSIM
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Centralisez vos projets collaboratifs, suivez les investissements BDE en toute transparence, accédez à votre badge officiel <strong>INSIM ID</strong> certifié par QR code et façonnez le campus de demain.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <span>Accéder à mon Espace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <span>Rejoindre la Communauté</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 flex items-center justify-center transition-all"
                >
                  <span>Connexion Étudiant & BDE</span>
                </Link>
              </>
            )}
            <Link
              href="/verify"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white font-medium text-sm border border-white/10 flex items-center justify-center gap-2 transition-all"
            >
              <Award className="w-4 h-4 text-accent-glow" />
              <span>Vérifier un Badge QR</span>
            </Link>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-card border border-white/10 text-center">
            <Users className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-3xl font-black text-white tracking-tight">
              {usersCount}+
            </p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
              Étudiants & Membres BDE
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10 text-center">
            <FolderKanban className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="text-3xl font-black text-white tracking-tight">
              {projectsCount}
            </p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
              Projets & Pôles BDE
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10 text-center">
            <Calendar className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="text-3xl font-black text-white tracking-tight">
              {eventsCount}
            </p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
              Événements Programmés
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-white/10 text-center">
            <Award className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <p className="text-3xl font-black text-white tracking-tight">
              {badgesCount}
            </p>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">
              Badges INSIM ID Certifiés
            </p>
          </div>
        </div>
      </section>

      {/* Core Platform Pillars */}
      <section className="py-16 bg-navy-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-accent-glow uppercase tracking-wider">
              Une Architecture d&apos;Excellence
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Tout ce dont le BDE et les étudiants ont besoin
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl glass-panel border border-white/10 hover:border-accent/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent-glow mb-4 group-hover:scale-110 transition-transform">
                <FolderKanban className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Gestion de Projets & Collaborations
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tableaux Kanban, assignation des responsabilités, suivi des échéances, documents partagés et liens de partage sécurisés par token.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl glass-panel border border-white/10 hover:border-accent/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                INSIM ID : Badges & QR Cryptographique
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cartes de membre numériques officielles avec vérification instantanée par QR code. Statuts certifiés (Valide, Expiré, Révoqué) sans fuite de données personnelles.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl glass-panel border border-white/10 hover:border-accent/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Gouvernance & Transparence Financière
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Suivi au centime près des investissements par projet, gestion des demandes de dépenses avec règle d&apos;or anti-auto-approbation et grand livre auditable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Projets BDE en Cours
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Initiatives stratégiques portées par les équipes étudiantes
            </p>
          </div>
          <Link
            href="/projects"
            className="flex items-center gap-1.5 text-xs font-semibold text-accent-glow hover:text-accent-cyan transition-colors"
          >
            <span>Voir tous les projets</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((p) => {
            const budget = p.budget ? Number(p.budget.allocatedAmount) : 0
            return (
              <div
                key={p.id}
                className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent-glow border border-accent/30 uppercase">
                      {p.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {p.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 line-clamp-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
                    {p.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">
                      Budget Alloué
                    </span>
                    <span className="font-bold text-white">
                      {new Intl.NumberFormat('fr-DZ', {
                        style: 'currency',
                        currency: 'DZD',
                        maximumFractionDigits: 0,
                      }).format(budget)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase block">
                      Responsable
                    </span>
                    <span className="font-medium text-slate-300">
                      {p.manager.firstName} {p.manager.lastName[0]}.
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Latest Announcements Banner */}
      <section className="py-12 bg-navy-900/60 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">
              Dernières Annonces Officielles
            </h2>
            <Link
              href="/news"
              className="text-xs text-accent-glow hover:underline font-semibold"
            >
              Consulter le journal
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentAnnouncements.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl bg-navy-850/60 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400">
                  <span className="font-semibold text-accent-cyan">
                    {a.category}
                  </span>
                  <span>{new Date(a.publishedAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1 mb-1">
                  {a.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {a.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
