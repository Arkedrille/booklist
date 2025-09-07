// app/components/BookForm.tsx
'use client'

import { useState } from 'react'
import { Star, X, Search } from 'lucide-react'
import Image from 'next/image'

interface Book {
  id?: string
  title: string
  author: string
  isbn?: string | null
  startDate?: Date | null
  endDate?: Date | null
  rating?: number | null
  coverUrl?: string | null
}

interface BookFormProps {
  book?: Book | null
  onSubmit: (book: Omit<Book, 'id'>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function BookForm({ book, onSubmit, onCancel, isLoading = false }: BookFormProps) {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    isbn: book?.isbn || '',
    startDate: book?.startDate ? new Date(book.startDate).toISOString().split('T')[0] : '',
    endDate: book?.endDate ? new Date(book.endDate).toISOString().split('T')[0] : '',
    rating: book?.rating || null,
    coverUrl: book?.coverUrl || ''
  })

  const [searchingCover, setSearchingCover] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const bookData: BookFormData = {
      title: formData.title,
      author: formData.author,
      isbn: formData.isbn || null,
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      rating: formData.rating,
      coverUrl: formData.coverUrl || null
    }
    
    await onSubmit(bookData)
  }

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating: prev.rating === rating ? null : rating
    }))
  }

  const searchCover = async () => {
    if (!formData.title) return
    
    setSearchingCover(true)
    try {
      const params = new URLSearchParams({
        title: formData.title,
        ...(formData.author && { author: formData.author }),
        ...(formData.isbn && { isbn: formData.isbn })
      })
      
      const response = await fetch(`/api/covers?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (data.coverUrl) {
          setFormData(prev => ({ ...prev, coverUrl: data.coverUrl }))
        }
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de couverture:', error)
    } finally {
      setSearchingCover(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {book ? 'Modifier le livre' : 'Ajouter un livre'}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Colonne de gauche - Aperçu de la couverture */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aperçu de la couverture
                </label>
                <div className="w-32 h-48 bg-gray-200 rounded border overflow-hidden mx-auto">
                  {formData.coverUrl ? (
                    <Image
                      src={formData.coverUrl}
                      alt="Couverture du livre"
                      width={128}
                      height={192}
                      className="w-full h-full object-cover"
                      onError={() => setFormData(prev => ({ ...prev, coverUrl: '' }))}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <div className="text-2xl mb-2">📚</div>
                        <div className="text-xs">Pas de couverture</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={searchCover}
                  disabled={!formData.title || searchingCover}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
                >
                  <Search size={16} />
                  {searchingCover ? 'Recherche...' : 'Rechercher couverture'}
                </button>
              </div>
            </div>

            {/* Colonne de droite - Formulaire */}
            <div className="md:col-span-2 space-y-4">
              {/* Titre */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Titre du livre"
                />
              </div>

              {/* Auteur */}
              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                  Auteur *
                </label>
                <input
                  type="text"
                  id="author"
                  required
                  value={formData.author}
                  onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom de l'auteur"
                />
              </div>

              {/* ISBN */}
              <div>
                <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN (optionnel)
                </label>
                <input
                  type="text"
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="978-2-xxxx-xxxx-x"
                />
                <p className="text-xs text-gray-500 mt-1">
                  L&apos;ISBN aide à trouver automatiquement la bonne couverture
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de début
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (optionnel)
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          size={24}
                          className={
                            formData.rating && star <= formData.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-400'
                          }
                        />
                      </button>
                    ))}
                  </div>
                  {formData.rating && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: null }))}
                      className="text-sm text-gray-500 hover:text-red-500 ml-2"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>

              {/* URL de couverture manuelle */}
              <div>
                <label htmlFor="coverUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  URL de couverture (optionnel)
                </label>
                <input
                  type="url"
                  id="coverUrl"
                  value={formData.coverUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/cover.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Vous pouvez spécifier manuellement une URL de couverture
                </p>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-6 border-t mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Enregistrement...' : (book ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}