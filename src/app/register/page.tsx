'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Shield,
  User,
  Mail,
  Lock,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Building,
} from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentNumber: '',
    department: 'Informatique & Systèmes d\'Information',
    studyYear: 'Licence 1',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit comporter au moins 8 caractères.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          studentNumber: formData.studentNumber || undefined,
          department: formData.department,
          studyYear: formData.studyYear,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Erreur lors de l\'inscription.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('Impossible de joindre le serveur.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-accent to-accent-electric flex items-center justify-center mx-auto mb-3 shadow-glow">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Créer un Compte Étudiant
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rejoignez l&apos;écosystème numérique officiel INSIM CONNECT
          </p>
        </div>

        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-card">
          {error && (
            <div className="p-3 mb-5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Ex: Sarah"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Ex: Touati"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Étudiant / Personnel
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="votre.nom@insim.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  N° Étudiant (Optionnel)
                </label>
                <input
                  type="text"
                  value={formData.studentNumber}
                  onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                  placeholder="INS-2026-XXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Niveau d&apos;études
                </label>
                <select
                  value={formData.studyYear}
                  onChange={(e) => setFormData({ ...formData, studyYear: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                >
                  <option value="Licence 1">Licence 1 (L1)</option>
                  <option value="Licence 2">Licence 2 (L2)</option>
                  <option value="Licence 3">Licence 3 (L3)</option>
                  <option value="Master 1">Master 1 (M1)</option>
                  <option value="Master 2">Master 2 (M2)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Filière Académique
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
              >
                <option value="Informatique & Systèmes d'Information">
                  Informatique & Systèmes d&apos;Information
                </option>
                <option value="Intelligence Artificielle & Data Science">
                  Intelligence Artificielle & Data Science
                </option>
                <option value="Management & Commerce International">
                  Management & Commerce International
                </option>
                <option value="Finance, Banque & Comptabilité">
                  Finance, Banque & Comptabilité
                </option>
                <option value="Marketing Digital & Communication">
                  Marketing Digital & Communication
                </option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min. 8 caractères"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirmer
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Répétez"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Créer mon Compte</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Déjà inscrit ?{' '}
            <Link href="/login" className="text-accent-glow font-semibold hover:underline">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
