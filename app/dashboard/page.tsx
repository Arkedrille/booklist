// app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, User, BookOpen } from 'lucide-react'
import BookTable from '@/app/components/BookTable'
import BookForm from '@/app/components/BookForm'

interface User {
  id: string
  email: string
  name: string
}

interface Book {
  id: string
  title: string
  author: string
  isbn?: string | null
  startDate?: Date | string | null
  endDate?: Date | string | null
  rating?: number | null
  coverUrl?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

interface BookFormData {
  title: string
  author: string
  isbn?: string | null
  startDate?: Date | null
  endDate?: Date | null
  rating?: number | null
  coverUrl?: string | null
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [showBookForm, setShowBookForm] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          // Non authentifié, rediriger vers la page de connexion
          router.push('/')
        }
      } catch (error) {
        console.error('Erreur lors de la vérification auth:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }
    
    checkUserAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const handleAddBook = () => {
    setEditingBook(null)
    setShowBookForm(true)
  }

  const handleEditBook = (book: Book) => {
    setEditingBook(book)
    setShowBookForm(true)
  }

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
      return
    }

    try {
      const response = await fetch(`/api/books/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Recharger les données pour rafraîchir le tableau
        window.location.reload()
      } else {
        alert('Erreur lors de la suppression du livre')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      alert('Erreur lors de la suppression du livre')
    }
  }

  const handleSubmitBook = async (bookData: BookFormData) => {
    setIsSubmitting(true)
    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books'
      const method = editingBook ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookData)
      })

      if (response.ok) {
        setShowBookForm(false)
        setEditingBook(null)
        // Recharger les données pour rafraîchir le tableau
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la soumission:', error)
      alert('Erreur lors de la sauvegarde du livre')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelForm = () => {
    setShowBookForm(false)
    setEditingBook(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // L'utilisateur sera redirigé
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Booklist</h1>
                <p className="text-sm text-gray-600">Ma bibliothèque personnelle</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-sm text-gray-500">({user.email})</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Mes livres
          </h2>
          <p className="text-gray-600">
            Gérez votre collection de livres, suivez vos lectures et notez vos favoris.
          </p>
        </div>

        <BookTable
          onAddBook={handleAddBook}
          onEditBook={handleEditBook}
          onDeleteBook={handleDeleteBook}
        />
      </main>

      {/* Modal de formulaire */}
      {showBookForm && (
        <BookForm
          book={editingBook}
          onSubmit={handleSubmitBook}
          onCancel={handleCancelForm}
          isLoading={isSubmitting}
        />
      )}
    </div>
  )
}