'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Shield,
  CheckCircle,
  AlertTriangle,
  Search,
  UserPlus,
  X,
  Key,
  Mail,
  GraduationCap,
  Sparkles,
  Loader2,
  RefreshCw,
} from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Create member modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'BDE_MEMBER',
    studentNumber: '',
    department: 'Informatique & SI',
    studyYear: 'Licence 1',
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const [uRes, meRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/auth/me'),
      ])
      const uData = await uRes.json()
      const meData = await meRes.json()

      if (uData.success) setUsers(uData.users)
      if (meData.authenticated) setCurrentUser(meData.user)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (targetUserId: string, newRole: string) => {
    setMessage(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, role: newRole }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Modification refusée' })
      } else {
        setMessage({ type: 'success', text: 'Rôle mis à jour avec succès.' })
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
        )
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Erreur réseau.' })
    }
  }

  const handleToggleActive = async (targetUserId: string, currentStatus: boolean) => {
    setMessage(null)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId, isActive: !currentStatus }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Modification refusée' })
      } else {
        setMessage({ type: 'success', text: 'Statut du compte mis à jour.' })
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUserId ? { ...u, isActive: !currentStatus } : u
          )
        )
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Erreur réseau.' })
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
    let pass = ''
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setCreateForm((prev) => ({ ...prev, password: pass }))
  }

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setCreateLoading(true)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Échec de la création du compte membre')
      }

      setMessage({
        type: 'success',
        text: `Compte membre créé avec succès pour ${data.user.firstName} ${data.user.lastName} (${data.user.role}).`,
      })
      setUsers((prev) => [data.user, ...prev])
      setShowCreateModal(false)
      setCreateForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'BDE_MEMBER',
        studentNumber: '',
        department: 'Informatique & SI',
        studyYear: 'Licence 1',
      })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la création' })
    } finally {
      setCreateLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  )

  // Roles available depending on whether user is PRESIDENT or VICE_PRESIDENT
  const isPresident = currentUser?.role === 'PRESIDENT'
  const assignableRoles = isPresident
    ? [
        'STUDENT',
        'CLASS_DELEGATE',
        'BDE_MEMBER',
        'PROJECT_MANAGER',
        'TREASURER',
        'VICE_PRESIDENT',
        'PRESIDENT',
      ]
    : [
        'STUDENT',
        'CLASS_DELEGATE',
        'BDE_MEMBER',
        'PROJECT_MANAGER',
        'TREASURER',
      ]

  return (
    <div className="space-y-6">
      {/* Header with Title and Create Member Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Gestion des Utilisateurs & Attribution des Rôles
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Console Exécutive
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gouvernance et création directe de membres par la Présidence et Vice-Présidence
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              generatePassword()
              setShowCreateModal(true)
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-glow flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Créer un Membre</span>
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
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

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, email ou rôle..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-accent"
        />
      </div>

      {/* MOBILE-RESPONSIVE VIEW (< md): Cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredUsers.map((u) => {
          const isSelf = currentUser?.id === u.id
          return (
            <div
              key={u.id}
              className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {u.firstName} {u.lastName}
                    {isSelf && (
                      <span className="ml-1.5 text-[10px] text-accent-glow font-normal">
                        (Vous)
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{u.email}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                    u.isActive
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {u.isActive ? 'Actif' : 'Suspendu'}
                </span>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>
                  {u.department || 'N/A'} • {u.studyYear || 'L1'}
                </span>
                {u.studentNumber && (
                  <span className="font-mono text-[10px] text-slate-500">
                    #{u.studentNumber}
                  </span>
                )}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <div>
                  {isSelf ? (
                    <span className="font-bold text-white text-xs">{u.role}</span>
                  ) : (
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="bg-navy-900 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-accent"
                    >
                      {assignableRoles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {!isSelf && (
                  <button
                    onClick={() => handleToggleActive(u.id, u.isActive)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                      u.isActive
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    {u.isActive ? 'Suspendre' : 'Réactiver'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* DESKTOP VIEW (>= md): Table */}
      <div className="hidden md:block glass-panel rounded-2xl border border-white/10 p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-lg">Utilisateur</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Filière / Niveau</th>
                <th className="py-3 px-4">Statut Compte</th>
                <th className="py-3 px-4">Rôle Attribué</th>
                <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => {
                const isSelf = currentUser?.id === u.id
                return (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {u.firstName} {u.lastName}
                      {isSelf && (
                        <span className="ml-2 text-[10px] text-accent-glow font-normal">
                          (Vous)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {u.department || 'N/A'} ({u.studyYear || 'L1'})
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {u.isActive ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isSelf ? (
                        <span className="font-bold text-white text-[11px]">
                          {u.role} (Fixe)
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-navy-900 border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:outline-none focus:border-accent"
                        >
                          {assignableRoles.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {!isSelf && (
                        <button
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                            u.isActive
                              ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.isActive ? 'Suspendre' : 'Réactiver'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MEMBER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel border border-white/20 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 my-8">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent-glow text-xs font-semibold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Création Directe de Compte</span>
              </div>
              <h3 className="text-xl font-black text-white">Nouveau Compte Membre BDE</h3>
              <p className="text-xs text-slate-400 mt-1">
                Créé par {currentUser?.role === 'PRESIDENT' ? 'le Président' : 'le Vice-Président'}. Le membre pourra se connecter immédiatement.
              </p>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Prénom <span className="text-accent-glow">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    placeholder="Prénom du membre"
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nom de famille <span className="text-accent-glow">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    placeholder="Nom du membre"
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email de connexion <span className="text-accent-glow">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="membre@insim-student.edu"
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Mot de passe initial <span className="text-accent-glow">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="text-[11px] text-accent-glow hover:underline flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" />
                    <span>Générer aléatoire</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="Au moins 6 caractères"
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Rôle Attribué <span className="text-accent-glow">*</span>
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                  >
                    {assignableRoles.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    N° Étudiant (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={createForm.studentNumber}
                    onChange={(e) => setCreateForm({ ...createForm, studentNumber: e.target.value })}
                    placeholder="Ex: 2024-IN-042"
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Département / Pôle
                  </label>
                  <select
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="Informatique & SI">Informatique & SI</option>
                    <option value="Management & RH">Management & RH</option>
                    <option value="Finance & Comptabilité">Finance & Comptabilité</option>
                    <option value="Marketing & Com">Marketing & Com</option>
                    <option value="Pôle Événements">Pôle Événements</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Année d&apos;Étude
                  </label>
                  <select
                    value={createForm.studyYear}
                    onChange={(e) => setCreateForm({ ...createForm, studyYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-white/10 text-white text-xs focus:outline-none focus:border-accent"
                  >
                    <option value="Licence 1">Licence 1</option>
                    <option value="Licence 2">Licence 2</option>
                    <option value="Licence 3">Licence 3</option>
                    <option value="Master 1">Master 1</option>
                    <option value="Master 2">Master 2</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Création...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Créer le Compte Membre</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
