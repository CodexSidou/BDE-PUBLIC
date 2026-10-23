import React from 'react'
import Link from 'next/link'
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  ArrowLeft,
  Building,
  GraduationCap,
} from 'lucide-react'
import { verifyBadgeByCode } from '@/lib/badges'

export const revalidate = 0

export default async function DirectVerifyPage({
  params,
}: {
  params: { code: string }
}) {
  const result = await verifyBadgeByCode(params.code)

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/verify"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Vérifier un autre badge</span>
        </Link>

        <div
          className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl relative overflow-hidden ${
            result.status === 'VALID'
              ? 'bg-gradient-to-b from-navy-900 to-emerald-950/40 border-emerald-500/60'
              : result.status === 'EXPIRED'
              ? 'bg-gradient-to-b from-navy-900 to-amber-950/40 border-amber-500/60'
              : result.status === 'REVOKED'
              ? 'bg-gradient-to-b from-navy-900 to-red-950/40 border-red-500/60'
              : 'bg-navy-900 border-slate-700'
          }`}
        >
          {/* Header */}
          <div className="text-center pb-6 border-b border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white mx-auto mb-3 shadow-glow">
              <Shield className="w-6 h-6" />
            </div>

            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="font-extrabold text-base text-white tracking-tight">
                INSIM
              </span>
              <span className="font-extrabold text-base text-accent-glow">
                ID
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Certificat Officiel d&apos;Authenticité
            </p>

            <div className="mt-4">
              {result.status === 'VALID' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black border border-emerald-500/40">
                  <CheckCircle className="w-4 h-4" />
                  <span>BADGE VALIDE & CERTIFIÉ</span>
                </div>
              )}

              {result.status === 'EXPIRED' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black border border-amber-500/40">
                  <AlertTriangle className="w-4 h-4" />
                  <span>BADGE EXPIRÉ</span>
                </div>
              )}

              {result.status === 'REVOKED' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-black border border-red-500/40">
                  <XCircle className="w-4 h-4" />
                  <span>BADGE RÉVOQUÉ</span>
                </div>
              )}

              {result.status === 'NOT_FOUND' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/20 text-slate-300 text-xs font-black border border-slate-500/40">
                  <XCircle className="w-4 h-4" />
                  <span>BADGE NON RECONNU</span>
                </div>
              )}
            </div>

            <p className="font-mono text-xs text-slate-400 mt-2">
              Identifiant :{' '}
              <span className="font-bold text-white tracking-wider">
                {result.badgeCode}
              </span>
            </p>
          </div>

          {/* Details */}
          {result.status !== 'NOT_FOUND' ? (
            <div className="py-6 space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Titulaire :</span>
                <span className="font-bold text-white text-sm">
                  {result.memberDisplayName}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Fonction / Rôle :</span>
                <span className="font-semibold text-accent-cyan">
                  {result.roleTitle}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Projet / Entité :</span>
                <span className="font-medium text-white">
                  {result.projectTitle}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Date de délivrance :</span>
                <span className="text-slate-300">
                  {result.issueDate ? new Date(result.issueDate).toLocaleDateString('fr-FR') : '-'}
                </span>
              </div>

              {result.expiresAt && (
                <div className="flex justify-between items-center py-1 border-b border-white/5">
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
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              <p>Ce code n&apos;est pas enregistré dans l&apos;annuaire du BDE INSIM.</p>
            </div>
          )}

          <div className="pt-4 border-t border-white/10 text-center text-[10px] text-slate-500">
            Horodatage du contrôle : {new Date().toLocaleTimeString('fr-FR')}
          </div>
        </div>
      </div>
    </div>
  )
}
