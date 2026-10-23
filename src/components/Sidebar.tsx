'use client'

import React from 'react'
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
  PlusCircle,
  Eye,
} from 'lucide-react'
import { SessionUser } from '@/types'
import { isBdeStaff, isFinanceManager, isExecutive } from '@/lib/permissions'

interface SidebarProps {
  user: SessionUser
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

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
      label: isFinance ? 'Finances & Grand Livre' : 'Transparence & Investissements',
      href: '/dashboard/finances',
      icon: CreditCard,
      show: isBde, // Mandatory transparency for normal BDE members (read-only)
      sublabel: isFinance ? 'Gestion' : 'Lecture seule',
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
      label: 'Gestion Utilisateurs & Rôles',
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

  return (
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
        {links
          .filter((item) => item.show)
          .map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
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
  )
}
