'use client'

import React, { useState, useEffect } from 'react'
import {
  CheckSquare,
  PlusCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Filter,
  CheckCircle2,
  FolderKanban,
} from 'lucide-react'

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    projectId: '',
    dueDate: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [tRes, pRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/projects'),
      ])
      const tData = await tRes.json()
      const pData = await pRes.json()

      if (tData.success) setTasks(tData.tasks)
      if (pData.success) {
        setProjects(pData.projects)
        if (pData.projects.length > 0) {
          setFormData((prev) => ({ ...prev, projectId: pData.projects[0].id }))
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus }),
      })
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        )
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setModalOpen(false)
        setFormData({
          title: '',
          description: '',
          priority: 'MEDIUM',
          projectId: projects[0]?.id || '',
          dueDate: '',
        })
        loadData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  const columns = [
    { title: 'À Faire', status: 'TODO', color: 'border-slate-500/40 text-slate-300' },
    { title: 'En Cours', status: 'IN_PROGRESS', color: 'border-blue-500/40 text-blue-400' },
    { title: 'Bloqué', status: 'BLOCKED', color: 'border-red-500/40 text-red-400' },
    { title: 'Terminé', status: 'COMPLETED', color: 'border-emerald-500/40 text-emerald-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Tableau Kanban des Tâches
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervision et répartition des responsabilités opérationnelles par pôle
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Créer une Tâche</span>
        </button>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status)
          return (
            <div
              key={col.status}
              className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col min-h-[480px]"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                  {col.title}
                </span>
                <span className="w-5 h-5 rounded-full bg-white/10 text-white text-[11px] font-bold flex items-center justify-center">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-navy-850/80 border border-white/5 hover:border-accent/40 shadow-sm transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-accent/20 text-accent-glow uppercase">
                        {task.priority}
                      </span>
                      {task.project && (
                        <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                          {task.project.title}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>
                          {task.assignee
                            ? `${task.assignee.firstName}`
                            : 'Non assigné'}
                        </span>
                      </span>

                      {/* Status switcher button */}
                      <select
                        value={task.status}
                        onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                        className="bg-navy-900 border border-white/10 rounded px-1.5 py-0.5 text-[9px] text-slate-300 focus:outline-none"
                      >
                        <option value="TODO">À faire</option>
                        <option value="IN_PROGRESS">En cours</option>
                        <option value="BLOCKED">Bloqué</option>
                        <option value="COMPLETED">Terminé</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-2">Nouvelle Tâche BDE</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Intitulé de la tâche
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Contacter le service technique pour le son"
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priorité
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Projet
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) =>
                      setFormData({ ...formData, projectId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-glow"
                >
                  Créer la tâche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
