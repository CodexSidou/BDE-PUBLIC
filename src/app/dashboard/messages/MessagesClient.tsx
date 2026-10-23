'use client'

import React, { useState } from 'react'
import {
  Mail,
  MailOpen,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Reply,
  RefreshCw,
  Clock,
  User,
  Tag,
  Shield,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { SessionUser } from '@/types'

interface SerializedMessage {
  id: string
  name: string
  email: string
  subject: string
  category: string
  message: string
  isRead: boolean
  readAt: string | null
  replied: boolean
  repliedAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface MessagesClientProps {
  initialMessages: SerializedMessage[]
  initialStats: { total: number; unread: number }
  user: SessionUser
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Événements & Billetterie': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  'Adhésion & BDE': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  'Partenariat & Sponsoring': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  'Clubs & Vie Étudiante': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'Pédagogie & Réclamation': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  'Autre': { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
}

export default function MessagesClient({
  initialMessages,
  initialStats,
  user,
}: MessagesClientProps) {
  const [messages, setMessages] = useState<SerializedMessage[]>(initialMessages)
  const [stats, setStats] = useState(initialStats)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null)
  const [notesValue, setNotesValue] = useState('')

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/contact')
      const data = await res.json()
      if (data.success) {
        setMessages(data.messages)
        setStats(data.stats)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const toggleRead = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isRead: !currentStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, isRead: !currentStatus } : m))
        )
        setStats((prev) => ({
          ...prev,
          unread: Math.max(0, prev.unread + (currentStatus ? 1 : -1)),
        }))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const toggleReplied = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, replied: !currentStatus }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, replied: !currentStatus } : m))
        )
      }
    } catch (e) {
      console.error(e)
    }
  }

  const saveNotes = async (id: string) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: notesValue }),
      })
      const data = await res.json()
      if (data.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, notes: notesValue } : m))
        )
        setEditingNotesId(null)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Supprimer définitivement ce message du bureau ?')) return
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        const deleted = messages.find((m) => m.id === id)
        setMessages((prev) => prev.filter((m) => m.id !== id))
        setStats((prev) => ({
          total: Math.max(0, prev.total - 1),
          unread: deleted && !deleted.isRead ? Math.max(0, prev.unread - 1) : prev.unread,
        }))
        setActionMessage('Message supprimé.')
        setTimeout(() => setActionMessage(null), 3000)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Categories list with counts
  const categoriesList = [
    'ALL',
    'Événements & Billetterie',
    'Adhésion & BDE',
    'Partenariat & Sponsoring',
    'Clubs & Vie Étudiante',
    'Pédagogie & Réclamation',
    'Autre',
  ]

  const filteredMessages = messages.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.message.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      selectedCategory === 'ALL' || m.category === selectedCategory

    const matchesUnread = !filterUnreadOnly || !m.isRead

    return matchesSearch && matchesCategory && matchesUnread
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Boîte de Réception Exécutive
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent/20 text-accent-glow border border-accent/40">
              {user.role === 'PRESIDENT' ? 'Présidence' : 'Vice-Présidence'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Messages directs reçus depuis le formulaire &quot;Contactez le Bureau des Étudiants&quot;
          </p>
        </div>

        <button
          onClick={fetchMessages}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-navy-800 border border-white/10 text-white text-xs font-semibold hover:bg-navy-700 flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Messages</span>
            <Mail className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">{stats.total}</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Non Lus</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-400">{stats.unread}</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Répondus</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400">
            {messages.filter((m) => m.replied).length}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Traitement BDE</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-400">
            {stats.total > 0
              ? `${Math.round(((stats.total - stats.unread) / stats.total) * 100)}%`
              : '100%'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, email, objet ou contenu..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent"
            />
          </div>

          {/* Quick toggle unread */}
          <button
            onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
              filterUnreadOnly
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : 'bg-navy-900 border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Uniquement Non Lus</span>
          </button>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory === cat
            const count =
              cat === 'ALL'
                ? messages.length
                : messages.filter((m) => m.category === cat).length

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-accent text-white shadow-glow'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{cat === 'ALL' ? 'Toutes Catégories' : cat}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 font-mono">
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-white/10 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">Aucun message trouvé</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Aucun message ne correspond à vos filtres actuels. Dès qu&apos;un étudiant ou partenaire écrit sur la page contact, son message apparaîtra ici.
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isExpanded = expandedId === msg.id
            const catStyle =
              CATEGORY_COLORS[msg.category] || CATEGORY_COLORS['Autre']

            const formattedDate = new Date(msg.createdAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div
                key={msg.id}
                className={`glass-panel rounded-2xl border transition-all ${
                  !msg.isRead
                    ? 'border-accent/40 bg-navy-900/90 shadow-lg'
                    : 'border-white/10 bg-navy-950/60'
                }`}
              >
                {/* Header row */}
                <div
                  className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleRead(msg.id, msg.isRead)
                      }}
                      title={msg.isRead ? 'Marquer comme non lu' : 'Marquer comme lu'}
                      className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                        msg.isRead
                          ? 'bg-white/5 text-slate-400 hover:text-white'
                          : 'bg-accent/20 text-accent-glow hover:bg-accent/30'
                      }`}
                    >
                      {msg.isRead ? (
                        <MailOpen className="w-4 h-4" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {msg.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          &lt;{msg.email}&gt;
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                        >
                          {msg.category}
                        </span>
                        {msg.replied && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Répondu</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                        {msg.subject}
                      </h4>

                      {!isExpanded && (
                        <p className="text-[11px] text-slate-400 truncate mt-1">
                          {msg.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400 text-xs self-end sm:self-auto flex-shrink-0">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 border-t border-white/5 space-y-4 animate-in fade-in">
                    {/* Full Message Body */}
                    <div className="p-4 rounded-xl bg-black/30 border border-white/5 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                      {msg.message}
                    </div>

                    {/* Internal Notes */}
                    {msg.notes && editingNotesId !== msg.id && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1 text-[11px]">
                            <FileText className="w-3.5 h-3.5 text-amber-400" />
                            <span>Note Interne Exécutive :</span>
                          </span>
                          <button
                            onClick={() => {
                              setEditingNotesId(msg.id)
                              setNotesValue(msg.notes || '')
                            }}
                            className="text-[10px] text-amber-300 hover:underline"
                          >
                            Modifier
                          </button>
                        </div>
                        <p className="text-slate-300 text-[11px]">{msg.notes}</p>
                      </div>
                    )}

                    {editingNotesId === msg.id && (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={notesValue}
                          onChange={(e) => setNotesValue(e.target.value)}
                          placeholder="Ajouter une note interne pour le Président / VP..."
                          className="w-full p-2.5 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                        />
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setEditingNotesId(null)}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => saveNotes(msg.id)}
                            className="px-3 py-1 rounded-lg bg-accent text-white text-xs font-semibold"
                          >
                            Enregistrer note
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${msg.email}?subject=RE: ${encodeURIComponent(
                            msg.subject
                          )} - Bureau des Étudiants INSIM`}
                          onClick={() => {
                            if (!msg.replied) toggleReplied(msg.id, false)
                            if (!msg.isRead) toggleRead(msg.id, false)
                          }}
                          className="px-3 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-glow"
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>Répondre par Email</span>
                        </a>

                        <button
                          onClick={() => toggleReplied(msg.id, msg.replied)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                            msg.replied
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-navy-900 border-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{msg.replied ? 'Marqué répondu' : 'Marquer comme répondu'}</span>
                        </button>

                        {editingNotesId !== msg.id && !msg.notes && (
                          <button
                            onClick={() => {
                              setEditingNotesId(msg.id)
                              setNotesValue('')
                            }}
                            className="px-3 py-1.5 rounded-xl bg-navy-900 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Ajouter Note</span>
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => deleteMessage(msg.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Supprimer ce message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
