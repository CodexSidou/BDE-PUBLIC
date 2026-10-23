'use client'

import React, { useState } from 'react'
import {
  Settings,
  Shield,
  Key,
  Database,
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  Server,
  Lock,
  Globe,
  Bell,
  RefreshCw,
  Users,
  Award,
  Calendar,
  FolderKanban
} from 'lucide-react'
import { SessionUser } from '@/types'

interface Props {
  user: SessionUser
  stats: {
    usersCount: number
    projectsCount: number
    eventsCount: number
    badgesCount: number
  }
}

export default function SettingsClient({ user, stats }: Props) {
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    message: '',
    link: '/dashboard',
  })
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setBroadcasting(true)
    setStatusMsg(null)

    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(broadcastData),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la diffusion')
      }

      setStatusMsg({
        type: 'success',
        text: `Communiqué diffusé avec succès à ${data.count} utilisateurs actifs sur la plateforme !`,
      })
      setBroadcastData({ title: '', message: '', link: '/dashboard' })
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Échec de la diffusion' })
    } finally {
      setBroadcasting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Settings className="w-7 h-7 text-accent" />
            Paramètres & Administration Système
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gérez la configuration globale, la sécurité cryptographique des badges et la diffusion des communiqués BDE.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-accent/20 border border-accent/40 text-accent-glow flex items-center gap-2 shadow-glow">
            <Shield className="w-3.5 h-3.5" />
            Espace Direction (Président & VP)
          </span>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-xl text-xs border flex items-center justify-between animate-in fade-in ${
            statusMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Grid Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-4 h-4 text-accent" /> Utilisateurs
          </div>
          <p className="text-2xl font-black text-white mt-1.5">{stats.usersCount}</p>
          <p className="text-[10px] text-emerald-400 mt-1">Comptes synchronisés</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <FolderKanban className="w-4 h-4 text-blue-400" /> Projets BDE
          </div>
          <p className="text-2xl font-black text-white mt-1.5">{stats.projectsCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">En base de données</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-amber-400" /> Événements
          </div>
          <p className="text-2xl font-black text-white mt-1.5">{stats.eventsCount}</p>
          <p className="text-[10px] text-slate-400 mt-1">Programmes campus</p>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <Award className="w-4 h-4 text-emerald-400" /> Badges ID
          </div>
          <p className="text-2xl font-black text-white mt-1.5">{stats.badgesCount}</p>
          <p className="text-[10px] text-emerald-400 mt-1">Signatures HMAC valides</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Broadcast announcement */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Broadcast Tool */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/20 border border-accent/30 text-accent-glow">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Diffusion Immédiate d&apos;un Communiqué BDE</h2>
                <p className="text-xs text-slate-400">
                  Envoie instantanément une notification système en temps réel à TOUS les étudiants inscrits sur le site.
                </p>
              </div>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Objet du Communiqué *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Réunion générale de rentrée, Nouvel événement culturel..."
                  value={broadcastData.title}
                  onChange={(e) => setBroadcastData({ ...broadcastData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Message officiel complet *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Rédigez l'annonce officielle qui sera transmise dans le centre de notifications de chaque étudiant..."
                  value={broadcastData.message}
                  onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Lien de redirection (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="/events ou /dashboard/projects..."
                  value={broadcastData.link}
                  onChange={(e) => setBroadcastData({ ...broadcastData, link: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs text-slate-300 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-accent hover:bg-accent-hover text-white transition-all shadow-glow hover:scale-[1.02] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {broadcasting ? 'Diffusion en cours...' : 'Diffuser le communiqué à tous les étudiants'}
                </button>
              </div>
            </form>
          </div>

          {/* Platform Identity */}
          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent-glow flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Identité de l&apos;Organisation & Domaine
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-navy-850/60 border border-white/5 space-y-1">
                <span className="text-slate-500">Organisation</span>
                <p className="font-semibold text-white">Bureau des Étudiants INSIM (BDE)</p>
              </div>
              <div className="p-4 rounded-xl bg-navy-850/60 border border-white/5 space-y-1">
                <span className="text-slate-500">Devise Officielle</span>
                <p className="font-semibold text-white">&quot;Plus qu&apos;une école, une communauté&quot;</p>
              </div>
              <div className="p-4 rounded-xl bg-navy-850/60 border border-white/5 space-y-1">
                <span className="text-slate-500">Mandat Actif</span>
                <p className="font-semibold text-white">2025 / 2026</p>
              </div>
              <div className="p-4 rounded-xl bg-navy-850/60 border border-white/5 space-y-1">
                <span className="text-slate-500">Email Officiel</span>
                <p className="font-semibold text-white">contact@insim-connect.dz</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Infrastructure */}
        <div className="space-y-6">
          {/* Security & Cryptography */}
          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent-glow flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Sécurité & Intégrité Cryptographique
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-navy-850/80 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Signature QR Badge</p>
                  <p className="text-[10px] text-slate-500">HMAC-SHA256 Anti-Falsification</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Actif
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-850/80 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Chiffrement Session</p>
                  <p className="text-[10px] text-slate-500">JWT HttpOnly SameSite=Lax</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Sécurisé
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-850/80 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Scan & Vérification QR</p>
                  <p className="text-[10px] text-slate-500">Route /verify/[code]</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Opérationnel
                </span>
              </div>
            </div>
          </div>

          {/* Neon Cloud Database */}
          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent-glow flex items-center gap-2">
              <Database className="w-4 h-4" />
              Infrastructure Neon PostgreSQL
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-xl bg-navy-850/80 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Base Principale</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Connecté
                  </span>
                </div>
                <p className="font-mono text-[11px] text-white">insim_connect_db</p>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-850/80 border border-white/5 space-y-1">
                <span className="text-slate-400">Mode de Réplication</span>
                <p className="font-semibold text-white">Neon Serverless Pooler (SSL)</p>
              </div>

              <div className="p-3.5 rounded-xl bg-navy-850/80 border border-white/5 space-y-1">
                <span className="text-slate-400">Synchronisation GitHub & Vercel</span>
                <p className="font-semibold text-white">Déploiement Continu Automatique</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
