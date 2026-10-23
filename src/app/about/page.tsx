import React from 'react'
import { Shield, Sparkles, Target, Eye, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent-glow text-xs font-semibold mb-3">
          <Shield className="w-4 h-4" />
          <span>À Propos d&apos;INSIM CONNECT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          La Vision du BDE INSIM
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Une plateforme moderne conçue par et pour les étudiants afin de garantir une vie associative dynamique, transparente et connectée.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-accent-glow" />
            <span>Notre Mission</span>
          </h2>
          <p>
            Le Bureau des Étudiants (BDE) de l&apos;Institut Supérieur de Management et d&apos;Informatique (INSIM) œuvre pour le rayonnement intellectuel, culturel, sportif et professionnel de la communauté étudiante. INSIM CONNECT est le pivot technologique permettant à chaque étudiant de s&apos;impliquer activement, de proposer des projets et de suivre l&apos;affectation des budgets associatifs.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-400" />
            <span>Transparence & Gouvernance Participative</span>
          </h2>
          <p>
            Contrairement aux modèles associatifs opaques, INSIM CONNECT consacre le droit de regard des membres du BDE sur l&apos;état financier en temps réel. Grâce à un grand livre comptable strict et à la publication des dépenses et investissements par projet, chaque dinar alloué fait l&apos;objet d&apos;un contrôle rigoureux.
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Sécurité & Certification INSIM ID</span>
          </h2>
          <p>
            Chaque membre et responsable dispose d&apos;un badge numérique infalsifiable doté d&apos;un QR code à vérification cryptographique. Cette technologie assure l&apos;intégrité des contrôles lors des événements du campus et garantit la protection stricte des données personnelles des étudiants conformément aux normes internationales et locales.
          </p>
        </div>
      </div>
    </div>
  )
}
