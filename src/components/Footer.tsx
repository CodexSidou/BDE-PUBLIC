import React from 'react'
import Link from 'next/link'
import { Shield, Mail, MapPin, Heart, ExternalLink } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="w-full bg-navy-950 border-t border-white/10 text-slate-400 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo.png" 
                alt="BDE INSIM" 
                className="w-8 h-8 rounded-lg object-cover"
              />
              <span className="text-white font-bold text-base tracking-tight">
                BDE INSIM
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              La plateforme officielle du Bureau des Étudiants de l&apos;Institut Supérieur de Management et d&apos;Informatique (INSIM). Plus qu&apos;une école, une communauté.
            </p>
            <div className="flex items-center gap-2 text-xs text-accent-glow font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Système Opérationnel • v1.0 Production</span>
            </div>
          </div>

          {/* Navigation Rapide */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/news" className="hover:text-white transition-colors">
                  Actualités & Annonces
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-white transition-colors">
                  Calendrier des Événements
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  Projets & Pôles BDE
                </Link>
              </li>
              <li>
                <Link href="/student-life" className="hover:text-white transition-colors">
                  Clubs & Vie de Campus
                </Link>
              </li>
              <li>
                <Link href="/ideas" className="hover:text-white transition-colors">
                  Boîte à Idées & Sondages
                </Link>
              </li>
            </ul>
          </div>

          {/* Modules Clés */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Services Étudiants
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard/badges" className="hover:text-white transition-colors">
                  Badge Numérique INSIM ID
                </Link>
              </li>
              <li>
                <Link href="/verify" className="hover:text-white transition-colors">
                  Vérificateur QR de Badges
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Espace Membres BDE
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Assistance & BDE Helpdesk
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal & Sécurité */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">
              Confidentialité & Sécurité
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Politique de Confidentialité
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Conditions d&apos;Utilisation
                </Link>
              </li>
              <li className="flex items-center gap-2 pt-2 text-[11px] text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span>Campus INSIM, Algérie</span>
              </li>
              <li className="flex items-center gap-2 text-[11px] text-slate-500">
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span>bde@insim-student.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} INSIM CONNECT — Bureau des Étudiants. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Fait avec <Heart className="w-3 h-3 text-red-500 fill-red-500" /> par le BDE INSIM
            </span>
            <span>•</span>
            <span className="text-slate-400">PostgreSQL Powered</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
