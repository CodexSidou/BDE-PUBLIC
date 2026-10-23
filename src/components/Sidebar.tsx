'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  CreditCard,
  Award,
  Lightbulb,
  Bell,
  Users,
  ShieldAlert,
  Settings,
  FileSpreadsheet,
  Eye,
  Menu,
  X,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { SessionUser } from '@/types'
import { isBdeStaff, isFinanceManager, isExecutive } from '@/lib/permissions'

interface SidebarProps {
  user: SessionUser
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const isBde = isBdeStaff(user.role)
  const isFinance = isFinanceManager(user.role)
  const isExec = isExecutive(user.role)
  const isTreasurer = user.role === 'TREASURER'

  const links = [
    {
      label: 'Mon Espace',
      href: '/dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      label: 'Console BDE',
      href: '/dashboard/bde',
      icon: FolderKanban,
      show: isBde,
      badge: 'BDE',
    },
    {
      label: 'Projets & Pôles',
      href: '/dashboard/projects',
      icon: FolderKanban,
      show: true,
    },
    {
      label: 'Gestion des Tâches',
      href: '/dashboard/tasks',
      icon: CheckSquare,
      show: isBde,
    },
    {
      label: 'Événements BDE',
      href: '/dashboard/events',
      icon: Calendar,
      show: true,
    },
    {
      label: 'Mon Badge INSIM ID',
      href: '/dashboard/badges',
      icon: Award,
      show: true,
    },
    {
      label: isFinance ? 'Finances & Grand Livre' : 'Transparence Financière',
      href: '/dashboard/finances',
      icon: CreditCard,
      show: isBde,
      sublabel: isFinance ? 'Gestion' : 'Lecture',
    },
    {
      label: 'Demandes de Dépenses',
      href: '/dashboard/expenses',
      icon: FileSpreadsheet,
      show: isBde,
    },
    {
      label: 'Idées & Sondages',
      href: '/dashboard/ideas',
      icon: Lightbulb,
      show: true,
    },
    {
      label: 'Centre de Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
      show: true,
    },
    {
      label: 'Utilisateurs & Rôles',
      href: '/dashboard/admin/users',
      icon: Users,
      show: isExec,
      badge: 'Admin',
    },
    {
      label: "Journal d'Audit",
      href: '/dashboard/admin/audit',
      icon: ShieldAlert,
      show: isExec || isTreasurer,
      badge: 'Sécurité',
    },
    {
      label: 'Paramètres Plateforme',
      href: '/dashboard/admin/settings',
      icon: Settings,
      show: isExec,
    },
  ]

  const activeLinks = links.filter((item) => item.show)

  return (
    <>
      {/* 📱 MOBILE NAVIGATION BAR & HORIZONTAL PILLS (< md) */}
      <div className="block md:hidden w-full bg-navy-900 border-b border-white/10 p-3 space-y-3 sticky top-16 z-30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent to-accent-electric flex items-center justify-center font-bold text-white text-xs shadow-glow">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div>
              <p className="text-xs font-semibold text-white leading-tight">
                {user.firstName} {user.lastName}
              </p>
              <span className="text-[10px] text-accent-glow font-medium">
                {user.role}
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-glow transition-all"
          >
            {mobileDrawerOpen ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Fermer</span>
              </>
            ) : (
              <>
                <Menu className="w-3.5 h-3.5" />
                <span>Menu BDE</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Horizontal Scroll Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {activeLinks.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                  active
                    ? 'bg-accent text-white shadow-glow'
                    : 'bg-navy-850 text-slate-300 hover:text-white border border-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 📱 MOBILE SLIDE-OVER DRAWER OVERLAY */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-xs bg-navy-900 border-r border-white/10 h-full p-4 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-accent" />
                  <span className="font-bold text-white text-sm">Navigation Dashboard</span>
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-navy-850/80 border border-white/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-accent to-accent-electric flex items-center justify-center font-bold text-white text-xs shadow-glow">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-semibold text-white truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px] text-accent-glow font-medium truncate">
                    {user.role}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-500 px-3 pb-2 tracking-wider">
                  Modules & Administration
                </p>
                {activeLinks.map((item) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? 'bg-accent text-white shadow-glow'
                          : 'text-slate-300 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white font-bold uppercase">
                          {item.badge}
                        </span>
                      )}
                      {item.sublabel && !item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded text-slate-400 bg-white/5">
                          {item.sublabel}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <Link
                href="/verify"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors"
              >
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Scanner un QR Badge</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 💻 DESKTOP FIXED SIDEBAR (>= md) */}
      <aside className="w-64 flex-shrink-0 hidden md:block bg-navy-900/90 border-r border-white/10 min-h-[calc(100vh-4rem)] p-4">
        {/* User Quick Info */}
        <div className="p-3 mb-6 rounded-xl bg-navy-850/80 border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-accent-electric flex items-center justify-center font-bold text-white text-sm shadow-glow">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[10px] text-accent-glow font-medium truncate">
              {user.role}
            </p>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-500 px-3 pb-2 tracking-wider">
            Menu Principal
          </p>
          {activeLinks.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  active
                    ? 'bg-accent text-white shadow-glow'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white font-bold uppercase">
                    {item.badge}
                  </span>
                )}
                {item.sublabel && !item.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded text-slate-400 bg-white/5">
                    {item.sublabel}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Quick Verification Link */}
        <div className="mt-8 pt-4 border-t border-white/10">
          <Link
            href="/verify"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 border border-dashed border-white/10 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Scanner un QR Badge</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
