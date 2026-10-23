'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  ExternalLink,
  DollarSign,
  AlertCircle,
  X,
} from 'lucide-react'
import { SessionUser } from '@/types'
import { isBdeStaff } from '@/lib/permissions'

interface ProjectItem {
  id: string
  title: string
  slug: string
  description: string
  category: string
  status: string
  isPublic: boolean
  startDate?: string | null
  endDate?: string | null
  manager: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  budget?: {
    allocatedAmount: number
    spentAmount: number
  } | null
  tasks?: Array<{
    id: string
    status: string
  }>
  _count: {
    memberships: number
    tasks: number
    events: number
  }
}

export default function ProjectsDashboardClient({
  user,
  initialProjects,
}: {
  user: SessionUser
  initialProjects: ProjectItem[]
}) {
  const [projects, setProjects] = useState<ProjectItem[]>(initialProjects)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tech & Digital',
    description: '',
    allocatedBudget: '0',
    isPublic: true,
  })

  const canCreate = isBdeStaff(user.role)

  const categories = ['ALL', 'Tech & Digital', 'Vie Étudiante', 'Événementiel & Soirées', 'Culture', 'Sports', 'Solidarité']

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory
    return matchesSearch && matchesCat
  })

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          allocatedBudget: parseFloat(formData.allocatedBudget) || 0,
          isPublic: formData.isPublic,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la création du projet')
      }

      setProjects([data.project, ...projects])
      setIsModalOpen(false)
      setFormData({
        title: '',
        category: 'Tech & Digital',
        description: '',
        allocatedBudget: '0',
        isPublic: true,
      })
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
            <Clock className="w-3 h-3" /> En cours
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Terminé
          </span>
        )
      case 'PLANNED':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Planifié
          </span>
        )
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-300 border border-slate-500/30">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <FolderKanban className="w-7 h-7 text-accent" />
            Gestion des Projets & Pôles BDE
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisez les chantiers stratégiques, les équipes projet et l&apos;avancement des livrables.
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-accent hover:bg-accent-light text-white transition-all shadow-glow"
          >
            <Plus className="w-4 h-4" />
            Nouveau Projet
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-850 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-accent text-white shadow-glow'
                  : 'bg-navy-850/60 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat === 'ALL' ? 'Tous les pôles' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center glass-panel rounded-3xl border border-white/10 space-y-3">
            <FolderKanban className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-white font-bold text-sm">Aucun projet trouvé</p>
            <p className="text-xs text-slate-400">
              Modifiez vos critères de recherche ou créez un nouveau projet BDE.
            </p>
          </div>
        ) : (
          filteredProjects.map((p) => {
            const completedTasks = p.tasks?.filter((t) => t.status === 'DONE').length || 0
            const totalTasks = p.tasks?.length || 0
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

            return (
              <div
                key={p.id}
                className="p-6 rounded-2xl glass-card border border-white/10 flex flex-col justify-between hover:border-accent/40 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 text-accent-glow border border-white/10">
                      {p.category}
                    </span>
                    {getStatusBadge(p.status)}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-accent-glow transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {/* Task Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Avancement des tâches</span>
                      <span className="font-bold text-white">{progress}% ({completedTasks}/{totalTasks})</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent to-accent-electric rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{p.manager.firstName} {p.manager.lastName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>{p._count.memberships} membres</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  <Link
                    href={`/projects`}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <span>Fiche publique</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </Link>

                  <Link
                    href={`/dashboard/tasks`}
                    className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-colors"
                  >
                    Kanban Tâches
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-accent" />
                Lancer un Nouveau Projet
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

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nom du projet / Mission
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Tournoi E-Sport Inter-Promos 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Pôle / Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent"
                >
                  <option value="Tech & Digital">Tech & Digital</option>
                  <option value="Vie Étudiante">Vie Étudiante</option>
                  <option value="Événementiel & Soirées">Événementiel & Soirées</option>
                  <option value="Culture">Culture</option>
                  <option value="Sports">Sports</option>
                  <option value="Solidarité">Solidarité</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Description & Objectifs
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Détaillez le planning, la cible étudiante et les livrables attendus..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Budget Prévisionnel Alloué (DZD)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.allocatedBudget}
                  onChange={(e) => setFormData({ ...formData, allocatedBudget: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded border-white/10 bg-navy-900 text-accent focus:ring-accent"
                />
                <label htmlFor="isPublic" className="text-slate-300 select-none cursor-pointer">
                  Afficher publiquement sur la vitrine étudiante
                </label>
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
                  {submitting ? 'Création...' : 'Créer le projet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
