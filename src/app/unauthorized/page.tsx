import React from 'react'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 text-center space-y-6 shadow-card">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-glow">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Code Erreur 403 • Accès Restreint
          </span>
          <h1 className="mt-4 text-2xl font-black text-white tracking-tight">
            Autorisation Insuffisante
          </h1>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            Cette ressource ou ce module de gouvernance nécessite des privilèges supérieurs (Bureau Exécutif, Pôle Trésorerie ou Présidence BDE).
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-navy-850/80 border border-white/5 text-left text-xs text-slate-400 space-y-1.5">
          <p className="font-semibold text-white flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-accent-glow" />
            Contrôle d&apos;Accès Basé sur les Rôles (RBAC)
          </p>
          <p>
            Si vous pensez qu&apos;il s&apos;agit d&apos;une anomalie de synchronisation avec votre statut étudiant ou mandat BDE, veuillez contacter un administrateur système.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/dashboard"
            className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-accent hover:bg-accent-light text-white transition-all shadow-glow flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Mon Espace
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
