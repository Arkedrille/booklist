// app/components/BookTable.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { Star, Search, Plus, Edit2, Trash2, Calendar, BookOpen, User, SortAsc, SortDesc } from 'lucide-react'
import Image from 'next/image'

interface Book {
  id: string
  title: string
  author: string
  isbn?: string | null
  startDate?: Date | string | null
  endDate?: Date | string | null
  rating?: number | null
  coverUrl?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

interface BookTableProps {
  onAddBook: () => void
  onEditBook: (book: Book) => void
  onDeleteBook: (id: string) => void
}

type SortField = 'title' | 'author' | 'startDate' | 'endDate' | 'rating' | 'createdAt'
type SortDirection = 'asc' | 'desc'

export default function BookTable({ onAddBook, onEditBook, onDeleteBook }: BookTableProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'reading' | 'to-read'>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data)
      }
    } catch (error) {
      console.error('Erreur lors du chargement des livres:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('fr-FR')
  }

  const getReadingStatus = (book: Book): ReadingStatus => {
    if (book.endDate) return 'read'
    if (book.startDate) return 'reading'
    return 'to-read'
  }

  const getStatusBadge = (book: Book) => {
    const status = getReadingStatus(book)
    const styles: Record<ReadingStatus, string> = {
      'read': 'bg-green-100 text-green-800',
      'reading': 'bg-blue-100 text-blue-800',
      'to-read': 'bg-gray-100 text-gray-800'
    }
    const labels: Record<ReadingStatus, string> = {
      'read': 'Lu',
      'reading': 'En cours',
      'to-read': 'À lire'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return <span className="text-gray-400 text-sm">-</span>
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }
          />
        ))}
      </div>
    )
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortButton = ({ field, children }: { field: SortField, children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
    >
      {children}
      {sortField === field && (
        sortDirection === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />
      )}
    </button>
  )

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (statusFilter === 'all') return matchesSearch
      
      const status = getReadingStatus(book)
      return matchesSearch && status === statusFilter
    })

    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      // Gestion spéciale pour les dates
      if (sortField === 'startDate' || sortField === 'endDate' || sortField === 'createdAt') {
        aValue = aValue ? new Date(aValue).getTime() : 0
        bValue = bValue ? new Date(bValue).getTime() : 0
      }

      // Gestion spéciale pour les chaînes
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue?.toLowerCase() || ''
      }

      // Gestion des valeurs nulles
      if (aValue === null || aValue === undefined) aValue = ''
      if (bValue === null || bValue === undefined) bValue = ''

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return sorted
  }, [books, searchTerm, statusFilter, sortField, sortDirection])

  const stats = useMemo(() => {
    const total = books.length
    const read = books.filter(book => book.endDate).length
    const reading = books.filter(book => book.startDate && !book.endDate).length
    const toRead = total - read - reading
    const avgRating = books.filter(book => book.rating).reduce((sum, book) => sum + (book.rating || 0), 0) / books.filter(book => book.rating).length

    return { total, read, reading, toRead, avgRating: isNaN(avgRating) ? 0 : avgRating }
  }, [books])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">Lus</p>
              <p className="text-2xl font-bold">{stats.read}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">En cours</p>
              <p className="text-2xl font-bold">{stats.reading}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <div>
              <p className="text-sm text-gray-600">À lire</p>
              <p className="text-2xl font-bold">{stats.toRead}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600">Note moy.</p>
              <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contrôles */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher par titre ou auteur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-80"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | ReadingStatus)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="read">Lus</option>
              <option value="reading">En cours</option>
              <option value="to-read">À lire</option>
            </select>
          </div>
          
          <button
            onClick={onAddBook}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            Ajouter un livre
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-700">Livre</th>
                <th className="text-left p-4 font-medium text-gray-700">
                  <SortButton field="author">Auteur</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-700">Statut</th>
                <th className="text-left p-4 font-medium text-gray-700">
                  <SortButton field="startDate">Début</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  <SortButton field="endDate">Fin</SortButton>
                </th>
                <th className="text-left p-4 font-medium text-gray-700">
                  <SortButton field="rating">Note</SortButton>
                </th>
                <th className="text-right p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedBooks.map((book) => (
                <tr key={book.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
                        {book.coverUrl ? (
                          <Image
                            src={book.coverUrl}
                            alt={`Couverture de ${book.title}`}
                            width={48}
                            height={64}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              target.nextElementSibling?.classList.remove('hidden')
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center ${book.coverUrl ? 'hidden' : ''}`}>
                          <BookOpen className="w-6 h-6 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 line-clamp-2">{book.title}</h3>
                        {book.isbn && (
                          <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-700">{book.author}</td>
                  <td className="p-4">{getStatusBadge(book)}</td>
                  <td className="p-4 text-gray-600 text-sm">{formatDate(book.startDate)}</td>
                  <td className="p-4 text-gray-600 text-sm">{formatDate(book.endDate)}</td>
                  <td className="p-4">{renderStars(book.rating)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEditBook(book)}
                        className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteBook(book.id)}
                        className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAndSortedBooks.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Aucun livre trouvé avec ces critères'
                  : 'Aucun livre dans votre bibliothèque'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}