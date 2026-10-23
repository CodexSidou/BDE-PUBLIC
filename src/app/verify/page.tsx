'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Sparkles,
  QrCode,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  History,
  UserCheck,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react'
import BadgeScanner from '@/components/BadgeScanner'

interface VerificationHistoryItem {
  id: string
  code: string
  name: string
  role: string
  status: 'VALID' | 'EXPIRED' | 'REVOKED' | 'NOT_FOUND'
  timestamp: string
}

function VerifyPortalContent() {
  const searchParams = useSearchParams()
  const initialMode = (searchParams.get('mode') as 'camera' | 'file' | 'manual') || 'camera'
  const initialCode = searchParams.get('code') || ''

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<VerificationHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Verify badge via API
  const handleVerify = async (code: string) => {
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/badges/verify/${encodeURIComponent(cleanCode)}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Erreur lors de la vérification du badge')
        setResult({
          status: 'NOT_FOUND',
          badgeCode: cleanCode,
          verifiedAt: new Date().toISOString(),
        })
      } else {
        const ver = data.verification
        setResult(ver)

        // Add to session history
        setHistory((prev) => [
          {
            id: Math.random().toString(36).substring(2, 9),
            code: ver.badgeCode,
            name: ver.memberDisplayName || 'Inconnu',
            role: ver.roleTitle || 'Visiteur',
            status: ver.status,
            timestamp: new Date().toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          },
          ...prev.slice(0, 19), // Keep last 20
        ])
      }
    } catch (err) {
      setError('Impossible de joindre le serveur de vérification INSIM')
    } finally {
      setLoading(false)
    }
  }

  // Auto-verify if code passed via URL
  useEffect(() => {
    if (initialCode) {
      handleVerify(initialCode)
    }
  }, [initialCode])

  const validCount = history.filter((h) => h.status === 'VALID').length
  const invalidCount = history.filter((h) => h.status !== 'VALID').length

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Title & Official Certification Badge */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>Vérificateur Officiel Certifié INSIM ID</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Scanner & Contrôle des Badges QR
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Système cryptographique temps réel pour le contrôle d&apos;accès aux événements, examens et assemblées générales du BDE INSIM.
        </p>
      </div>

      {/* Session Stats Banner (Gatekeeper Mode) */}
      {history.length > 0 && (
        <div className="max-w-2xl mx-auto p-3.5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 sm:gap-6">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">
                Total Scannés
              </span>
              <span className="text-white font-mono font-bold text-base">{history.length}</span>
            </div>
            <div className="border-l border-white/10 pl-3 sm:pl-6">
              <span className="text-emerald-400 text-[10px] uppercase font-bold block">
                Valides
              </span>
              <span className="text-emerald-400 font-mono font-bold text-base">{validCount}</span>
            </div>
            <div className="border-l border-white/10 pl-3 sm:pl-6">
              <span className="text-red-400 text-[10px] uppercase font-bold block">
                Rejetés / Expirés
              </span>
              <span className="text-red-400 font-mono font-bold text-base">{invalidCount}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/5 transition-colors"
          >
            <History className="w-3.5 h-3.5 text-accent-glow" />
            <span>{showHistory ? 'Masquer' : 'Historique'}</span>
          </button>
        </div>
      )}

      {/* Verification Result Card or Scanner Container */}
      {!result ? (
        <BadgeScanner
          onScanBadge={(code) => handleVerify(code)}
          initialMode={initialMode}
          isVerifying={loading}
        />
      ) : (
        /* Result Detail View with Quick Reset Button */
        <div className="max-w-lg mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div
            className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl relative overflow-hidden ${
              result.status === 'VALID'
                ? 'bg-gradient-to-b from-navy-900 via-navy-900 to-emerald-950/40 border-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.15)]'
                : result.status === 'EXPIRED'
                ? 'bg-gradient-to-b from-navy-900 via-navy-900 to-amber-950/40 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.15)]'
                : result.status === 'REVOKED'
                ? 'bg-gradient-to-b from-navy-900 via-navy-900 to-red-950/40 border-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.15)]'
                : 'bg-navy-900 border-red-500/40'
            }`}
          >
            {/* Header Status Badge */}
            <div className="text-center pb-6 border-b border-white/10">
              <div className="flex justify-center mb-3">
                {result.status === 'VALID' && (
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
                    <CheckCircle className="w-9 h-9" />
                  </div>
                )}
                {result.status === 'EXPIRED' && (
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="w-9 h-9" />
                  </div>
                )}
                {result.status === 'REVOKED' && (
                  <div className="w-16 h-16 rounded-2xl bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center text-red-400">
                    <XCircle className="w-9 h-9" />
                  </div>
                )}
                {result.status === 'NOT_FOUND' && (
                  <div className="w-16 h-16 rounded-2xl bg-slate-500/20 border-2 border-slate-500/40 flex items-center justify-center text-slate-300">
                    <XCircle className="w-9 h-9" />
                  </div>
                )}
              </div>

              {result.status === 'VALID' && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black tracking-wide border border-emerald-500/40 uppercase">
                  <span>BADGE ACCRÉDITÉ & VALIDE</span>
                </div>
              )}

              {result.status === 'EXPIRED' && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black tracking-wide border border-amber-500/40 uppercase">
                  <span>BADGE OFFICIELLEMENT EXPIRÉ</span>
                </div>
              )}

              {result.status === 'REVOKED' && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-black tracking-wide border border-red-500/40 uppercase">
                  <span>BADGE RÉVOQUÉ - ACCÈS REFUSÉ</span>
                </div>
              )}

              {result.status === 'NOT_FOUND' && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-black tracking-wide border border-red-500/40 uppercase">
                  <span>BADGE NON ENREGISTRÉ</span>
                </div>
              )}

              <p className="font-mono text-xs text-slate-400 mt-2.5">
                Code : <span className="text-white font-bold">{result.badgeCode}</span>
              </p>
            </div>

            {/* Member Details */}
            {result.status !== 'NOT_FOUND' ? (
              <div className="py-5 space-y-3.5 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Titulaire :</span>
                  <span className="font-bold text-white text-sm">
                    {result.memberDisplayName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Rôle / Fonction :</span>
                  <span className="font-semibold text-cyan-400">
                    {result.roleTitle}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Affiliation :</span>
                  <span className="font-medium text-white">
                    {result.projectTitle}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Date d&apos;émission :</span>
                  <span className="text-slate-300">
                    {result.issueDate
                      ? new Date(result.issueDate).toLocaleDateString('fr-FR')
                      : '-'}
                  </span>
                </div>

                {result.expiresAt && (
                  <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                    <span className="text-slate-400">Date d&apos;expiration :</span>
                    <span className="text-slate-300">
                      {new Date(result.expiresAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                )}

                {result.status === 'REVOKED' && (
                  <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 mt-3">
                    <p className="font-bold">Motif de révocation administrative :</p>
                    <p className="mt-0.5">{result.revokedReason}</p>
                    {result.revokedAt && (
                      <p className="mt-1 text-[10px] text-red-300">
                        Révoqué le {new Date(result.revokedAt).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <p>Ce code n&apos;existe pas dans le registre officiel des badges INSIM.</p>
                <p className="text-red-400 font-semibold">
                  Attention : ce code ne confère aucun droit d&apos;accès.
                </p>
              </div>
            )}

            {/* Cryptographic verification stamp */}
            <div className="pt-4 border-t border-white/10 text-center text-[10px] text-slate-500">
              Certifié par le serveur sécurisé INSIM à{' '}
              {new Date(result.verifiedAt).toLocaleTimeString('fr-FR')}
            </div>
          </div>

          {/* Big Action Button: Next Scan */}
          <button
            type="button"
            onClick={() => {
              setResult(null)
              setError(null)
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-accent to-accent-electric hover:opacity-90 text-white font-black text-sm shadow-glow flex items-center justify-center gap-2.5 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Scanner le badge suivant</span>
          </button>
        </div>
      )}

      {/* History Slide-Out Drawer or Panel */}
      {showHistory && history.length > 0 && (
        <div className="max-w-2xl mx-auto p-4 sm:p-5 rounded-2xl glass-panel border border-white/10 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Derniers Badges Contrôlés (Session active)</span>
            </h3>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="text-[10px] text-slate-400 hover:text-red-400 transition-colors"
            >
              Effacer la session
            </button>
          </div>

          <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
            {history.map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {item.status === 'VALID' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : item.status === 'EXPIRED' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-white">{item.name}</p>
                    <p className="font-mono text-[10px] text-slate-400">
                      {item.code} • {item.role}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      item.status === 'VALID'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : item.status === 'EXPIRED'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {item.status}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function VerifyPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xs font-semibold text-slate-400">
            Chargement du portail de vérification INSIM...
          </p>
        </div>
      }
    >
      <VerifyPortalContent />
    </Suspense>
  )
}
