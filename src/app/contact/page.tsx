'use client'

import React, { useState } from 'react'
import {
  Mail,
  MapPin,
  Clock,
  Phone,
  Send,
  CheckCircle,
  MessageSquare,
  Shield,
} from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent-glow text-xs font-semibold mb-3">
          <MessageSquare className="w-4 h-4" />
          <span>Permanence & Assistance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Contactez le Bureau des Étudiants
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Une question sur un événement, un projet ou l&apos;adhésion au BDE ? L&apos;équipe est à votre disposition.
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
              Réponse garantie sous 24 à 48 heures ouvrées.
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
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
          {submitted ? (
            <div className="py-12 text-center space-y-3 animate-in fade-in">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Message Transmis avec Succès</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Merci pour votre prise de contact. Le pôle secrétariat du BDE vous répondra dans les plus brefs délais.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-4 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nom & Prénom
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
                    Email de contact
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sujet de votre demande
                </label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Ex: Demande de partenariat / Inscription Club"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Message
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

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs shadow-glow flex items-center gap-2 transition-all hover:scale-105"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer le Message</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
