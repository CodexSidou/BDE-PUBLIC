'use client'

import React, { useState, useEffect } from 'react'
import {
  Lightbulb,
  Vote as VoteIcon,
  PlusCircle,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Send,
  Lock,
} from 'lucide-react'

export default function IdeasAndPollsPage() {
  const [ideas, setIdeas] = useState<any[]>([])
  const [polls, setPolls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Vie Étudiante & Campus',
    isAnonymous: false,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/ideas')
      const data = await res.json()
      if (data.success) {
        setIdeas(data.ideas)
        setPolls(data.polls)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la soumission' })
      } else {
        setMessage({
          type: 'success',
          text: 'Votre idée a été transmise aux membres du BDE. Merci pour votre contribution !',
        })
        setModalOpen(false)
        setFormData({
          title: '',
          description: '',
          category: 'Vie Étudiante & Campus',
          isAnonymous: false,
        })
        fetchData()
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Impossible de joindre le serveur' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (pollId: string, optionId: string) => {
    setMessage(null)
    try {
      const res = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionId }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Erreur lors du vote' })
      } else {
        setMessage({ type: 'success', text: data.message })
        fetchData()
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Erreur réseau.' })
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent-glow text-xs font-semibold mb-3">
          <Lightbulb className="w-4 h-4" />
          <span>Démocratie Participative de Campus</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Boîte à Idées & Sondages
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Proposez vos améliorations pour le campus, votez aux sondages officiels et participez aux orientations du BDE.
        </p>

        <div className="pt-6">
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-xs shadow-glow inline-flex items-center gap-2 transition-all hover:scale-105"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Soumettre une Nouvelle Idée</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`max-w-xl mx-auto p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
              : 'bg-red-500/20 border border-red-500/40 text-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Campus Polls Section */}
      {polls.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <VoteIcon className="w-5 h-5 text-accent-glow" />
            <span>Sondages Officiels en Cours</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce(
                (sum: number, o: any) => sum + o.votesCount,
                0
              )
              return (
                <div
                  key={poll.id}
                  className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4"
                >
                  <h3 className="text-base font-bold text-white leading-snug">
                    {poll.title}
                  </h3>
                  {poll.description && (
                    <p className="text-xs text-slate-400">{poll.description}</p>
                  )}

                  <div className="space-y-2.5 pt-2">
                    {poll.options.map((option: any) => {
                      const pct =
                        totalVotes > 0
                          ? Math.round((option.votesCount / totalVotes) * 100)
                          : 0
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleVote(poll.id, option.id)}
                          className="w-full text-left p-3 rounded-xl bg-navy-900 border border-white/5 hover:border-accent/40 relative overflow-hidden transition-all group"
                        >
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-accent/20 transition-all rounded-l-xl"
                            style={{ width: `${pct}%` }}
                          />
                          <div className="relative z-10 flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200 group-hover:text-white">
                              {option.text}
                            </span>
                            <span className="font-bold text-accent-glow ml-2">
                              {pct}% ({option.votesCount})
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  <p className="text-[10px] text-slate-500 pt-1 text-right">
                    Total : {totalVotes} vote(s) exprimé(s)
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Ideas Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <span>Idées Proposées par les Étudiants</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent-glow uppercase">
                    {idea.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      idea.status === 'ACCEPTED'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : idea.status === 'IN_PROGRESS'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-slate-500/20 text-slate-300'
                    }`}
                  >
                    {idea.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white leading-tight">
                  {idea.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {idea.description}
                </p>

                {idea.adminFeedback && (
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-[11px] text-accent-glow mt-3">
                    <strong>Réponse officielle du BDE :</strong> {idea.adminFeedback}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Par {idea.author.firstName} {idea.author.lastName}
                </span>
                <span className="flex items-center gap-1 font-bold text-accent-glow">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{idea.upvotesCount} soutiens</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-2">
              Proposer une Idée pour le Campus
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Votre idée sera examinée par le bureau exécutif et soumise au vote des étudiants si elle est retenue.
            </p>

            <form onSubmit={handleSubmitIdea} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Titre de l&apos;Idée
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Création d'une bibliothèque de prêt Raspberry Pi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catégorie
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                >
                  <option value="Vie Étudiante & Campus">Vie Étudiante & Campus</option>
                  <option value="Technologie & Projets">Technologie & Projets</option>
                  <option value="Culture & Compétences">Culture & Compétences</option>
                  <option value="Sports & Bien-être">Sports & Bien-être</option>
                  <option value="Pédagogie & Équipement">Pédagogie & Équipement</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Bénéfices
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Expliquez concrètement pourquoi cette idée est utile..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) =>
                    setFormData({ ...formData, isAnonymous: e.target.checked })
                  }
                  className="rounded border-white/20 bg-navy-900 text-accent focus:ring-0"
                />
                <label htmlFor="anonymous" className="text-xs text-slate-300">
                  Soumettre de manière anonyme
                </label>
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
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-glow"
                >
                  {submitting ? 'Envoi...' : 'Envoyer l\'Idée'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
