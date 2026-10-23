import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { isBdeStaff } from '@/lib/permissions'
import { logAuditEvent } from '@/lib/audit'
import { notifyAllUsers } from '@/lib/notifications'
import { EventStatus } from '@prisma/client'
import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(3, 'Titre requis'),
  description: z.string().min(10, 'Description requise'),
  location: z.string().min(2, 'Lieu requis'),
  startDate: z.string().min(1, 'Date de début requise'),
  endDate: z.string().min(1, 'Date de fin requise'),
  maxAttendees: z.number().int().positive().optional().nullable(),
})

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        registrations: {
          select: {
            id: true,
            userId: true,
            attended: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: { startsAt: 'asc' },
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Fetch events error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || !isBdeStaff(user.role)) {
      return NextResponse.json(
        { error: 'Privilèges BDE insuffisants' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const parsed = createEventSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Données invalides' },
        { status: 400 }
      )
    }

    const {
      title,
      description,
      location,
      startDate,
      endDate,
      maxAttendees,
    } = parsed.data

    const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        location,
        startsAt: new Date(startDate),
        endsAt: new Date(endDate),
        capacity: maxAttendees || null,
        status: EventStatus.UPCOMING,
        organizerId: user.id,
      },
      include: {
        organizer: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    })

    // Audit log
    await logAuditEvent({
      actorId: user.id,
      actorEmail: user.email,
      action: 'EVENT_CREATED',
      resourceType: 'EVENT',
      resourceId: event.id,
      details: { title: event.title, location: event.location },
      result: 'SUCCESS',
    })

    // REAL NOTIFICATION: broadcast to all students
    const eventDate = new Date(startDate).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
    try {
      await notifyAllUsers({
        title: `🎉 Nouvel Événement : ${event.title}`,
        message: `${user.firstName} ${user.lastName} a programmé l'événement "${event.title}" le ${eventDate} (${location}). Venez nombreux !`,
        type: 'EVENT',
        link: '/dashboard/events',
      })
    } catch (notifErr) {
      console.error('Failed to notify users about event:', notifErr)
    }

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error('Create event error:', error)
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
  }
}
