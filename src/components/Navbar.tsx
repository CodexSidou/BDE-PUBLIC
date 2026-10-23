'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Shield,
  Menu,
  X,
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  LayoutDashboard,
  Award,
  Sparkles,
  Calendar,
  FolderKanban,
  QrCode,
} from 'lucide-react'
import { SessionUser } from '@/types'

interface NavbarProps {
  user?: SessionUser | null
  unreadNotificationsCount?: number
}

export default function Navbar({
  user,
  unreadNotificationsCount = 0,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (e) {
      console.error(e)
    }
  }

  const navLinks = [
    { label: 'Accueil', href: '/' },
    { label: 'Actualités', href: '/news' },
    { label: 'Événements', href: '/events' },
    { label: 'Projets', href: '/projects' },
    { label: 'Vie Étudiante', href: '/student-life' },
    { label: 'Idées & Sondages', href: '/ideas' },
    { label: 'Contact', href: '/contact' },
  ]

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'PRESIDENT':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      case 'VICE_PRESIDENT':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30'
      case 'TREASURER':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      case 'PROJECT_MANAGER':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30'
      case 'BDE_MEMBER':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
      case 'CLASS_DELEGATE':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/20'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'PRESIDENT':
        return 'Président BDE'
      case 'VICE_PRESIDENT':
        return 'Vice-Président'
      case 'TREASURER':
        return 'Trésorier'
      case 'PROJECT_MANAGER':
        return 'Chef de Projet'
      case 'BDE_MEMBER':
        return 'Membre BDE'
      case 'CLASS_DELEGATE':
        return 'Délégué'
      case 'STUDENT':
        return 'Étudiant'
      default:
        return 'Visiteur'
    }
  }

  const isBde =
    user &&
    [
      'BDE_MEMBER',
      'PROJECT_MANAGER',
      'TREASURER',
      'VICE_PRESIDENT',
      'PRESIDENT',
    ].includes(user.role)

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 bg-navy-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt="BDE INSIM Logo" 
              className="w-10 h-10 rounded-xl object-cover shadow-glow group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-white tracking-tight">
                  BDE
                </span>
                <span className="font-extrabold text-lg text-accent-glow">
                  INSIM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                Plus qu&apos;une école, une communauté
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-white bg-accent/20 border border-accent/40'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Right Area: Auth / Dashboard / Notifications */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Notifications Link */}
                <Link
                  href="/dashboard/notifications"
                  className="relative p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl border border-white/5 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                    </span>
                  )}
                </Link>

                {/* Direct Dashboard Link */}
                <Link
                  href={isBde ? '/dashboard/bde' : '/dashboard'}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-glow transition-all hover:scale-[1.02]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{isBde ? 'Espace BDE' : 'Mon Espace'}</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-navy-800 border border-accent/30 flex items-center justify-center font-bold text-xs text-accent-glow">
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </div>
                    <div className="text-left hidden xl:block">
                      <p className="text-xs font-semibold text-white leading-tight">
                        {user.firstName} {user.lastName}
                      </p>
                      <span
                        className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(
                          user.role
                        )}`}
                      >
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-card border border-white/10 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2.5 border-b border-white/10">
                        <p className="text-xs text-slate-400">Connecté en tant que</p>
                        <p className="text-sm font-semibold text-white truncate">
                          {user.email}
                        </p>
                        <p
                          className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(
                            user.role
                          )}`}
                        >
                          {getRoleLabel(user.role)}
                        </p>
                      </div>

                      <Link
                        href="/dashboard/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Mon Profil</span>
                      </Link>

                      <Link
                        href="/dashboard/badges"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5"
                      >
                        <Award className="w-4 h-4 text-accent-glow" />
                        <span>Mon Badge INSIM ID</span>
                      </Link>

                      <Link
                        href="/verify?mode=camera"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 font-medium"
                      >
                        <QrCode className="w-4 h-4 text-cyan-400" />
                        <span>Scanner un QR Badge</span>
                      </Link>

                      {isBde && (
                        <Link
                          href="/dashboard/bde"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-200 hover:text-white hover:bg-white/5"
                        >
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Console BDE</span>
                        </Link>
                      )}

                      <div className="my-1 border-t border-white/10" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 rounded-xl text-sm font-semibold bg-accent hover:bg-accent-hover text-white shadow-glow transition-all"
                >
                  S&apos;inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            {user && (
              <Link
                href="/dashboard"
                className="p-2 rounded-lg bg-accent text-white"
                title="Mon Espace"
              >
                <LayoutDashboard className="w-4 h-4" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:text-white hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-white/10">
            {user ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-sm font-semibold text-white">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <Link
                  href={isBde ? '/dashboard/bde' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent text-white text-sm font-semibold shadow-glow"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{isBde ? 'Console BDE & Gestion' : 'Accéder à mon Espace'}</span>
                </Link>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <Link
                    href="/dashboard/events"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium"
                  >
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Événements</span>
                  </Link>
                  <Link
                    href="/dashboard/projects"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium"
                  >
                    <FolderKanban className="w-3.5 h-3.5 text-blue-400" />
                    <span>Projets</span>
                  </Link>
                  <Link
                    href="/dashboard/badges"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium"
                  >
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Mon Badge</span>
                  </Link>
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Mon Profil</span>
                  </Link>
                </div>

                <Link
                  href="/verify?mode=camera"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-accent/30 to-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-bold text-xs shadow-glow transition-all"
                >
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>Scanner un QR Badge INSIM</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 text-sm font-medium pt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-xl border border-white/10 text-white font-medium text-sm"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center px-4 py-2 rounded-xl bg-accent text-white font-semibold text-sm"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
