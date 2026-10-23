import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Award,
  PlusCircle,
  Shield,
  QrCode,
  Printer,
  Sparkles,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateQrCodeDataUrl } from '@/lib/badges'
import { isExecutive, isBdeStaff } from '@/lib/permissions'
import BadgeCard from '@/components/BadgeCard'

export const revalidate = 0

export default async function BadgesManagementPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const isExec = isExecutive(user.role)
  const isBde = isBdeStaff(user.role)

  // 1. Fetch own badges
  const ownBadges = await prisma.digitalBadge.findMany({
    where: { userId: user.id },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          studentNumber: true,
          department: true,
          studyYear: true,
          avatarUrl: true,
        },
      },
      project: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Pre-generate QR code data URLs for own badges
  const ownBadgesWithQr = await Promise.all(
    ownBadges.map(async (b) => {
      const qr = await generateQrCodeDataUrl(b.badgeCode)
      return {
        badge: {
          ...b,
          issueDate: b.issueDate.toISOString(),
          expiresAt: b.expiresAt ? b.expiresAt.toISOString() : null,
          status: b.status as 'VALID' | 'EXPIRED' | 'REVOKED',
        },
        qr,
      }
    })
  )

  // 2. If Executive or Project Manager, fetch all issued badges for supervision
  let allIssuedBadges: any[] = []
  if (isBde) {
    allIssuedBadges = await prisma.digitalBadge.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true, department: true } },
        project: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              INSIM ID : Badges & Accréditations Numériques
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Certifié QR Sécurisé
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Génération, renouvellement et vérification en temps réel des badges officiels INSIM
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/verify"
            className="px-4 py-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 flex items-center gap-2 transition-colors"
          >
            <QrCode className="w-4 h-4 text-accent-glow" />
            <span>Vérifier un QR</span>
          </Link>
        </div>
      </div>

      {/* Section 1: Member's Own Badges */}
      <div>
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-accent-glow" />
          <span>Mes Cartes & Badges Officiels</span>
        </h2>

        {ownBadgesWithQr.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel border border-white/10 text-center text-xs text-slate-400">
            <p>Aucun badge officiel ne vous a encore été attribué.</p>
            <p className="mt-1 text-slate-500">
              Les badges sont automatiquement délivrés lors de votre adhésion au BDE ou assignation à un projet d&apos;envergure.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownBadgesWithQr.map(({ badge, qr }) => (
              <BadgeCard key={badge.id} badge={badge} qrCodeDataUrl={qr} showActions={true} />
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Supervision Registry for BDE Staff & Executives */}
      {isBde && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Registre Général des Badges Délivrés
              </h3>
              <p className="text-xs text-slate-400">
                Supervision de l&apos;ensemble des accréditations actives, expirées et révoquées
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {allIssuedBadges.length} badge(s) répertorié(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 rounded-l-lg">Identifiant Badge</th>
                  <th className="py-3 px-4">Titulaire</th>
                  <th className="py-3 px-4">Rôle / Fonction</th>
                  <th className="py-3 px-4">Projet / Entité</th>
                  <th className="py-3 px-4">Délivrance</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 rounded-r-lg text-right">Contrôle QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {allIssuedBadges.map((b) => (
                  <tr key={b.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-accent-glow">
                      {b.badgeCode}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-white">
                      {b.user.firstName} {b.user.lastName}
                    </td>
                    <td className="py-3.5 px-4 text-accent-cyan font-medium">
                      {b.roleTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {b.project ? b.project.title : 'BDE INSIM Officiel'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(b.issueDate).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          b.status === 'VALID'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : b.status === 'EXPIRED'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/verify/${b.badgeCode}`}
                        target="_blank"
                        className="text-xs text-accent-glow hover:underline font-semibold"
                      >
                        Vérifier ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
