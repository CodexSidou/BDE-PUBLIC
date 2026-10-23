'use client'

import React, { useRef } from 'react'
import Image from 'next/image'
import {
  Shield,
  Download,
  Printer,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Building,
  GraduationCap,
  Sparkles,
  QrCode as QrIcon,
} from 'lucide-react'

export interface BadgeCardProps {
  badge: {
    id: string
    badgeCode: string
    roleTitle: string
    issueDate: string
    expiresAt?: string | null
    status: 'VALID' | 'EXPIRED' | 'REVOKED'
    revokedReason?: string | null
    user: {
      firstName: string
      lastName: string
      studentNumber?: string | null
      department?: string | null
      studyYear?: string | null
      avatarUrl?: string | null
    }
    project?: {
      title: string
    } | null
  }
  qrCodeDataUrl?: string
  showActions?: boolean
}

export default function BadgeCard({
  badge,
  qrCodeDataUrl,
  showActions = true,
}: BadgeCardProps) {
  const badgeRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    window.print()
  }

  const getStatusBadge = () => {
    switch (badge.status) {
      case 'VALID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            <CheckCircle className="w-3 h-3" />
            Certifié Valide
          </span>
        )
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <AlertTriangle className="w-3 h-3" />
            Badge Expiré
          </span>
        )
      case 'REVOKED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-red-500/20 text-red-400 border border-red-500/40">
            <XCircle className="w-3 h-3" />
            Badge Révoqué
          </span>
        )
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Printable Badge Container */}
      <div
        ref={badgeRef}
        className="w-full max-w-[340px] sm:max-w-[360px] rounded-3xl bg-gradient-to-b from-navy-850 via-navy-900 to-navy-950 border-2 border-accent/40 shadow-2xl overflow-hidden relative p-6 text-white"
        style={{
          boxShadow: '0 20px 40px -10px rgba(0, 102, 255, 0.25)',
        }}
      >
        {/* Holographic Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-accent via-cyan-400 to-accent-electric" />

        {/* Header Branding */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shadow-glow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  INSIM
                </span>
                <span className="font-extrabold text-sm text-accent-glow">
                  ID
                </span>
              </div>
              <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
                Bureau des Étudiants
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Member Profile Section */}
        <div className="py-5 text-center flex flex-col items-center">
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-2xl bg-navy-800 border-2 border-accent flex items-center justify-center font-extrabold text-xl text-accent-glow shadow-glow overflow-hidden">
              {badge.user.avatarUrl ? (
                <img
                  src={badge.user.avatarUrl}
                  alt={`${badge.user.firstName} ${badge.user.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>
                  {badge.user.firstName[0]}
                  {badge.user.lastName[0]}
                </span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-accent flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <h3 className="text-lg font-black text-white tracking-tight">
            {badge.user.firstName} {badge.user.lastName}
          </h3>

          <p className="mt-0.5 text-xs font-semibold text-accent-cyan">
            {badge.roleTitle}
          </p>

          <p className="mt-1 text-[11px] text-slate-300 font-medium">
            {badge.project ? badge.project.title : 'BDE INSIM Officiel'}
          </p>
        </div>

        {/* Academic Details Meta */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] mb-4">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
              N° Étudiant
            </span>
            <span className="font-mono font-bold text-white">
              {badge.user.studentNumber || 'INSIM-2026'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">
              Filière / Niveau
            </span>
            <span className="font-medium text-white truncate block">
              {badge.user.studyYear || 'L3'} - {badge.user.department || 'Informatique'}
            </span>
          </div>
        </div>

        {/* QR Code Verification Block */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="p-1.5 bg-white rounded-xl flex-shrink-0 shadow-md">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code de Vérification"
                className="w-16 h-16"
              />
            ) : (
              <div className="w-16 h-16 flex items-center justify-center bg-slate-100 text-navy-950">
                <QrIcon className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block">
              Identifiant Unique de Contrôle
            </span>
            <p className="font-mono font-bold text-xs text-white tracking-wider truncate">
              {badge.badgeCode}
            </p>
            <p className="text-[10px] text-accent-glow font-medium mt-1">
              Scannez pour vérifier l&apos;authenticité
            </p>
          </div>
        </div>

        {/* Revoked Notice if applicable */}
        {badge.status === 'REVOKED' && badge.revokedReason && (
          <div className="mt-3 p-2 rounded-lg bg-red-500/20 border border-red-500/30 text-[10px] text-red-300 text-center">
            Raison: {badge.revokedReason}
          </div>
        )}

        {/* Footer Validity */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            Délivré le {new Date(badge.issueDate).toLocaleDateString('fr-FR')}
          </span>
          {badge.expiresAt && (
            <span>
              Exp: {new Date(badge.expiresAt).toLocaleDateString('fr-FR')}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons (Excluded from print) */}
      {showActions && (
        <div className="mt-4 flex items-center gap-3 no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs font-semibold border border-white/10 shadow-md transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer / PDF</span>
          </button>
        </div>
      )}
    </div>
  )
}
