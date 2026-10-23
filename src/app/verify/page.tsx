'use client'

import React, { useState } from 'react'
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
} from 'lucide-react'

export default function VerifyPortalPage() {
  const [badgeCode, setBadgeCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVerify = async (codeToVerify?: string) => {
    const code = (codeToVerify || badgeCode).trim()
    if (!code) {
      setError('Veuillez saisir un identifiant de badge valide')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch(`/api/badges/verify/${encodeURIComponent(code)}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Erreur lors de la vérification')
      } else {
        setResult(data.verification)
      }
    } catch (err) {
      setError('Impossible de joindre le serveur de vérification INSIM')
    } finally {
      setLoading(false)
    }
  }

  const sampleCodes = [
    { label: 'Badge Président (Valide)', code: 'INSIM-8B4F-29E1-C34A' },
    { label: 'Chef de Projet (Valide)', code: 'INSIM-4D9A-71C5-9F2B' },
    { label: 'Badge Révoqué (Test Sécurité)', code: 'INSIM-0000-REVOKED-X1' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent-glow text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Vérificateur Officiel Certifié INSIM ID</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">
          Contrôle d&apos;Authenticité des Badges
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Système cryptographique de vérification en temps réel pour le contrôle d&apos;accès aux événements, examens et assemblées générales du BDE.
        </p>
      </div>

      {/* Input Search Form */}
      <div className="max-w-xl mx-auto glass-panel p-4 rounded-2xl border border-white/10 shadow-card mb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleVerify()
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-grow">
            <QrCode className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={badgeCode}
              onChange={(e) => setBadgeCode(e.target.value.toUpperCase())}
              placeholder="Ex: INSIM-8B4F-29E1-C34A"
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-navy-900 border border-white/10 text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Vérifier</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Test Codes */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <p className="text-[10px] text-slate-400 mb-2 uppercase font-bold tracking-wider">
            Codes de test rapide :
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleCodes.map((s) => (
              <button
                key={s.code}
                onClick={() => {
                  setBadgeCode(s.code)
                  handleVerify(s.code)
                }}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-xl mx-auto p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs text-center mb-6">
          {error}
        </div>
      )}

      {/* Verification Result Display Card */}
      {result && (
        <div className="max-w-md mx-auto animate-in fade-in zoom-in-95 duration-200">
          <div
            className={`p-6 rounded-3xl border-2 shadow-2xl relative overflow-hidden ${
              result.status === 'VALID'
                ? 'bg-gradient-to-b from-navy-900 to-emerald-950/40 border-emerald-500/50'
                : result.status === 'EXPIRED'
                ? 'bg-gradient-to-b from-navy-900 to-amber-950/40 border-amber-500/50'
                : result.status === 'REVOKED'
                ? 'bg-gradient-to-b from-navy-900 to-red-950/40 border-red-500/50'
                : 'bg-navy-900 border-slate-700'
            }`}
          >
            {/* Top Status Banner */}
            <div className="text-center pb-5 border-b border-white/10">
              {result.status === 'VALID' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/40 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>BADGE OFFICIELLEMENT CERTIFIÉ VALIDE</span>
                </div>
              )}

              {result.status === 'EXPIRED' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/40 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>BADGE EXPIRÉ</span>
                </div>
              )}

              {result.status === 'REVOKED' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/40 mb-2">
                  <XCircle className="w-4 h-4" />
                  <span>BADGE OFFICIELLEMENT RÉVOQUÉ</span>
                </div>
              )}

              {result.status === 'NOT_FOUND' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/20 text-slate-300 text-xs font-bold border border-slate-500/40 mb-2">
                  <XCircle className="w-4 h-4" />
                  <span>BADGE INCONNU OU FALSIFIÉ</span>
                </div>
              )}

              <p className="font-mono text-xs text-slate-400 mt-1">
                Code : <span className="text-white font-bold">{result.badgeCode}</span>
              </p>
            </div>

            {/* Member Details if found */}
            {result.status !== 'NOT_FOUND' ? (
              <div className="py-5 space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Titulaire accrédité :</span>
                  <span className="font-bold text-white text-sm">
                    {result.memberDisplayName}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Rôle / Fonction :</span>
                  <span className="font-semibold text-accent-cyan">
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
                    {result.issueDate ? new Date(result.issueDate).toLocaleDateString('fr-FR') : '-'}
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
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 mt-3">
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
              <div className="py-6 text-center text-xs text-slate-400">
                <p>Aucun badge correspondant n&apos;existe dans le registre officiel INSIM CONNECT.</p>
                <p className="mt-1 text-red-400 font-semibold">
                  Attention : ce code ne confère aucun droit d&apos;accès.
                </p>
              </div>
            )}

            {/* Security Guarantee Note */}
            <div className="pt-4 border-t border-white/10 text-center text-[10px] text-slate-500">
              Contrôlé cryptographiquement par le serveur sécurisé INSIM le{' '}
              {new Date(result.verifiedAt).toLocaleTimeString('fr-FR')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
