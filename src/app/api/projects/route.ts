import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { hasPermission, isBdeStaff } from '@/lib/permissions'
import { logAuditEvent } from '@/lib/audit'
import { ProjectStatus } from '@prisma/client'
import { z } from 'zod'

const createProjectSchema = z.object({
  title: z.string().min(3, 'Titre requis'),
  description: z.string().min(10, 'Description détaillée requise'),
  category: z.string().min(2, 'Catégorie requise'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isPublic: z.boolean().default(true),
  allocatedBudget: z.number().min(0).default(0),
})

export async function GET() {
  try {
    const user = await getCurrentUser()

    let whereClause: any = {}
    if (!user || !isBdeStaff(user.role)) {
      // Visitors and regular students only see published public projects
      whereClause.isPublic = true
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        budget: true,
        _count: {
          select: {
            memberships: true,
            tasks: true,
            events: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, projects })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    if (!hasPermission(user.role, 'create_projects')) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour créer un projet BDE' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = createProjectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { title, description, category, startDate, endDate, isPublic, allocatedBudget } =
      parsed.data

    const slug =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Math.floor(Math.random() * 1000)

    const project = await prisma.project.create({
      data: {
        title,
        slug,
        description,
        category,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isPublic,
        status: ProjectStatus.PLANNED,
        managerId: user.id,
        budget: {
          create: {
            allocatedAmount: allocatedBudget,
            notes: 'Budget initial alloué lors de la création du projet',
          },
        },
      },
      include: {
        budget: true,
        manager: { select: { firstName: true, lastName: true } },
      },
    })

    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'PROJECT_CREATED',
      resourceType: 'PROJECT',
      resourceId: project.id,
      details: { title, allocatedBudget, isPublic },
      result: 'SUCCESS',
    })

    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: 'Impossible de créer le projet' },
      { status: 500 }
    )
  }
}
