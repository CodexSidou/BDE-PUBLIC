'use client'

import React, { useState, useEffect } from 'react'
import {
  FileSpreadsheet,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  AlertTriangle,
  Receipt,
  User,
  Building,
} from 'lucide-react'

export default function ExpensesClientPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'LOGISTICS',
    requestedAmount: '',
    projectId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [userRes, projRes, expRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/projects'),
        fetch('/api/finances/summary'),
      ])

      const userData = await userRes.json()
      const projData = await projRes.json()

      if (userData.authenticated) {
        setCurrentUser(userData.user)
      }
      if (projData.success) {
        setProjects(projData.projects)
        if (projData.projects.length > 0) {
          setFormData((prev) => ({ ...prev, projectId: projData.projects[0].id }))
        }
      }

      // Fetch expenses
      const allExpensesRes = await fetch('/api/tasks') // Fallback or dedicated list
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Load expenses directly from API
  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      // In Next.js client, fetch summary or expenses
      const res = await fetch('/api/finances/summary')
      const data = await res.json()
      // We also query expenses
    } catch (e) {}
  }

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/expenses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          requestedAmount: parseFloat(formData.requestedAmount),
          projectId: formData.projectId,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la création' })
      } else {
        setMessage({
          type: 'success',
          text: 'Votre demande de dépense a été enregistrée et transmise à la trésorerie.',
        })
        setModalOpen(false)
        setFormData({
          title: '',
          description: '',
          category: 'LOGISTICS',
          requestedAmount: '',
          projectId: projects[0]?.id || '',
        })
        fetchData()
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Impossible de joindre le serveur' })
    } finally {
      setActionLoading(false)
    }
  }

  const handleReview = async (expenseId: string, decision: 'APPROVE' | 'REJECT') => {
    setActionLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/expenses/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenseId, decision }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Erreur de traitement' })
      } else {
        setMessage({
          type: 'success',
          text: `La demande a été ${decision === 'APPROVE' ? 'approuvée' : 'rejetée'} avec succès.`,
        })
        fetchData()
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Erreur réseau.' })
    } finally {
      setActionLoading(false)
    }
  }

  const handlePay = async (expenseId: string) => {
    setActionLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/expenses/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expenseId,
          payee: 'Prestataire / Fournisseur agréé BDE',
          receiptReference: `CHQ-${Date.now().toString().slice(-6)}`,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Erreur de décaissement' })
      } else {
        setMessage({
          type: 'success',
          text: `Décaissement enregistré ! Transaction générée : ${data.transaction.transactionCode}`,
        })
        fetchData()
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Erreur réseau.' })
    } finally {
      setActionLoading(false)
    }
  }

  const isFinance =
    currentUser &&
    ['TREASURER', 'VICE_PRESIDENT', 'PRESIDENT'].includes(currentUser.role)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Demandes de Dépenses & Engagements
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cycle de vie officiel des dépenses BDE : Soumission ➔ Revue ➔ Approbation ➔ Décaissement
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nouvelle Demande</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-200'
              : 'bg-red-500/20 border border-red-500/40 text-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Rules Notice */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-white/10 text-xs text-slate-300 space-y-1">
        <p className="font-bold text-accent-glow">
          Règles de conformité financière BDE INSIM :
        </p>
        <ul className="list-disc list-inside space-y-0.5 text-slate-400 text-[11px]">
          <li>
            <strong>Anti-auto-approbation :</strong> Un demandeur ne peut en aucun cas approuver sa propre demande de dépense.
          </li>
          <li>
            <strong>Séparation des étapes :</strong> L&apos;approbation d&apos;une demande n&apos;équivaut pas à son paiement effectif. Le décaissement doit être validé par le Trésorier ou la Présidence.
          </li>
        </ul>
      </div>

      {/* Mock/Demo Interactive Table */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10">
        <h3 className="text-sm font-bold text-white mb-4">
          Demandes en Cours & Traitement
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Titre de la dépense</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Demandeur</th>
                <th className="py-3 px-4">Montant (DZD)</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/5">
                <td className="py-3.5 px-4 font-semibold text-white">
                  Acompte traiteur pour les 48h du Hackathon
                </td>
                <td className="py-3.5 px-4 text-slate-300">REFRESHMENTS</td>
                <td className="py-3.5 px-4 text-slate-300">Sofiane Khelil</td>
                <td className="py-3.5 px-4 font-bold text-accent-glow">
                  75 000 DZD
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 uppercase">
                    SUBMITTED
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  {isFinance && currentUser?.email !== 'chef.projet@insim.edu' ? (
                    <>
                      <button
                        onClick={() => handleReview('hackathon-demo-id', 'APPROVE')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleReview('hackathon-demo-id', 'REJECT')}
                        className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-[10px] font-bold"
                      >
                        Rejeter
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-500">
                      {currentUser?.email === 'chef.projet@insim.edu'
                        ? 'Votre propre demande (auto-approbation interdite)'
                        : 'En attente trésorerie'}
                    </span>
                  )}
                </td>
              </tr>

              <tr className="hover:bg-white/5">
                <td className="py-3.5 px-4 font-semibold text-white">
                  Trophées gravés et médailles personnalisées E-Sport
                </td>
                <td className="py-3.5 px-4 text-slate-300">LOGISTICS</td>
                <td className="py-3.5 px-4 text-slate-300">Karim Mansouri</td>
                <td className="py-3.5 px-4 font-bold text-accent-glow">
                  32 000 DZD
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 uppercase">
                    APPROVED
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  {isFinance ? (
                    <button
                      onClick={() => handlePay('esport-demo-id')}
                      className="px-3 py-1 rounded-lg bg-accent hover:bg-accent-hover text-white text-[10px] font-bold shadow-glow"
                    >
                      Décaisser & Payer
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400">
                      Prêt pour décaissement
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Creation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-2">
              Nouvelle Demande d&apos;Engagement de Dépense
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Remplissez les détails financiers pour soumission au bureau de trésorerie.
            </p>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Objet de la Dépense
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Achat fournitures badges et cordons"
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description & Justification
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Détaillez la raison d'utilisation des fonds..."
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Montant Estimé (DZD)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.requestedAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, requestedAmount: e.target.value })
                    }
                    placeholder="Ex: 25000"
                    className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="LOGISTICS">Logistique</option>
                    <option value="MARKETING">Marketing & Communication</option>
                    <option value="EQUIPMENT">Matériel & Équipement</option>
                    <option value="REFRESHMENTS">Restauration & Traiteur</option>
                    <option value="PRINTING">Impression & Affiches</option>
                    <option value="TRANSPORTATION">Transport</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Projet BDE Associé
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
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-glow"
                >
                  {actionLoading ? 'Soumission...' : 'Soumettre la Demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
