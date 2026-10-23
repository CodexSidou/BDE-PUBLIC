import React from 'react'
import { prisma } from '@/lib/prisma'
import { Calendar, Tag, User, Sparkles, Megaphone } from 'lucide-react'

export const revalidate = 0

export default async function NewsPage() {
  const announcements = await prisma.announcement.findMany({
    where: { isPublic: true },
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
          role: true,
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent-glow text-xs font-semibold mb-3">
          <Megaphone className="w-4 h-4" />
          <span>Journal Officiel du Campus</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Actualités & Annonces BDE
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Restez informé des décisions stratégiques, lancements d&apos;initiatives et opportunités de l&apos;INSIM.
        </p>
      </div>

      <div className="space-y-6">
        {announcements.map((a) => (
          <article
            key={a.id}
            className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 hover:border-accent/40 transition-all space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold px-2.5 py-0.5 rounded-full bg-accent/20 text-accent-glow border border-accent/30 uppercase text-[10px]">
                  {a.category}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(a.publishedAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Par {a.author.firstName} {a.author.lastName} ({a.author.role})
              </span>
            </div>

            <h2 className="text-xl font-bold text-white tracking-tight">
              {a.title}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {a.content}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
