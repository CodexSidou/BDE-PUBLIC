'use client'

import React, { useState, useEffect } from 'react'
import {
  Users,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  UserCheck,
  Search,
  Lock,
} from 'lucide-react'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  )

  const roles = [
    'STUDENT',
    'CLASS_DELEGATE',
    'BDE_MEMBER',
    'PROJECT_MANAGER',
    'TREASURER',
    'VICE_PRESIDENT',
    'PRESIDENT',
  ]

  return (
    <div className="space-y-6">
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
            Gouvernance des accès selon les 8 rôles primaires d&apos;INSIM CONNECT
          </p>
        </div>
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

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-white/10 p-5">
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
                          {roles.map((r) => (
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
    </div>
  )
}
