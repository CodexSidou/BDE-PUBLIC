# 🎓 INSIM CONNECT — Plateforme Officielle du BDE INSIM

> **Système Numérique Unifié pour les Étudiants et le Bureau des Étudiants de l'Institut Supérieur de Management et d'Informatique (INSIM)**

[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_16_Neon-blue.svg)](https://neon.tech)
[![Next.js](https://img.shields.io/badge/Framework-Next.js_14_App_Router-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript_Strict-blue.svg)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_Navy-38bdf8.svg)](https://tailwindcss.com)
[![Tests](https://img.shields.io/badge/Tests-32%2F32_Passed-success.svg)](#suite-de-tests-automatisée)
[![Security](https://img.shields.io/badge/RBAC-8_Mandatory_Roles-purple.svg)](#matrice-des-8-rôles-et-permissions)

---

## 📌 Présentation du Projet

**INSIM CONNECT** est une application web full-stack de production centralisant la vie de campus, la gouvernance étudiante et les opérations collaboratives de l'INSIM :

1. **🏛️ Portail Étudiant & Campus** : Découverte des actualités officielles, calendrier interactif des événements, vie associative et clubs.
2. **🤝 Gestion de Projets & Collaborations BDE** : Tableaux Kanban, assignation des responsabilités, suivi des livrables et gestion d'équipes.
3. **🪪 INSIM ID (Badges Numériques & QR Anti-Fraude)** : Génération d'accréditations avec tokens cryptographiques aléatoires et portail public de vérification immédiate (`/verify/[code]`) distinguant les états **VALIDE**, **EXPIRÉ** et **RÉVOQUÉ**.
4. **💰 Transparence Financière & Trésorerie Auditable** : Suivi des investissements par projet accessible en **lecture seule** pour tous les membres ordinaires du BDE, grand livre comptable rigoureux, et application stricte de la **règle anti-auto-approbation**.
5. **🗳️ Démocratie Participative** : Boîte à idées avec modération et sondages d'opinion avec protection serveur contre les votes doubles.
6. **🛡️ Sécurité & Conformité OWASP** : Contrôle d'accès basé sur les rôles (RBAC) appliqué au niveau serveur, journalisation d'audit immuable et isolation des données.

---

## 👥 Matrice des 8 Rôles et Permissions

Le système applique de manière stricte le principe du moindre privilège au niveau des Server Actions, des routes API et des requêtes Prisma :

| Rôle | Accès Public | Espace Personnel | Console BDE | Transparence Investissements | Grand Livre Financier | Décaissement & Paiement | Gestion Rôles & Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **1. VISITOR** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **2. STUDENT** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **3. CLASS_DELEGATE** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **4. BDE_MEMBER** | ✅ | ✅ | ✅ | ✅ *(Lecture Seule)* | ❌ | ❌ | ❌ |
| **5. PROJECT_MANAGER** | ✅ | ✅ | ✅ | ✅ *(Par Projet)* | ❌ | ❌ | ❌ |
| **6. TREASURER** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **7. VICE_PRESIDENT** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ *(Admin)* |
| **8. PRESIDENT** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ *(Admin Chef)* |

> ⚠️ **Règles Non-Négociables Appliquées :**
> - **Aucun rôle "TECHNICAL_ADMIN" séparé** : Le Président et le Vice-Président sont les seuls administrateurs techniques de la plateforme.
> - **Anti-Auto-Élévation** : Aucun utilisateur ne peut modifier son propre rôle ou s'auto-attribuer les privilèges de Vice-Président ou Président.
> - **Anti-Auto-Approbation Financière** : Un demandeur de dépense ne peut jamais approuver sa propre demande, quel que soit son rôle hiérarchique.
> - **Indépendance Approbation / Paiement** : L'approbation d'une dépense ne déclenche pas automatiquement le paiement ; un décaissement distinct doit être enregistré avec horodatage et référence de pièce comptable.

---

## 🧮 Modèle Comptable & Formule de Solde

Conformément au cahier des charges, les montants financiers utilisent des types **Decimal PostgreSQL** (`Decimal(12, 2)`) pour éliminer tout risque d'arrondi flottant :

$$\text{Solde Disponible Net} = \text{Solde d'Ouverture} + \text{Recettes Confirmées} - \text{Dépenses Confirmées et Payées} - \text{Fonds Réservés aux Projets en Cours}$$

- **Transparence pour les membres ordinaires du BDE** : Visualisation en direct du montant total investi, de la répartition budgétaire projet par projet et du taux d'exécution, sans accès aux coordonnées bancaires ou pièces sensibles des fournisseurs.

---

## 🔐 Identifiants de Démonstration (Comptes de Test Pré-chargés)

Le mot de passe universel pour l'ensemble des comptes de démonstration est :  
👉 `InsimConnect2026!`

| Rôle | Adresse Email | Prénom & Nom | Fonction Spécifique |
| :--- | :--- | :--- | :--- |
| **PRESIDENT** | `president@insim.edu` | Yacine Belkacem | Président BDE & Administrateur |
| **VICE_PRESIDENT** | `vp@insim.edu` | Amina Cherif | Vice-Présidente & Administratrice |
| **TREASURER** | `tresorier@insim.edu` | Mehdi Benali | Trésorier Général |
| **PROJECT_MANAGER** | `chef.projet@insim.edu` | Sofiane Khelil | Responsable Hackathon IA 2026 |
| **BDE_MEMBER** | `bde.sarah@insim.edu` | Sarah Touati | Pôle Communication & Design |
| **CLASS_DELEGATE** | `delegue.l3@insim.edu` | Rayan Bouzid | Délégué Licence 3 |
| **STUDENT** | `etudiant.lydia@insim.edu` | Lydia Hadj | Étudiante Licence 2 |
| **VISITOR** | *(Navigation publique sans compte)* | - | Visiteur externe |

---

## 🚀 Installation & Démarrage Local

### Prérequis
- Node.js 18+ (testé avec succès sous Node.js v24.15)
- npm 10+
- Instance PostgreSQL dédiée (ex: Neon PostgreSQL configuré)

### 1. Cloner le Dépôt Privé
```bash
git clone https://github.com/CodexSidou/BDE-PRIVET-DATA.git
cd BDE-PRIVET-DATA
```

### 2. Installer les Dépendances
```bash
npm install
```

### 3. Configurer l'Environnement (`.env`)
Créez un fichier `.env` basé sur `.env.example` :
```env
DATABASE_URL="postgresql://neondb_owner:npg_K8iHtAFaUw7P@ep-tiny-smoke-b2orqqqc-pooler.c-6.eu-central-1.aws.neon.tech/insim_connect_db?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_K8iHtAFaUw7P@ep-tiny-smoke-b2orqqqc.c-6.eu-central-1.aws.neon.tech/insim_connect_db?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_SECRET="insim_connect_super_secret_session_jwt_key_2026_x89a"
NODE_ENV="development"
```

### 4. Synchroniser la Base de Données & Alimenter les Données
```bash
# Générer le client Prisma
npm run prisma:generate

# Synchroniser le schéma PostgreSQL (Neon)
npm run prisma:push

# Exécuter le script de seeding des 8 rôles et données réalistes
npm run prisma:seed
```

### 5. Lancer la Suite de Tests Automatisée
```bash
npm test
```
*Résultat attendu : 32/32 tests passés avec succès.*

### 6. Lancer le Serveur de Développement
```bash
npm run dev
```
Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 🧪 Suite de Tests Automatisée

Le fichier `scripts/test-runner.ts` valide les règles critiques :

- **Tests d'Authentification & Rôles** :
  - Blocage strict des étudiants sur les routes d'administration et de grand livre.
  - Interdiction formelle d'auto-élévation de rôle.
  - Impossibilité pour un Vice-Président de nommer un Président.
- **Tests Financiers & Règle Anti-Auto-Approbation** :
  - Rejet de toute tentative d'approbation d'une dépense par son propre auteur.
  - Validation de la formule comptable d'Available Balance.
  - Exactitude des calculs de trésorerie sans décalage de virgule flottante.
- **Tests INSIM ID & Révocation** :
  - Vérification cryptographique des badges valides (`status === VALID`).
  - Détection et affichage immédiat des badges révoqués (`status === REVOKED`) avec motif d'audit.
  - Détection automatique des badges dont la date d'expiration est antérieure à la date courante (`status === EXPIRED`).
  - Rejet des identifiants inconnus ou contrefaits (`status === NOT_FOUND`).

---

## 🌐 Déploiement sur Vercel & Stratégie Multi-Dépôts

Le projet est structuré selon les instructions explicites en 2 dépôts distincts :

### 1. Dépôt Privé (Code Source Intégral & Données Métier)
- **URL** : `https://github.com/CodexSidou/BDE-PRIVET-DATA.git`
- **Contenu** : Code source complet Next.js App Router, modèles Prisma PostgreSQL, API d'authentification, modules financiers, moteurs de badges QR et scripts de test.
- **Déploiement Vercel** :
  1. Connectez Vercel à ce dépôt GitHub privé.
  2. Ajoutez les variables d'environnement dans les paramètres Vercel :
     - `DATABASE_URL` : URL de connexion Neon PostgreSQL (pooled).
     - `DIRECT_URL` : URL directe pour les migrations.
     - `AUTH_SECRET` : Clé de chiffrement des sessions JWT.
     - `NEXT_PUBLIC_APP_URL` : URL publique du domaine de production.
  3. Laissez les paramètres de build par défaut (`npm run build`).

### 2. Dépôt Public (Vitrine Institutionnelle & Portail d'Information)
- **URL** : `https://github.com/CodexSidou/BDE-PUBLIC.git`
- **Contenu** : Fiches de présentation institutionnelle, guides d'utilisation des badges INSIM ID, liens officiels d'accès, mentions légales et documentation publique **sans aucun code source sensible, ni variables d'environnement, ni structures de données internes**.

---

## 📜 Licence & Droits

© 2026 **Bureau des Étudiants INSIM** — Institut Supérieur de Management et d'Informatique.  
Développé avec rigueur et passion pour l'excellence académique et la transparence associative.
