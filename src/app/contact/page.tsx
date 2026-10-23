'use client'

import React, { useState } from 'react'
import {
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  MessageSquare,
  Tag,
  AlertTriangle,
  Loader2,
  Sparkles,
} from 'lucide-react'

const CATEGORIES = [
  'Événements & Billetterie',
  'Adhésion & BDE',
  'Partenariat & Sponsoring',
  'Clubs & Vie Étudiante',
  'Pédagogie & Réclamation',
  'Autre',
]

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    category: CATEGORIES[0],
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du message')
      }

      setSubmitted(true)
      setForm({
        name: '',
        email: '',
        subject: '',
        category: CATEGORIES[0],
        message: '',
      })
    } catch (err: any) {
      setError(err.message || 'Une erreur inattendue est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10 sm:space-y-12">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent-glow text-xs font-semibold mb-3">
          <MessageSquare className="w-4 h-4" />
          <span>Permanence & Assistance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Contactez le Bureau des Étudiants
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Une question sur un événement, un projet ou l&apos;adhésion au BDE ? L&apos;équipe exécutive reçoit directement vos messages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent-glow">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Local BDE & Campus</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Institut Supérieur de Management et d&apos;Informatique (INSIM), Campus Principal, Alger, Algérie.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Email Officiel</h3>
            <p className="text-xs text-slate-400 font-mono">
              bde@insim-student.edu
            </p>
            <p className="text-[11px] text-slate-500">
              Transmission automatique à la Présidence et au Secrétariat Général.
            </p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Horaires de Permanence</h3>
            <p className="text-xs text-slate-400">
              Du Dimanche au Jeudi : 09h00 - 16h30
            </p>
          </div>
        </div>

        {/* Message Form */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 shadow-glow">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-bold text-white">Message Transmis avec Succès !</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Votre demande a bien été enregistrée et transmise directement au Président et au Vice-Président du BDE. Une notification prioritaire a été envoyée à leur tableau de bord.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nom & Prénom <span className="text-accent-glow">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Votre nom complet"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email de contact <span className="text-accent-glow">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="votre.email@insim.edu"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Category selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catégorie du message <span className="text-accent-glow">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = form.category === cat
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setForm({ ...form, category: cat })}
                        className={`text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-accent/20 border-accent text-accent-glow shadow-glow'
                            : 'bg-navy-900/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <Tag className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{cat}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sujet de votre demande <span className="text-accent-glow">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Ex: Demande de partenariat / Question adhésion"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Message détaillé <span className="text-accent-glow">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Écrivez votre message détaillé ici..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-accent-glow" />
                  <span>Transmis en temps réel au Bureau Exécutif</span>
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-bold text-xs shadow-glow flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Transmission...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer le Message</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
