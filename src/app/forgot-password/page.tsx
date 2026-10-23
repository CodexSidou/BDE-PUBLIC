'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Shield, Mail, ArrowLeft, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Simulate validation & security reset procedure
      await new Promise((resolve) => setTimeout(resolve, 800))

      if (!email.includes('@')) {
        setError('Veuillez saisir une adresse email institutionnelle valide.')
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch {
      setError('Une erreur est survenue. Veuillez contacter le support BDE.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass-panel p-8 sm:p-10 rounded-3xl border border-white/10 shadow-card">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-accent to-accent-electric flex items-center justify-center mx-auto shadow-glow mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Réinitialisation du mot de passe
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Saisissez votre email universitaire pour recevoir les instructions sécurisées de réinitialisation.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Instructions transmises !</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Si un compte existe pour <span className="text-white font-semibold">{email}</span>, un lien sécurisé à usage unique y a été envoyé. Pensez à vérifier vos courriers indésirables.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-navy-850/80 border border-white/5 text-left text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-accent-glow" />
                Besoin d&apos;aide immédiate ?
              </p>
              <p>
                Vous pouvez également vous adresser directement au pôle informatique du BDE à l&apos;accueil INSIM ou écrire à <span className="text-accent-glow">contact@insim-connect.dz</span>.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-bold text-sm bg-accent hover:bg-accent-light text-white transition-all shadow-glow"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à la page de connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-300 mb-2">
                Adresse Email Universitaire
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="prenom.nom@insim.dz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-navy-900/80 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-accent to-accent-electric hover:opacity-95 text-white transition-all shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Envoyer les instructions'
              )}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retour à la connexion
              </Link>
              <Link
                href="/contact"
                className="text-accent-glow hover:underline"
              >
                Contacter le BDE
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
