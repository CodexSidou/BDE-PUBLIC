import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { isBdeStaff } from '@/lib/permissions'
import { TaskStatus, TaskPriority } from '@prisma/client'
import { z } from 'zod'

const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(2, 'Titre requis'),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
})

const updateTaskSchema = z.object({
  taskId: z.string().uuid(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  assigneeId: z.string().uuid().nullable().optional(),
})

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('projectId')

    let whereClause: any = {}

    if (projectId) {
      whereClause.projectId = projectId
    } else if (!isBdeStaff(user.role)) {
      // Students only see tasks assigned to them
      whereClause.assigneeId = user.id
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: { select: { id: true, title: true } },
        assignee: { select: { id: true, firstName: true, lastName: true, email: true } },
        creator: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    console.error('Get tasks error:', error)
    return NextResponse.json({ error: 'Erreur lors du chargement des tâches' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !isBdeStaff(user.role)) {
      return NextResponse.json({ error: 'Réservé aux membres BDE' }, { status: 403 })
    }

    const body = await req.json()
    const parsed = createTaskSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { projectId, title, description, priority, assigneeId, dueDate } = parsed.data

    const task = await prisma.task.create({
      data: {
        projectId,
        title,
        description: description || null,
        priority,
        status: TaskStatus.TODO,
        creatorId: user.id,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
      include: {
        project: { select: { title: true } },
        assignee: { select: { firstName: true, lastName: true } },
      },
    })

    if (assigneeId && assigneeId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: assigneeId,
          title: 'Nouvelle tâche assignée',
          message: `${user.firstName} ${user.lastName} vous a assigné la tâche "${title}".`,
          type: 'TASK',
          link: '/dashboard/tasks',
        },
      })
    }

    return NextResponse.json({ success: true, task })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json({ error: 'Impossible de créer la tâche' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updateTaskSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { taskId, status, priority, assigneeId } = parsed.data

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ error: 'Tâche introuvable' }, { status: 404 })
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(status && {
          status,
          ...(status === TaskStatus.COMPLETED ? { completedAt: new Date() } : { completedAt: null }),
        }),
        ...(priority && { priority }),
        ...(assigneeId !== undefined && { assigneeId }),
      },
      include: {
        project: { select: { title: true } },
        assignee: { select: { firstName: true, lastName: true } },
      },
    })

    return NextResponse.json({ success: true, task: updated })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json({ error: 'Erreur lors de la mise à jour de la tâche' }, { status: 500 })
  }
}
