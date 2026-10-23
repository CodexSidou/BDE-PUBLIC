'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  KeyRound,
  UserCheck,
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault()
    setError(null)
    setLoading(true)

    const finalEmail = customEmail || email
    const finalPass = customPass || password

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: finalEmail, password: finalPass }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Erreur lors de la connexion')
      } else {
        const isBde = [
          'BDE_MEMBER',
          'PROJECT_MANAGER',
          'TREASURER',
          'VICE_PRESIDENT',
          'PRESIDENT',
        ].includes(data.user.role)

        if (isBde) {
          router.push('/dashboard/bde')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      }
    } catch (err) {
      setError('Erreur réseau. Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }

  // Quick 1-click test roles for testing all 8 roles
  const demoAccounts = [
    { role: 'Président', email: 'president@insim.edu', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
    { role: 'Vice-Président', email: 'vp@insim.edu', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
    { role: 'Trésorier', email: 'tresorier@insim.edu', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
    { role: 'Chef de Projet', email: 'chef.projet@insim.edu', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
    { role: 'Membre BDE', email: 'bde.sarah@insim.edu', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' },
    { role: 'Délégué', email: 'delegue.l3@insim.edu', color: 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10' },
    { role: 'Étudiant', email: 'etudiant.lydia@insim.edu', color: 'border-slate-500/40 text-slate-300 bg-slate-500/10' },
  ]

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent to-accent-electric flex items-center justify-center mx-auto mb-3 shadow-glow">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Espace Membre INSIM
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Connectez-vous avec vos identifiants académiques ou BDE
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-card">
          {error && (
            <div className="p-3 mb-5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Adresse Email Institutionnelle
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom.prenom@insim.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Mot de Passe
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-accent-glow hover:underline"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition-all hover:scale-[1.01] disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Se Connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Role Switcher */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-glow" />
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Connexion Rapide Démo (8 Rôles) :
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email)
                    setPassword('InsimConnect2026!')
                    handleLogin(undefined, acc.email, 'InsimConnect2026!')
                  }}
                  className={`text-left px-2.5 py-1.5 rounded-lg border text-[11px] transition-all hover:scale-[1.02] flex items-center justify-between ${acc.color}`}
                >
                  <span className="font-semibold truncate">{acc.role}</span>
                  <UserCheck className="w-3 h-3 opacity-70" />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2">
              Mot de passe universel démo : InsimConnect2026!
            </p>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Pas encore de compte étudiant ?{' '}
            <Link href="/register" className="text-accent-glow font-semibold hover:underline">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
