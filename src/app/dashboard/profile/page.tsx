import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/Sidebar'
import {
  User,
  Shield,
  Award,
  Calendar,
  Mail,
  GraduationCap,
  KeyRound,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  BookOpen
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const userSession = await getCurrentUser()
  if (!userSession) {
    redirect('/login?callback=/dashboard/profile')
  }

  const user = await prisma.user.findUnique({
    where: { id: userSession.id },
    include: {
      badges: { take: 1, orderBy: { createdAt: 'desc' } },
      assignedTasks: { take: 5, orderBy: { createdAt: 'desc' } },
      ideas: { take: 5, orderBy: { createdAt: 'desc' } },
    },
  })

  if (!user) {
    redirect('/login')
  }

  const activeBadge = user.badges?.[0]

  const roleLabels: Record<string, string> = {
    PRESIDENT: 'Président du BDE',
    VICE_PRESIDENT: 'Vice-Président du BDE',
    TREASURER: 'Trésorier Général',
    PROJECT_MANAGER: 'Chef de Projet / Pôle',
    BDE_MEMBER: 'Membre Actif du BDE',
    CLASS_DELEGATE: 'Délégué de Promotion',
    STUDENT: 'Étudiant INSIM',
    VISITOR: 'Visiteur Externe',
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar user={userSession} />

      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <User className="w-7 h-7 text-accent" />
              Profil Utilisateur & Compte
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Gérez vos informations académiques, vos autorisations BDE et votre sécurité d&apos;accès.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/badges"
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold bg-accent/20 hover:bg-accent/30 text-accent-glow border border-accent/40 transition-all shadow-glow"
            >
              <Award className="w-4 h-4" />
              Voir mon Badge INSIM ID
            </Link>
          </div>
        </div>

        {/* User Identity Hero Card */}
        <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-accent to-accent-electric flex items-center justify-center font-black text-white text-3xl sm:text-4xl shadow-glow flex-shrink-0">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {user.firstName} {user.lastName}
                </h2>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent-glow flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {roleLabels[user.role] || user.role}
                </span>
                {activeBadge && (
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Badge Certifié {activeBadge.status}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-500" />
                  <span>Matricule : <strong className="text-white font-mono">{user.studentNumber || 'N/A'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Filière : <strong className="text-white">{user.department || 'Management & IT'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Promotion : <strong className="text-white">{user.studyYear || '2025/2026'}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Inscrit le : <strong className="text-white">{new Date(user.createdAt).toLocaleDateString('fr-FR')}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Academic & Mandate Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent-glow flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Informations Pédagogiques & Mandat
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-navy-850/60 border border-white/5 space-y-1">
                  <span className="text-slate-500">Institut</span>
                  <p className="font-semibold text-white">Institut Supérieur de Management et d&apos;Informatique (INSIM)</p>
                </div>
                <div className="p-4 rounded-xl bg-navy-850/60 border border-white/5 space-y-1">
                  <span className="text-slate-500">Niveau d&apos;Études</span>
                  <p className="font-semibold text-white">{user.studyYear || 'Cycle Supérieur'}</p>
                </div>
                <div className="p-4 rounded-xl bg-navy-850/60 border border-white/5 space-y-1">
                  <span className="text-slate-500">Pôle ou Département BDE</span>
                  <p className="font-semibold text-white">{user.department || 'Général'}</p>
                </div>
                <div className="p-4 rounded-xl bg-navy-850/60 border border-white/5 space-y-1">
                  <span className="text-slate-500">Statut du Compte</span>
                  <p className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Actif & Vérifié
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Contributions */}
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent-glow flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Mes Contributions Récentes
              </h3>

              {user.ideas.length === 0 && user.assignedTasks.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  Aucune activité récente enregistrée. Participez aux projets ou proposez une idée !
                </div>
              ) : (
                <div className="space-y-3">
                  {user.ideas.map((idea) => (
                    <div key={idea.id} className="p-3.5 rounded-xl bg-navy-850/50 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-white">{idea.title}</p>
                        <p className="text-slate-500 text-[10px]">Idée soumise le {new Date(idea.createdAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent/10 text-accent-glow border border-accent/20">
                        {idea.status}
                      </span>
                    </div>
                  ))}
                  {user.assignedTasks.map((task) => (
                    <div key={task.id} className="p-3.5 rounded-xl bg-navy-850/50 border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-white">{task.title}</p>
                        <p className="text-slate-500 text-[10px]">Tâche BDE assignée</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Security & Password */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent-glow flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Sécurité & Authentification
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Votre session est protégée par un chiffrement JWT sécurisé avec cookie HttpOnly SameSite.
              </p>

              <div className="p-4 rounded-xl bg-navy-850/80 border border-white/5 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Authentification Double Facteur</span>
                  <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">Optionnel</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Signature QR Badge</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">HMAC-SHA256</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/forgot-password"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-3.5 h-3.5 text-accent-glow" />
                  Mettre à jour mon mot de passe
                </Link>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Liens Rapides
              </h3>
              <div className="space-y-1.5 text-xs">
                <Link
                  href="/dashboard/notifications"
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                >
                  <span>Centre de Notifications</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/dashboard/events"
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                >
                  <span>Événements INSIM</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                >
                  <span>Support Technique BDE</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
