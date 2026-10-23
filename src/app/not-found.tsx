import React from 'react'
import Link from 'next/link'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-glow">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
        404 — Page Introuvable
      </h1>
      <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md">
        La ressource que vous recherchez n&apos;existe pas ou a été déplacée par l&apos;administration du BDE.
      </p>
      <div className="pt-6 flex items-center gap-3">
        <Link
          href="/"
          className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs shadow-glow flex items-center gap-2 transition-all hover:scale-105"
        >
          <Home className="w-4 h-4" />
          <span>Retour à l&apos;Accueil</span>
        </Link>
      </div>
    </div>
  )
}
