'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bell,
  CheckCircle2,
  Calendar,
  CreditCard,
  Award,
  Lightbulb,
  CheckSquare,
  Shield,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  link?: string | null
  isRead: boolean
  createdAt: string
}

export default function NotificationsClient({
  initialNotifications,
}: {
  initialNotifications: NotificationItem[]
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications)
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'EVENT' | 'FINANCE' | 'TASK'>('ALL')
  const [loading, setLoading] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleMarkAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      )
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead
    if (filter === 'EVENT') return n.type === 'EVENT'
    if (filter === 'FINANCE') return n.type === 'FINANCE'
    if (filter === 'TASK') return n.type === 'TASK'
    return true
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'EVENT':
        return <Calendar className="w-4 h-4 text-amber-400" />
      case 'FINANCE':
        return <CreditCard className="w-4 h-4 text-emerald-400" />
      case 'TASK':
        return <CheckSquare className="w-4 h-4 text-blue-400" />
      case 'BADGE':
        return <Award className="w-4 h-4 text-cyan-400" />
      case 'IDEA':
        return <Lightbulb className="w-4 h-4 text-purple-400" />
      default:
        return <Shield className="w-4 h-4 text-accent" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Bell className="w-7 h-7 text-accent" />
            Centre de Notifications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Restez informé des annonces officielles du BDE, des validations et de vos rappels.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={loading}
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-accent-glow" />
            Tout marquer comme lu ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`py-2 px-3.5 rounded-xl font-semibold transition-colors ${
            filter === 'ALL'
              ? 'bg-accent text-white shadow-glow'
              : 'bg-navy-850/60 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          Toutes ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`py-2 px-3.5 rounded-xl font-semibold transition-colors ${
            filter === 'UNREAD'
              ? 'bg-accent text-white shadow-glow'
              : 'bg-navy-850/60 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          Non lues ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('EVENT')}
          className={`py-2 px-3.5 rounded-xl font-semibold transition-colors ${
            filter === 'EVENT'
              ? 'bg-accent text-white shadow-glow'
              : 'bg-navy-850/60 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          Événements
        </button>
        <button
          onClick={() => setFilter('FINANCE')}
          className={`py-2 px-3.5 rounded-xl font-semibold transition-colors ${
            filter === 'FINANCE'
              ? 'bg-accent text-white shadow-glow'
              : 'bg-navy-850/60 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          Finances
        </button>
        <button
          onClick={() => setFilter('TASK')}
          className={`py-2 px-3.5 rounded-xl font-semibold transition-colors ${
            filter === 'TASK'
              ? 'bg-accent text-white shadow-glow'
              : 'bg-navy-850/60 text-slate-400 hover:text-white border border-white/5'
          }`}
        >
          Tâches
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 rounded-3xl glass-panel border border-white/10 text-center space-y-3">
            <Bell className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-white font-bold text-sm">Aucune notification dans cette vue</p>
            <p className="text-xs text-slate-400">
              Vous êtes parfaitement à jour dans vos messages et vos alertes !
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                notif.isRead
                  ? 'bg-navy-900/50 border-white/5 text-slate-400'
                  : 'bg-navy-850 border-accent/30 text-white shadow-sm ring-1 ring-accent/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-bold ${notif.isRead ? 'text-slate-300' : 'text-white'}`}>
                        {notif.title}
                      </h3>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 pt-2 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="uppercase tracking-wider font-semibold text-slate-400">
                        {notif.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                      title="Ouvrir le lien"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  {!notif.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(notif.id)
                      }}
                      className="text-[11px] text-accent-glow hover:underline px-2 py-1"
                    >
                      Lu
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
