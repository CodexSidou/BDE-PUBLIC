import React from 'react'
import { FileText } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="text-center max-w-xl mx-auto">
        <FileText className="w-8 h-8 text-accent-glow mx-auto mb-2" />
        <h1 className="text-3xl font-black text-white tracking-tight">
          Conditions Générales d&apos;Utilisation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Règles d&apos;usage de la plateforme officielle INSIM CONNECT
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Acceptation des Conditions</h2>
          <p>
            L&apos;accès et l&apos;utilisation de la plateforme INSIM CONNECT impliquent l&apos;adhésion pleine et entière aux présentes conditions d&apos;utilisation et au règlement intérieur de l&apos;institut INSIM.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Usage des Badges Numériques INSIM ID</h2>
          <p>
            Le badge numérique délivré est personnel et incessible. Toute tentative d&apos;usurpation d&apos;identité, de falsification de QR code ou de transfert de badge entraînera la révocation immédiate du compte et d&apos;éventuelles sanctions disciplinaires.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Démocratie Participative & Modération</h2>
          <p>
            Les propositions soumises dans la boîte à idées et les commentaires doivent respecter les principes de courtoisie, de tolérance et de respect mutuel. Les propos diffamatoires ou discriminatoires sont strictement prohibés.
          </p>
        </section>
      </div>
    </div>
  )
}
