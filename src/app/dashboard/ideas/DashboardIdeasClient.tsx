'use client'

import React, { useState } from 'react'
import {
  Lightbulb,
  Vote as VoteIcon,
  PlusCircle,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  CheckCircle,
  Clock,
  Filter,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Send,
  User,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { SessionUser } from '@/types'

interface IdeaItem {
  id: string
  title: string
  description: string
  category: string
  isAnonymous: boolean
  status: string
  adminFeedback?: string | null
  upvotesCount: number
  createdAt: string
  author: {
    id: string
    firstName: string
    lastName: string
    role: string
  }
}

interface PollOption {
  id: string
  text: string
  votesCount: number
  _count?: { votes: number }
}

interface PollItem {
  id: string
  title: string
  description?: string | null
  isClosed: boolean
  closesAt?: string | null
  options: PollOption[]
  _count?: { votes: number }
}

interface UserVote {
  pollId: string
  optionId: string
}

interface Props {
  user: SessionUser
  initialIdeas: IdeaItem[]
  initialPolls: PollItem[]
  initialUserVotes: UserVote[]
}

export default function DashboardIdeasClient({
  user,
  initialIdeas,
  initialPolls,
  initialUserVotes,
}: Props) {
  const [activeTab, setActiveTab] = useState<'ideas' | 'polls'>('ideas')
  const [ideas, setIdeas] = useState<IdeaItem[]>(initialIdeas)
  const [polls, setPolls] = useState<PollItem[]>(initialPolls)
  const [userVotes, setUserVotes] = useState<Record<string, string>>(
    initialUserVotes.reduce((acc, v) => ({ ...acc, [v.pollId]: v.optionId }), {})
  )
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [votingId, setVotingId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Vie Étudiante & Campus',
    isAnonymous: false,
  })

  const categories = [
    'Vie Étudiante & Campus',
    'Événements & Soirées',
    'Pédagogie & Cours',
    'Sport & Loisirs',
    'Infrastructures & Matériel',
    'Carrière & Stages',
  ]

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    SUBMITTED: { bg: 'bg-blue-500/10 border-blue-500/30', text: 'text-blue-400', label: 'Soumise' },
    UNDER_REVIEW: { bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-400', label: 'En Étude BDE' },
    ACCEPTED: { bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400', label: 'Acceptée' },
    REJECTED: { bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-400', label: 'Non Retenue' },
    IN_PROGRESS: { bg: 'bg-cyan-500/10 border-cyan-500/30', text: 'text-cyan-400', label: 'En Réalisation' },
    COMPLETED: { bg: 'bg-purple-500/10 border-purple-500/30', text: 'text-purple-400', label: 'Concrétisée' },
  }

  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setNotification(null)

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la soumission')
      }

      const newIdea: IdeaItem = {
        ...data.idea,
        author: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      }

      setIdeas([newIdea, ...ideas])
      setModalOpen(false)
      setFormData({
        title: '',
        description: '',
        category: 'Vie Étudiante & Campus',
        isAnonymous: false,
      })
      setNotification({
        type: 'success',
        text: 'Votre idée a été transmise avec succès au BDE INSIM ! Tous les membres du pôle en ont été notifiés.',
      })
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Une erreur est survenue' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (pollId: string, optionId: string) => {
    if (userVotes[pollId]) return
    setVotingId(pollId)
    setNotification(null)

    try {
      const res = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionId }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors du vote')
      }

      setUserVotes((prev) => ({ ...prev, [pollId]: optionId }))
      setPolls((prev) =>
        prev.map((poll) => {
          if (poll.id !== pollId) return poll
          return {
            ...poll,
            _count: { votes: (poll._count?.votes || 0) + 1 },
            options: poll.options.map((opt) =>
              opt.id === optionId ? { ...opt, votesCount: opt.votesCount + 1 } : opt
            ),
          }
        })
      )
      setNotification({ type: 'success', text: 'Votre vote a bien été comptabilisé !' })
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Impossible de voter' })
    } finally {
      setVotingId(null)
    }
  }

  const filteredIdeas = filterCategory === 'ALL'
    ? ideas
    : ideas.filter((i) => i.category === filterCategory)

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Lightbulb className="w-7 h-7 text-accent" />
            Idées & Sondages Démocratiques
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Exprimez votre voix, proposez des améliorations pour le campus et participez aux consultations citoyennes de l&apos;INSIM.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-accent hover:bg-accent-hover text-white transition-all shadow-glow hover:scale-[1.02]"
        >
          <PlusCircle className="w-4 h-4" />
          Proposer une Idée
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs border flex items-center justify-between animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Propositions</span>
          <p className="text-2xl font-black text-white mt-1">{ideas.length}</p>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Idées Retenues / En cours</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {ideas.filter((i) => ['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(i.status)).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mes Idées Soumises</span>
          <p className="text-2xl font-black text-accent-glow mt-1">
            {ideas.filter((i) => i.author.id === user.id).length}
          </p>
        </div>
        <div className="p-4 rounded-2xl glass-card border border-white/10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sondages Actifs</span>
          <p className="text-2xl font-black text-blue-400 mt-1">{polls.filter((p) => !p.isClosed).length}</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('ideas')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ideas'
              ? 'bg-accent/20 text-accent-glow border border-accent/40 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          Boîte à Idées ({ideas.length})
        </button>
        <button
          onClick={() => setActiveTab('polls')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'polls'
              ? 'bg-accent/20 text-accent-glow border border-accent/40 shadow-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <VoteIcon className="w-4 h-4" />
          Sondages & Consultations ({polls.length})
        </button>
      </div>

      {/* Tab: Ideas */}
      {activeTab === 'ideas' && (
        <div className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5" /> Filtrer :
            </span>
            <button
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterCategory === 'ALL'
                  ? 'bg-accent text-white font-bold'
                  : 'bg-navy-800/80 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              Toutes
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterCategory === cat
                    ? 'bg-accent text-white font-bold'
                    : 'bg-navy-800/80 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredIdeas.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-card border border-white/10 space-y-3">
              <Lightbulb className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-white">Aucune idée dans cette catégorie pour le moment</p>
              <p className="text-xs text-slate-400">Soyez le premier à proposer une initiative pour améliorer la vie à l&apos;INSIM !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIdeas.map((idea) => {
                const s = statusColors[idea.status] || statusColors.SUBMITTED
                return (
                  <div
                    key={idea.id}
                    className="p-5 rounded-2xl glass-card border border-white/10 hover:border-white/20 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent-glow bg-accent/10 px-2.5 py-0.5 rounded-full border border-accent/20">
                          {idea.category}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white leading-snug">{idea.title}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{idea.description}</p>

                      {idea.adminFeedback && (
                        <div className="p-3 rounded-xl bg-navy-850/80 border border-accent/30 text-xs space-y-1">
                          <p className="text-[10px] font-bold text-accent-glow uppercase tracking-wider">
                            Réponse du Bureau des Étudiants :
                          </p>
                          <p className="text-slate-300">{idea.adminFeedback}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {idea.isAnonymous
                            ? 'Étudiant Anonyme'
                            : `${idea.author.firstName} ${idea.author.lastName}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(idea.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Polls */}
      {activeTab === 'polls' && (
        <div className="space-y-4">
          {polls.length === 0 ? (
            <div className="p-12 text-center rounded-2xl glass-card border border-white/10 space-y-3">
              <VoteIcon className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-white">Aucun sondage ouvert pour l&apos;instant</p>
              <p className="text-xs text-slate-400">Le BDE publiera de nouvelles consultations sous peu.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {polls.map((poll) => {
                const totalVotes = poll.options.reduce((acc, opt) => acc + (opt.votesCount || opt._count?.votes || 0), 0)
                const hasVoted = Boolean(userVotes[poll.id])

                return (
                  <div key={poll.id} className="p-6 rounded-2xl glass-card border border-white/10 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-white">{poll.title}</h3>
                      {hasVoted ? (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> A voté
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400">
                          En cours
                        </span>
                      )}
                    </div>

                    {poll.description && (
                      <p className="text-xs text-slate-300">{poll.description}</p>
                    )}

                    <div className="space-y-2 pt-2">
                      {poll.options.map((option) => {
                        const optVotes = option.votesCount || option._count?.votes || 0
                        const percentage = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0
                        const isSelected = userVotes[poll.id] === option.id

                        return (
                          <button
                            key={option.id}
                            disabled={hasVoted || votingId === poll.id}
                            onClick={() => handleVote(poll.id, option.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all relative overflow-hidden text-xs ${
                              isSelected
                                ? 'bg-accent/20 border-accent text-white shadow-glow'
                                : hasVoted
                                ? 'bg-navy-850/60 border-white/5 text-slate-300'
                                : 'bg-navy-850/40 border-white/10 hover:border-accent/40 text-slate-200'
                            }`}
                          >
                            {hasVoted && (
                              <div
                                className="absolute left-0 top-0 bottom-0 bg-accent/20 transition-all pointer-events-none"
                                style={{ width: `${percentage}%` }}
                              />
                            )}
                            <div className="relative z-10 flex items-center justify-between">
                              <span className="font-medium">{option.text}</span>
                              {hasVoted && (
                                <span className="font-bold text-accent-glow ml-2">
                                  {percentage}% ({optVotes})
                                </span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Total des suffrages : <strong className="text-white">{totalVotes}</strong></span>
                      <span>Démocratie étudiante</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Submit Idea */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl glass-card border border-white/20 p-6 sm:p-8 space-y-6 relative shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                <Lightbulb className="w-6 h-6 text-accent" />
                Soumettre une Proposition
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateIdea} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Titre de l&apos;initiative *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Organisation d'un Hackathon annuel INSIM..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Catégorie du Pôle *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Description détaillée & Bénéfices *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Expliquez en détails le projet, les ressources nécessaires et l'impact positif pour les étudiants..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-850/60 border border-white/5">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                  className="w-4 h-4 rounded text-accent focus:ring-accent bg-navy-900 border-white/20"
                />
                <label htmlFor="anonymous" className="text-xs text-slate-300 cursor-pointer">
                  Proposer cette idée de manière <strong className="text-white">anonyme</strong> (votre nom ne sera pas affiché publiquement)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
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
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-accent hover:bg-accent-hover text-white transition-all shadow-glow disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Envoi en cours...' : 'Envoyer la proposition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
