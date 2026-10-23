import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Calendar, MapPin, Users, Sparkles, Clock, ArrowRight } from 'lucide-react'

export const revalidate = 0

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { isPublic: true },
    include: {
      organizer: { select: { firstName: true, lastName: true } },
      project: { select: { title: true } },
      _count: { select: { registrations: true } },
    },
    orderBy: { startsAt: 'asc' },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent-glow text-xs font-semibold mb-3">
          <Calendar className="w-4 h-4" />
          <span>Agenda Académique & Événementiel</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Événements & Vie de Campus
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Participez aux hackathons, tournois e-sport, conférences d&apos;experts et galas de remise des diplômes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="p-6 sm:p-7 rounded-3xl glass-panel border border-white/10 hover:border-accent/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] uppercase">
                  {event.status}
                </span>
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-accent" />
                  {new Date(event.startsAt).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                {event.title}
              </h2>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                {event.description}
              </p>

              <div className="pt-2 space-y-1.5 text-xs text-slate-400">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent-glow flex-shrink-0" />
                  <span className="text-white font-medium">{event.location}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent-glow flex-shrink-0" />
                  <span>
                    Du {new Date(event.startsAt).toLocaleDateString('fr-FR')} au{' '}
                    {new Date(event.endsAt).toLocaleDateString('fr-FR')}
                  </span>
                </p>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Users className="w-4 h-4 text-slate-500" />
                <span>
                  <strong>{event._count.registrations}</strong> inscrits / {event.capacity || 'Illimité'}
                </span>
              </span>

              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs shadow-glow flex items-center gap-1.5 transition-all"
              >
                <span>S&apos;inscrire</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
