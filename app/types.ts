export interface User {
  id: string
  email: string
  name: string
}

export interface Book {
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

export interface BookFormData {
  title: string
  author: string
  isbn?: string | null
  startDate?: Date | null
  endDate?: Date | null
  rating?: number | null
  coverUrl?: string | null
}

export type ReadingStatus = 'read' | 'reading' | 'to-read'