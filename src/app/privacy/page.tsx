import React from 'react'
import { ShieldCheck } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <ShieldCheck className="w-8 h-8 text-accent-glow mx-auto mb-2" />
        <h1 className="text-3xl font-black text-white tracking-tight">
          Politique de Confidentialité & Protection des Données
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Dernière mise à jour : Octobre 2026 • Mandat BDE INSIM
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Collecte et Utilisation des Données</h2>
          <p>
            INSIM CONNECT collecte uniquement les données nécessaires à l&apos;identification académique des étudiants (nom, prénom, adresse email institutionnelle, numéro d&apos;étudiant, niveau d&apos;études et filière). Ces données sont exclusivement utilisées pour la gestion associative, l&apos;accès aux événements et la délivrance des badges INSIM ID.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Sécurité des Badges et QR Codes</h2>
          <p>
            Les QR codes imprimés sur les badges INSIM ID ne contiennent aucune information sensible ou bancaire en clair. Ils intègrent un token cryptographique aléatoire et imprévisible vérifié de manière sécurisée sur nos serveurs PostgreSQL.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Non-divulgation à des Tiers</h2>
          <p>
            Le BDE INSIM s&apos;engage formellement à ne jamais commercialiser, échanger ou transférer les données nominatives des étudiants à des tiers ou partenaires publicitaires.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Vos Droits d&apos;Accès et de Rectification</h2>
          <p>
            Conformément à la réglementation sur la protection des données, vous pouvez à tout moment solliciter la consultation, la rectification ou la suppression de vos données personnelles en adressant une demande officielle à <code>bde@insim-student.edu</code>.
          </p>
        </section>
      </div>
    </div>
  )
}
