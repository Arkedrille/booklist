// lib/auth.ts
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this'

export interface AuthUser {
  userId: string
  email: string
  name: string
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser
    return decoded
  } catch {
    return null
  }
}

export function getUserFromRequest(request: NextRequest): AuthUser | null {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}