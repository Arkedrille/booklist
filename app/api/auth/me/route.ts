import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }
  
  return NextResponse.json({
    user: {
      id: user.userId,
      email: user.email,
      name: user.name
    }
  })
}