import { PrismaClient, UserRole, ProjectStatus, ProjectMemberRole, TaskPriority, TaskStatus, EventStatus, BadgeStatus, ExpenseCategory, ExpenseStatus, TransactionType, TransactionStatus, IdeaStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'
import QRCode from 'qrcode'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function hash(pwd: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(pwd, salt)
}

function genCode(prefix: string) {
  const hex = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `${prefix}-${hex.slice(0, 4)}-${hex.slice(4, 8)}`
}

async function main() {
  console.log('🌱 Starting INSIM CONNECT database seeding...')

  // Clean existing seed data safely
  await prisma.auditLog.deleteMany({})
  await prisma.notification.deleteMany({})
  await prisma.vote.deleteMany({})
  await prisma.pollOption.deleteMany({})
  await prisma.poll.deleteMany({})
  await prisma.idea.deleteMany({})
  await prisma.financialTransaction.deleteMany({})
  await prisma.expenseRequest.deleteMany({})
  await prisma.projectBudget.deleteMany({})
  await prisma.digitalBadge.deleteMany({})
  await prisma.shareLink.deleteMany({})
  await prisma.eventRegistration.deleteMany({})
  await prisma.event.deleteMany({})
  await prisma.taskComment.deleteMany({})
  await prisma.task.deleteMany({})
  await prisma.projectMembership.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.announcement.deleteMany({})
  await prisma.platformSettings.deleteMany({})
  await prisma.user.deleteMany({})

  console.log('🧹 Existing data wiped.')

  // Common demo password
  const defaultPassword = await hash('InsimConnect2026!')

  // 1. Create Users for all 8 Primary Roles
  console.log('👤 Seeding accounts with 8 mandatory roles...')

  const president = await prisma.user.create({
    data: {
      email: 'president@insim.edu',
      passwordHash: defaultPassword,
      firstName: 'Yacine',
      lastName: 'Belkacem',
      studentNumber: 'INS-2023-0001',
      phone: '+213 550 12 34 56',
      department: 'Informatique & Systèmes d\'Information',
      studyYear: 'Master 2',
      role: UserRole.PRESIDENT,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const vicePresident = await prisma.user.create({
    data: {
      email: 'vp@insim.edu',
      passwordHash: defaultPassword,
      firstName: 'Amina',
      lastName: 'Cherif',
      studentNumber: 'INS-2023-0042',
      phone: '+213 551 23 45 67',
      department: 'Management & Stratégie',
      studyYear: 'Master 2',
      role: UserRole.VICE_PRESIDENT,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const treasurer = await prisma.user.create({
    data: {
      email: 'tresorier@insim.edu',
      passwordHash: defaultPassword,
      firstName: 'Mehdi',
      lastName: 'Benali',
      studentNumber: 'INS-2024-0105',
      phone: '+213 552 34 56 78',
      department: 'Finance & Comptabilité',
      studyYear: 'Master 1',
      role: UserRole.TREASURER,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const projectManager = await prisma.user.create({
    data: {
      email: 'chef.projet@insim.edu',
      passwordHash: defaultPassword,
      firstName: 'Sofiane',
      lastName: 'Khelil',
      studentNumber: 'INS-2024-0220',
      phone: '+213 553 45 67 89',
      department: 'Génie Logiciel',
      studyYear: 'Licence 3',
      role: UserRole.PROJECT_MANAGER,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const bdeMember1 = await prisma.user.create({
    data: {
      email: 'bde.sarah@insim.edu',
      passwordHash: defaultPassword,
      firstName: 'Sarah',
      lastName: 'Touati',
      studentNumber: 'INS-2024-0312',
      phone: '+213 554 56 78 90',
      department: 'Marketing Digital',
      studyYear: 'Licence 3',
      role: UserRole.BDE_MEMBER,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const bdeMember2 = await prisma.user.create({
    data: {
      email: 'bde.karim@insim.edu',
      passwordHash: defaultPassword,
      firstName: 'Karim',
      lastName: 'Mansouri',
      studentNumber: 'INS-2024-0418',
      phone: '+213 555 67 89 01',
      department: 'Réseaux & Sécurité',
      studyYear: 'Licence 3',
      role: UserRole.BDE_MEMBER,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const classDelegate = await prisma.user.create({
    data: {
      email: 'delegue.l3@insim.edu',
      passwordHash: defaultPassword,
      firstName: 'Rayan',
      lastName: 'Bouzid',
      studentNumber: 'INS-2025-0550',
      phone: '+213 556 78 90 12',
      department: 'Informatique Appliquée',
      studyYear: 'Licence 3',
      role: UserRole.CLASS_DELEGATE,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const student1 = await prisma.user.create({
    data: {
      email: 'etudiant.lydia@insim.edu',
      passwordHash: defaultPassword,
      firstName: 'Lydia',
      lastName: 'Hadj',
      studentNumber: 'INS-2025-0610',
      phone: '+213 557 89 01 23',
      department: 'Commerce International',
      studyYear: 'Licence 2',
      role: UserRole.STUDENT,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  const student2 = await prisma.user.create({
    data: {
      email: 'etudiant.samir@insim.edu',
      passwordHash: defaultPassword,
      firstName: 'Samir',
      lastName: 'Meziani',
      studentNumber: 'INS-2025-0725',
      phone: '+213 558 90 12 34',
      department: 'Intelligence Artificielle',
      studyYear: 'Licence 2',
      role: UserRole.STUDENT,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  // 2. Create Platform Settings
  await prisma.platformSettings.createMany({
    data: [
      { key: 'CAMPUS_NAME', value: 'INSIM Alger - Campus Principal' },
      { key: 'ACADEMIC_YEAR', value: '2025-2026' },
      { key: 'BDE_MANDATE', value: 'Mandat Synergie & Innovation' },
      { key: 'TREASURY_OPENING_BALANCE', value: '150000.00' },
      { key: 'EXPENSE_AUTO_APPROVE_LIMIT', value: '5000.00' },
    ],
  })

  // 3. Create Projects
  console.log('📁 Creating BDE projects & collaborations...')

  const hackathonProject = await prisma.project.create({
    data: {
      title: 'INSIM Hackathon 2026 - IA & Innovation',
      slug: 'insim-hackathon-2026',
      description: 'Compétition technologique de 48h réunissant 120 étudiants développeurs, designers et data scientists d\'INSIM pour prototyper des solutions d\'IA à fort impact.',
      category: 'Tech & Innovation',
      startDate: new Date('2026-11-15'),
      endDate: new Date('2026-11-17'),
      status: ProjectStatus.ACTIVE,
      isPublic: true,
      managerId: projectManager.id,
      budget: {
        create: {
          allocatedAmount: 350000.00,
          notes: 'Subvention entreprise sponsor + dotation BDE pour hébergement et prix',
        },
      },
    },
  })

  const galaProject = await prisma.project.create({
    data: {
      title: 'Gala Annuel de Remise des Diplômes',
      slug: 'gala-diplomes-2026',
      description: 'Soirée de prestige et cérémonie protocolaire pour honorer les diplômés de la promotion 2026 en présence du corps professoral et des partenaires industriels.',
      category: 'Prestige & Événementiel',
      startDate: new Date('2026-12-20'),
      endDate: new Date('2026-12-20'),
      status: ProjectStatus.PLANNED,
      isPublic: true,
      managerId: vicePresident.id,
      budget: {
        create: {
          allocatedAmount: 500000.00,
          notes: 'Réservation salle de réception, traiteur et animations artistiques',
        },
      },
    },
  })

  const esportProject = await prisma.project.create({
    data: {
      title: 'Tournoi E-Sport & Gaming Week',
      slug: 'tournoi-esport-2026',
      description: 'Semaine compétitive de jeux vidéo (Valorant, FC 26, League of Legends) avec retransmission en direct et village gaming au foyer étudiant.',
      category: 'Sports & Loisirs',
      startDate: new Date('2026-10-28'),
      endDate: new Date('2026-11-02'),
      status: ProjectStatus.ACTIVE,
      isPublic: true,
      managerId: bdeMember2.id,
      budget: {
        create: {
          allocatedAmount: 180000.00,
          notes: 'Matériel réseau fibre, licences jeux, trophées et rafraîchissements',
        },
      },
    },
  })

  const renovationProject = await prisma.project.create({
    data: {
      title: 'Modernisation Espace Coworking BDE',
      slug: 'renovation-coworking-bde',
      description: 'Aménagement du local étudiant avec mobilier ergonomique, tableau interactif et borne de recharge pour projets collaboratifs.',
      category: 'Infrastructures Campus',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-10-15'),
      status: ProjectStatus.COMPLETED,
      isPublic: false,
      managerId: president.id,
      budget: {
        create: {
          allocatedAmount: 120000.00,
          notes: 'Achat de tables modulaires et installation électrique sécurisée',
        },
      },
    },
  })

  // 4. Project Memberships
  await prisma.projectMembership.createMany({
    data: [
      {
        projectId: hackathonProject.id,
        userId: projectManager.id,
        projectRole: ProjectMemberRole.LEAD,
        canManageTasks: true,
        canRequestExpenses: true,
      },
      {
        projectId: hackathonProject.id,
        userId: bdeMember1.id,
        projectRole: ProjectMemberRole.DESIGNER,
        canManageTasks: true,
        canRequestExpenses: false,
      },
      {
        projectId: hackathonProject.id,
        userId: bdeMember2.id,
        projectRole: ProjectMemberRole.TECHNICAL,
        canManageTasks: true,
        canRequestExpenses: true,
      },
      {
        projectId: hackathonProject.id,
        userId: student2.id,
        projectRole: ProjectMemberRole.MEMBER,
        canManageTasks: false,
        canRequestExpenses: false,
      },
      {
        projectId: esportProject.id,
        userId: bdeMember2.id,
        projectRole: ProjectMemberRole.LEAD,
        canManageTasks: true,
        canRequestExpenses: true,
      },
      {
        projectId: esportProject.id,
        userId: student1.id,
        projectRole: ProjectMemberRole.COORDINATOR,
        canManageTasks: true,
        canRequestExpenses: false,
      },
    ],
  })

  // 5. Tasks Management
  console.log('✅ Creating tasks & assignments...')

  await prisma.task.createMany({
    data: [
      {
        projectId: hackathonProject.id,
        title: 'Validation des défis techniques avec les partenaires tech',
        description: 'Finaliser les 3 cas d\'usage IA proposés aux participants et préparer les datasets d\'entraînement.',
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        creatorId: projectManager.id,
        assigneeId: bdeMember2.id,
        dueDate: new Date('2026-11-05'),
      },
      {
        projectId: hackathonProject.id,
        title: 'Création des visuels et campagne Instagram / LinkedIn',
        description: 'Préparer les affiches A2 pour le campus et les carrousels de présentation des jurys.',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.IN_PROGRESS,
        creatorId: projectManager.id,
        assigneeId: bdeMember1.id,
        dueDate: new Date('2026-11-02'),
      },
      {
        projectId: hackathonProject.id,
        title: 'Réservation traiteur pauses café et repas nocturnes',
        description: 'Négocier devis pour 150 personnes sur 48h (petits déjeuners, pizzas, boissons énergétiques).',
        priority: TaskPriority.URGENT,
        status: TaskStatus.TODO,
        creatorId: projectManager.id,
        assigneeId: projectManager.id,
        dueDate: new Date('2026-11-08'),
      },
      {
        projectId: hackathonProject.id,
        title: 'Configuration des badges NFC et QR codes participants',
        description: 'Générer tous les badges INSIM ID pour le contrôle d\'accès sécurisé à l\'amphithéâtre.',
        priority: TaskPriority.HIGH,
        status: TaskStatus.COMPLETED,
        creatorId: projectManager.id,
        assigneeId: bdeMember2.id,
        completedAt: new Date(),
      },
      {
        projectId: esportProject.id,
        title: 'Installation des switchs réseau Gigabit et câblage RJ45',
        description: 'Tester la latence sur les 32 postes de tournoi avec la direction des systèmes d\'information.',
        priority: TaskPriority.URGENT,
        status: TaskStatus.IN_PROGRESS,
        creatorId: bdeMember2.id,
        assigneeId: bdeMember2.id,
        dueDate: new Date('2026-10-27'),
      },
      {
        projectId: esportProject.id,
        title: 'Ouverture du formulaire d\'inscription des équipes',
        description: 'Publier le lien officiel sur la plateforme INSIM CONNECT.',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.COMPLETED,
        creatorId: bdeMember2.id,
        assigneeId: student1.id,
        completedAt: new Date(),
      },
    ],
  })

  // 6. Events
  console.log('📅 Creating events...')

  const hackathonEvent = await prisma.event.create({
    data: {
      title: 'Grand Lancement Hackathon INSIM 2026',
      slug: 'lancement-hackathon-2026',
      description: 'Cérémonie d\'ouverture du Hackathon avec keynote d\'experts en IA générative et distribution des kits participants.',
      location: 'Grand Amphithéâtre INSIM - Campus Alger',
      startsAt: new Date('2026-11-15T09:00:00Z'),
      endsAt: new Date('2026-11-15T12:00:00Z'),
      capacity: 150,
      isPublic: true,
      status: EventStatus.UPCOMING,
      organizerId: projectManager.id,
      projectId: hackathonProject.id,
    },
  })

  const esportEvent = await prisma.event.create({
    data: {
      title: 'Finales Régionales Tournoi FC 26 & Valorant',
      slug: 'finales-esport-2026',
      description: 'Matchs de demi-finales et grandes finales commentés en direct avec remise des prix et trophées.',
      location: 'Foyer Étudiant & Espace Gaming',
      startsAt: new Date('2026-11-02T14:00:00Z'),
      endsAt: new Date('2026-11-02T19:00:00Z'),
      capacity: 200,
      isPublic: true,
      status: EventStatus.UPCOMING,
      organizerId: bdeMember2.id,
      projectId: esportProject.id,
    },
  })

  // Registrations
  await prisma.eventRegistration.createMany({
    data: [
      { eventId: hackathonEvent.id, userId: student1.id },
      { eventId: hackathonEvent.id, userId: student2.id },
      { eventId: hackathonEvent.id, userId: classDelegate.id },
      { eventId: esportEvent.id, userId: student1.id },
    ],
  })

  // 7. INSIM ID: Digital Badges & QR Codes
  console.log('🪪 Generating certified INSIM ID badges with QR verification...')

  const code1 = 'INSIM-8B4F-29E1-C34A'
  const code2 = 'INSIM-4D9A-71C5-9F2B'
  const code3 = 'INSIM-91FA-28B0-65CD'
  const codeRevoked = 'INSIM-0000-REVOKED-X1'

  await prisma.digitalBadge.create({
    data: {
      badgeCode: code1,
      userId: president.id,
      roleTitle: 'Président du BDE',
      issueDate: new Date('2025-09-15'),
      expiresAt: new Date('2027-09-30'),
      status: BadgeStatus.VALID,
      issuerId: president.id,
    },
  })

  await prisma.digitalBadge.create({
    data: {
      badgeCode: code2,
      userId: projectManager.id,
      projectId: hackathonProject.id,
      roleTitle: 'Chef de Projet Hackathon',
      issueDate: new Date('2026-10-01'),
      expiresAt: new Date('2026-12-31'),
      status: BadgeStatus.VALID,
      issuerId: president.id,
    },
  })

  await prisma.digitalBadge.create({
    data: {
      badgeCode: code3,
      userId: bdeMember1.id,
      projectId: hackathonProject.id,
      roleTitle: 'Responsable Communication & Design',
      issueDate: new Date('2026-10-01'),
      expiresAt: new Date('2026-12-31'),
      status: BadgeStatus.VALID,
      issuerId: vicePresident.id,
    },
  })

  await prisma.digitalBadge.create({
    data: {
      badgeCode: codeRevoked,
      userId: student2.id,
      projectId: esportProject.id,
      roleTitle: 'Ancien Bénévole Logistique',
      issueDate: new Date('2026-08-01'),
      expiresAt: new Date('2026-11-01'),
      status: BadgeStatus.REVOKED,
      revokedAt: new Date(),
      revokedReason: 'Non-respect des règles déontologiques et fin anticipée de mission',
      issuerId: president.id,
    },
  })

  // 8. Financial Records & Accounting Ledger
  console.log('💰 Setting up BDE treasury, expense requests & auditable ledger...')

  // Incoming Transactions
  await prisma.financialTransaction.create({
    data: {
      transactionCode: 'TX-REC-2026-001',
      type: TransactionType.INCOMING_FUNDS,
      amount: 450000.00,
      currency: 'DZD',
      date: new Date('2026-09-20'),
      description: 'Subvention annuelle d\'amorçage allouée par la Direction Générale INSIM',
      sourceOrPayee: 'Direction Générale INSIM Alger',
      recordedById: treasurer.id,
      approvedById: president.id,
      status: TransactionStatus.CONFIRMED,
      receiptReference: 'DIR-SUB-2026-09',
    },
  })

  await prisma.financialTransaction.create({
    data: {
      transactionCode: 'TX-REC-2026-002',
      type: TransactionType.INCOMING_FUNDS,
      amount: 250000.00,
      currency: 'DZD',
      date: new Date('2026-10-05'),
      projectId: hackathonProject.id,
      description: 'Sponsoring officiel Silver - Société IT Solutions Algérie',
      sourceOrPayee: 'IT Solutions Algérie EURL',
      recordedById: treasurer.id,
      approvedById: president.id,
      status: TransactionStatus.CONFIRMED,
      receiptReference: 'SPONSOR-ITS-2026',
    },
  })

  // Expense Requests
  const expense1 = await prisma.expenseRequest.create({
    data: {
      title: 'Achat de 150 kits de bienvenue Hackathon (sacs, carnets, badges NFC)',
      description: 'Commande groupée auprès de l\'imprimerie industrielle agréée.',
      category: ExpenseCategory.PRINTING,
      requestedAmount: 65000.00,
      projectId: hackathonProject.id,
      requesterId: projectManager.id,
      status: ExpenseStatus.PAID,
      reviewerId: treasurer.id,
      reviewNotes: 'Devis conforme au barème approuvé par le BDE',
      reviewedAt: new Date('2026-10-10'),
      paidById: treasurer.id,
      paidAt: new Date('2026-10-12'),
      receiptUrl: '/docs/facture-kits-hackathon.pdf',
      receiptFileName: 'facture-kits-hackathon.pdf',
    },
  })

  // Corresponding confirmed transaction
  await prisma.financialTransaction.create({
    data: {
      transactionCode: 'TX-DEP-2026-001',
      type: TransactionType.EXPENSE_PAYMENT,
      amount: 65000.00,
      currency: 'DZD',
      date: new Date('2026-10-12'),
      projectId: hackathonProject.id,
      expenseRequestId: expense1.id,
      description: 'Règlement facture Imprimerie Moderne - Kits Hackathon 2026',
      sourceOrPayee: 'SARL Imprimerie Moderne Alger',
      recordedById: treasurer.id,
      approvedById: vicePresident.id,
      status: TransactionStatus.CONFIRMED,
      receiptReference: 'IMP-MOD-FAC-4412',
    },
  })

  const expense2 = await prisma.expenseRequest.create({
    data: {
      title: 'Câbles RJ45 Cat6 et Switch 24 Ports Gigabit pour l\'E-Sport',
      description: 'Renforcement du backbone local pour zéro perte de paquets pendant les finales.',
      category: ExpenseCategory.EQUIPMENT,
      requestedAmount: 48000.00,
      projectId: esportProject.id,
      requesterId: bdeMember2.id,
      status: ExpenseStatus.PAID,
      reviewerId: treasurer.id,
      reviewNotes: 'Indispensable pour le bon déroulement du tournoi réseau',
      reviewedAt: new Date('2026-10-18'),
      paidById: treasurer.id,
      paidAt: new Date('2026-10-19'),
      receiptUrl: '/docs/facture-switch-esport.pdf',
      receiptFileName: 'facture-switch-esport.pdf',
    },
  })

  await prisma.financialTransaction.create({
    data: {
      transactionCode: 'TX-DEP-2026-002',
      type: TransactionType.EXPENSE_PAYMENT,
      amount: 48000.00,
      currency: 'DZD',
      date: new Date('2026-10-19'),
      projectId: esportProject.id,
      expenseRequestId: expense2.id,
      description: 'Achat Switch 24 ports D-Link & Câbles réseau Haute Densité',
      sourceOrPayee: 'Comptoir Informatique d\'Alger',
      recordedById: treasurer.id,
      approvedById: president.id,
      status: TransactionStatus.CONFIRMED,
      receiptReference: 'CIA-FACT-9821',
    },
  })

  const expensePending = await prisma.expenseRequest.create({
    data: {
      title: 'Acompte traiteur pour les 48h du Hackathon',
      description: 'Acompte de 30% requis pour la réservation du service de restauration nocturne.',
      category: ExpenseCategory.REFRESHMENTS,
      requestedAmount: 75000.00,
      projectId: hackathonProject.id,
      requesterId: projectManager.id,
      status: ExpenseStatus.SUBMITTED,
      receiptUrl: '/docs/devis-traiteur-hackathon.pdf',
      receiptFileName: 'devis-traiteur-hackathon.pdf',
    },
  })

  const expenseApprovedUnpaid = await prisma.expenseRequest.create({
    data: {
      title: 'Trophées gravés et médailles personnalisées INSIM E-Sport',
      description: 'Récompenses pour les équipes championnes et finalistes du tournoi.',
      category: ExpenseCategory.LOGISTICS,
      requestedAmount: 32000.00,
      projectId: esportProject.id,
      requesterId: bdeMember2.id,
      status: ExpenseStatus.APPROVED,
      reviewerId: treasurer.id,
      reviewNotes: 'Approuvé par le Trésorier et la Vice-Présidence. En attente de retrait chèque.',
      reviewedAt: new Date('2026-10-21'),
      receiptUrl: '/docs/bon-commande-trophees.pdf',
      receiptFileName: 'bon-commande-trophees.pdf',
    },
  })

  // 9. Ideas & Polls
  console.log('💡 Seeding ideas & campus polls...')

  const idea1 = await prisma.idea.create({
    data: {
      title: 'Mise en place d\'une bibliothèque de prêt de matériel informatique (Raspberry Pi & Arduino)',
      description: 'Permettre aux étudiants d\'emprunter des composants électroniques et microcontrôleurs pour leurs projets académiques et projets personnels du week-end.',
      category: 'Technologie & Projets',
      authorId: student1.id,
      status: IdeaStatus.ACCEPTED,
      adminFeedback: 'Excellente initiative ! Le pôle Tech du BDE intègre cette idée dans le budget prévisionnel du semestre 2.',
      upvotesCount: 42,
    },
  })

  const idea2 = await prisma.idea.create({
    data: {
      title: 'Création d\'un club de débat oratoire et d\'éloquence en français et anglais',
      description: 'Organiser des joutes oratoires hebdomadaires pour préparer les concours d\'éloquence inter-universités.',
      category: 'Culture & Compétences',
      authorId: classDelegate.id,
      status: IdeaStatus.IN_PROGRESS,
      adminFeedback: 'Salle B12 allouée chaque jeudi après-midi pour les sessions pilotes.',
      upvotesCount: 29,
    },
  })

  const poll1 = await prisma.poll.create({
    data: {
      title: 'Quel thème privilégiez-vous pour la Grande Conférence Tech 2026 ?',
      description: 'Votez pour orienter le choix des intervenants de prestige de la conférence semestrielle.',
      creatorId: president.id,
      isPublic: true,
      options: {
        create: [
          { text: 'Intelligence Artificielle Générative & Agents Autonomes', votesCount: 78 },
          { text: 'Cybersécurité Offensive & Défense des Infrastructures Critiques', votesCount: 54 },
          { text: 'Cloud Architecture & Micro-services à Grande Échelle', votesCount: 23 },
          { text: 'Fintech & Systèmes de Paiement Numérique en Algérie', votesCount: 39 },
        ],
      },
    },
  })

  // 10. Announcements & News
  console.log('📢 Creating official news & announcements...')

  await prisma.announcement.createMany({
    data: [
      {
        title: 'Ouverture Officielle de la Plateforme INSIM CONNECT !',
        content: 'Le Bureau des Étudiants d\'INSIM a le plaisir de vous présenter INSIM CONNECT, votre nouvel écosystème numérique unifié : suivi des projets, calendrier des événements, boîte à idées, transparence financière et génération de vos badges officiels certifiés INSIM ID avec QR code de vérification.',
        category: 'BDE Officiel',
        priority: 'IMPORTANT',
        isPublic: true,
        authorId: president.id,
        publishedAt: new Date('2026-10-15'),
      },
      {
        title: 'Appel à Candidatures : Bénévoles pour le Hackathon IA 2026',
        content: 'Vous souhaitez rejoindre l\'équipe d\'organisation du plus grand événement tech de l\'institut ? Le BDE recrute des étudiants motivés pour les pôles Logistique, Médias/Réseaux sociaux et Accueil des participants. Postulez directement via votre espace étudiant.',
        category: 'Événement',
        priority: 'NORMAL',
        isPublic: true,
        authorId: vicePresident.id,
        publishedAt: new Date('2026-10-20'),
      },
      {
        title: 'Bilan de Transparence Financière - Rentrée Octobre 2026',
        content: 'Conformément aux statuts de gouvernance participative du BDE INSIM, l\'état d\'exécution budgétaire et les récapitulatifs d\'investissements par projet sont désormais consultables en direct pour tous les membres dans l\'onglet Transparence Financière.',
        category: 'BDE & Finances',
        priority: 'IMPORTANT',
        isPublic: true,
        authorId: treasurer.id,
        publishedAt: new Date('2026-10-22'),
      },
    ],
  })

  // 11. Notifications
  console.log('🔔 Creating contextual user notifications...')

  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        title: 'Inscription confirmée',
        message: 'Votre inscription au Grand Lancement du Hackathon INSIM 2026 a été validée avec succès.',
        type: 'EVENT',
        link: '/events',
      },
      {
        userId: projectManager.id,
        title: 'Nouvelle tâche assignée',
        message: 'Vous avez été assigné à la validation des réservations traiteur du Hackathon.',
        type: 'TASK',
        link: '/dashboard/tasks',
      },
      {
        userId: treasurer.id,
        title: 'Nouvelle demande de dépense',
        message: 'Sofiane Khelil a soumis une demande d\'acompte traiteur de 75 000 DZD pour le Hackathon.',
        type: 'FINANCE',
        link: '/dashboard/expenses',
      },
      {
        userId: president.id,
        title: 'Alerte Système',
        message: 'Le badge INSIM ID de Samir Meziani a été révoqué pour motif disciplinaire.',
        type: 'BADGE',
        link: '/dashboard/badges',
      },
    ],
  })

  // 12. Audit Logs
  console.log('🛡️ Initializing security & financial audit trail...')

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: president.id,
        actorEmail: president.email,
        action: 'PLATFORM_INITIALIZATION',
        resourceType: 'SYSTEM',
        details: 'Initialisation de la base PostgreSQL INSIM CONNECT avec architecture RBAC à 8 rôles.',
        result: 'SUCCESS',
      },
      {
        actorId: treasurer.id,
        actorEmail: treasurer.email,
        action: 'INCOMING_FUNDS_RECORDED',
        resourceType: 'TRANSACTION',
        resourceId: 'TX-REC-2026-001',
        details: 'Enregistrement de la subvention de rentrée (450 000 DZD) émise par la Direction Générale.',
        result: 'SUCCESS',
      },
      {
        actorId: president.id,
        actorEmail: president.email,
        action: 'BADGE_REVOCATION',
        resourceType: 'BADGE',
        resourceId: codeRevoked,
        details: 'Révocation sécurisée du badge suite au retrait de l\'accréditation bénévole.',
        result: 'SUCCESS',
      },
    ],
  })

  console.log('🎉 Seed completed successfully!')
  console.log('--------------------------------------------------')
  console.log('Demo Credentials for All 8 Mandatory Roles:')
  console.log('Password for all accounts: InsimConnect2026!')
  console.log('1. PRESIDENT:        president@insim.edu')
  console.log('2. VICE_PRESIDENT:   vp@insim.edu')
  console.log('3. TREASURER:        tresorier@insim.edu')
  console.log('4. PROJECT_MANAGER:  chef.projet@insim.edu')
  console.log('5. BDE_MEMBER:       bde.sarah@insim.edu')
  console.log('6. CLASS_DELEGATE:   delegue.l3@insim.edu')
  console.log('7. STUDENT:          etudiant.lydia@insim.edu')
  console.log('8. VISITOR:          (Public browsing without login)')
  console.log('--------------------------------------------------')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
