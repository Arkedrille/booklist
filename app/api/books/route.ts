// app/api/books/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/books - Récupérer les livres de l'utilisateur connecté
export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  try {
    const books = await prisma.book.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(books)
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des livres' },
      { status: 500 }
    )
  }
}

// POST /api/books - Créer un nouveau livre pour l'utilisateur connecté
export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  try {
    const data = await request.json()
    
    // Rechercher automatiquement la jacquette si pas fournie
    let coverUrl = data.coverUrl
    if (!coverUrl && (data.title || data.isbn)) {
      try {
        const coverResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/covers?title=${encodeURIComponent(data.title || '')}&author=${encodeURIComponent(data.author || '')}&isbn=${encodeURIComponent(data.isbn || '')}`
        )
        if (coverResponse.ok) {
          const coverData = await coverResponse.json()
          coverUrl = coverData.coverUrl
        }
      } catch (error) {
        console.log('Erreur lors de la recherche de jacquette:', error)
      }
    }
    
    const book = await prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        rating: data.rating ? parseInt(data.rating) : null,
        coverUrl: coverUrl || null,
        userId: user.userId
      }
    })
    
    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du livre' },
      { status: 500 }
    )
  }
}