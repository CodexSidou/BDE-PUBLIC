import { NextResponse } from 'next/server'
import { verifyBadgeByCode } from '@/lib/badges'

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  try {
    const badgeCode = params.code

    if (!badgeCode || badgeCode.trim().length === 0) {
      return NextResponse.json(
        { error: 'Code de badge manquant ou invalide' },
        { status: 400 }
      )
    }

    const verification = await verifyBadgeByCode(badgeCode)

    return NextResponse.json({
      success: true,
      verification,
    })
  } catch (error) {
    console.error('Badge verification error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du badge' },
      { status: 500 }
    )
  }
}
