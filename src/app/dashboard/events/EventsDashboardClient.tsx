'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Users,
  CheckCircle2,
  Ticket,
  Search,
  ExternalLink,
  ShieldCheck,
  X,
  AlertCircle,
  QrCode,
} from 'lucide-react'
import { SessionUser } from '@/types'
import { isBdeStaff } from '@/lib/permissions'

interface EventItem {
  id: string
  title: string
  slug: string
  description: string
  location: string
  startsAt: string
  endsAt: string
  capacity?: number | null
  status: string
  organizer: {
    id: string
    firstName: string
    lastName: string
    email?: string
  }
  registrations: Array<{
    id: string
    attended?: boolean
  }>
  _count: {
    registrations: number
  }
}

export default function EventsDashboardClient({
  user,
  initialEvents,
}: {
  user: SessionUser
  initialEvents: EventItem[]
}) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'UPCOMING' | 'REGISTERED' | 'ALL'>('UPCOMING')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canCreate = isBdeStaff(user.role)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Amphithéâtre INSIM & Campus',
    startDate: '',
    endDate: '',
    maxAttendees: '150',
    requiresTicket: false,
    ticketPrice: '0',
  })

  const now = new Date()

  const filteredEvents = events.filter((ev) => {
    const evDate = new Date(ev.startsAt)
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.location.toLowerCase().includes(search.toLowerCase()) ||
      ev.description.toLowerCase().includes(search.toLowerCase())

    if (!matchesSearch) return false

    if (filter === 'UPCOMING') return evDate >= now
    if (filter === 'REGISTERED') return ev.registrations && ev.registrations.length > 0
    return true
  })

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          location: formData.location,
          startDate: formData.startDate,
          endDate: formData.endDate,
          maxAttendees: parseInt(formData.maxAttendees) || null,
          requiresTicket: formData.requiresTicket,
          ticketPrice: parseFloat(formData.ticketPrice) || 0,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la création de l'événement")
      }

      setEvents([{ ...data.event, registrations: data.event.registrations || [] }, ...events])
      setIsModalOpen(false)
      setFormData({
        title: '',
        description: '',
        location: 'Amphithéâtre INSIM & Campus',
        startDate: '',
        endDate: '',
        maxAttendees: '150',
        requiresTicket: false,
        ticketPrice: '0',
      })
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Calendar className="w-7 h-7 text-accent" />
            Événements & Vie du Campus INSIM
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Participez aux conférences, workshops techniques, journées d&apos;intégration et tournois.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canCreate && (
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
              title="Scanner les billets QR à l'entrée"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              Contrôle d&apos;Accès QR
            </Link>
          )}

          {canCreate && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-accent hover:bg-accent-light text-white transition-all shadow-glow"
            >
              <Plus className="w-4 h-4" />
              Créer un Événement
            </button>
          )}
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher par titre ou lieu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-850 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('UPCOMING')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'UPCOMING'
                ? 'bg-accent text-white shadow-glow'
                : 'bg-navy-850/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            À venir
          </button>
          <button
            onClick={() => setFilter('REGISTERED')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'REGISTERED'
                ? 'bg-accent text-white shadow-glow'
                : 'bg-navy-850/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Mes Inscriptions
          </button>
          <button
            onClick={() => setFilter('ALL')}
            className={`py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
              filter === 'ALL'
                ? 'bg-accent text-white shadow-glow'
                : 'bg-navy-850/60 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            Tous les événements
          </button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full py-16 text-center glass-panel rounded-3xl border border-white/10 space-y-3">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-white font-bold text-sm">Aucun événement à afficher</p>
            <p className="text-xs text-slate-400">
              Ajustez vos filtres ou revenez prochainement pour découvrir le calendrier BDE.
            </p>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const startDate = new Date(ev.startsAt)
            const isRegistered = ev.registrations && ev.registrations.length > 0
            const max = ev.capacity || 100
            const count = ev._count.registrations
            const pct = Math.min(100, Math.round((count / max) * 100))

            return (
              <div
                key={ev.id}
                className="p-6 rounded-2xl glass-card border border-white/10 flex flex-col justify-between hover:border-accent/40 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-amber-400 border border-white/10 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {startDate.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>

                    {isRegistered ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Inscrit
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/10 text-accent-glow border border-accent/30">
                        {ev.status}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-accent-glow transition-colors">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-1 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{ev.location}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span>Entrée Libre / Membres INSIM</span>
                    </div>
                  </div>

                  {/* Attendance Capacity */}
                  <div className="space-y-1 pt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Inscrits</span>
                      <span className="font-semibold text-white">{count} / {ev.capacity || 'Illimité'}</span>
                    </div>
                    {ev.capacity && (
                      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-accent rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  <Link
                    href={`/events`}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Détails & Programme</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </Link>

                  <Link
                    href={`/dashboard/badges`}
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-accent/20 hover:bg-accent/30 text-accent-glow border border-accent/40 transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Badge Pass
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal Créer Événement */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 space-y-5 shadow-card max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                Créer un Événement BDE
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Intitulé de l&apos;Événement
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Hackathon INSIM TechFest 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Lieu / Salle
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Date & Heure Début
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-900 border border-white/10 rounded-xl text-white text-[11px] focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Date & Heure Fin
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-900 border border-white/10 rounded-xl text-white text-[11px] focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Description & Programme
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Détaillez le déroulement, les intervenants et les prérequis..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Jauge Maximale d&apos;Inscrits
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                  className="w-full px-3.5 py-2 bg-navy-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-2.5 px-5 rounded-xl font-bold bg-accent hover:bg-accent-light text-white shadow-glow disabled:opacity-50"
                >
                  {submitting ? 'Publication...' : 'Publier l’événement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
