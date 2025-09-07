// app/api/books/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUserFromRequest } from '@/lib/auth'

const prisma = new PrismaClient()

// GET /api/books/[id] - Récupérer un livre spécifique de l'utilisateur
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  try {
    const book = await prisma.book.findFirst({
      where: { 
        id: params.id,
        userId: user.userId // S'assurer que le livre appartient à l'utilisateur
      }
    })
    
    if (!book) {
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(book)
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du livre' },
      { status: 500 }
    )
  }
}

// PUT /api/books/[id] - Modifier un livre de l'utilisateur
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  try {
    const data = await request.json()
    
    // Vérifier que le livre appartient à l'utilisateur
    const existingBook = await prisma.book.findFirst({
      where: { 
        id: params.id,
        userId: user.userId
      }
    })
    
    if (!existingBook) {
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      )
    }
    
    // Rechercher une nouvelle jacquette si le titre/auteur a changé
    let coverUrl = data.coverUrl || existingBook.coverUrl
    if ((data.title !== existingBook.title || data.author !== existingBook.author) && (data.title || data.isbn)) {
      try {
        const coverResponse = await fetch(
          `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/covers?title=${encodeURIComponent(data.title || '')}&author=${encodeURIComponent(data.author || '')}&isbn=${encodeURIComponent(data.isbn || '')}`
        )
        if (coverResponse.ok) {
          const coverData = await coverResponse.json()
          if (coverData.coverUrl) {
            coverUrl = coverData.coverUrl
          }
        }
      } catch (error) {
        console.log('Erreur lors de la recherche de jacquette:', error)
      }
    }
    
    const book = await prisma.book.update({
      where: { id: params.id },
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        rating: data.rating ? parseInt(data.rating) : null,
        coverUrl: coverUrl || null
      }
    })
    
    return NextResponse.json(book)
  } catch (error) {
    console.error('Erreur lors de la modification du livre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification du livre' },
      { status: 500 }
    )
  }
}

// DELETE /api/books/[id] - Supprimer un livre de l'utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = getUserFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { error: 'Non authentifié' },
      { status: 401 }
    )
  }

  try {
    // Vérifier que le livre appartient à l'utilisateur avant de le supprimer
    const existingBook = await prisma.book.findFirst({
      where: { 
        id: params.id,
        userId: user.userId
      }
    })
    
    if (!existingBook) {
      return NextResponse.json(
        { error: 'Livre non trouvé' },
        { status: 404 }
      )
    }
    
    await prisma.book.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Livre supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du livre' },
      { status: 500 }
    )
  }
}