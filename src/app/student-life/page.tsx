import React from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Gamepad2,
  Code2,
  Mic2,
  HeartHandshake,
  Compass,
  ArrowRight,
} from 'lucide-react'

export default function StudentLifePage() {
  const clubs = [
    {
      title: 'INSIM Dev & AI Club',
      desc: 'Hackathons, ateliers de programmation, projets open-source et veille technologique en intelligence artificielle.',
      icon: Code2,
      members: 85,
      color: 'text-accent-glow bg-accent/10 border-accent/30',
    },
    {
      title: 'INSIM E-Sport League',
      desc: 'Tournois inter-universités, compétitions régulières sur Valorant, League of Legends, FC 26 et Rocket League.',
      icon: Gamepad2,
      members: 120,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    },
    {
      title: 'Club Débat & Éloquence',
      desc: 'Perfectionnement de l’art oratoire, simulations de conférences internationales et joutes verbales en français et anglais.',
      icon: Mic2,
      members: 45,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      title: 'INSIM Solidarité & Entraide',
      desc: 'Collectes de sang, tutorat académique solidaire pour les premières années et maraudes humanitaires.',
      icon: HeartHandshake,
      members: 60,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent-glow text-xs font-semibold mb-3">
          <Compass className="w-4 h-4" />
          <span>Vie de Campus & Associations</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          La Dynamique Étudiante à l&apos;INSIM
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Rejoignez un club, développez des compétences extracurriculaires et participez à l&apos;animation du campus tout au long de l&apos;année universitaire.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clubs.map((c) => {
          const Icon = c.icon
          return (
            <div
              key={c.title}
              className="p-6 sm:p-7 rounded-3xl glass-panel border border-white/10 hover:border-accent/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${c.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {c.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {c.desc}
                </p>
              </div>

              <div className="pt-5 mt-5 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {c.members} étudiants actifs
                </span>
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs shadow-glow flex items-center gap-1 transition-all"
                >
                  <span>Rejoindre</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
