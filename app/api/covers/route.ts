// app/api/covers/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const title = searchParams.get('title')
  const author = searchParams.get('author')
  const isbn = searchParams.get('isbn')

  if (!title && !isbn) {
    return NextResponse.json(
      { error: 'Titre ou ISBN requis' },
      { status: 400 }
    )
  }

  try {
    let coverUrl = null

    // Priorité 1: Recherche par ISBN si disponible
    if (isbn) {
      const isbnResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${process.env.GOOGLE_BOOKS_API_KEY || ''}`
      )
      
      if (isbnResponse.ok) {
        const isbnData = await isbnResponse.json()
        if (isbnData.items && isbnData.items[0]?.volumeInfo?.imageLinks?.thumbnail) {
          coverUrl = isbnData.items[0].volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')
        }
      }
    }

    // Priorité 2: Recherche par titre et auteur
    if (!coverUrl && title) {
      const query = author ? `${title}+inauthor:${author}` : title
      const titleResponse = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${process.env.GOOGLE_BOOKS_API_KEY || ''}`
      )
      
      if (titleResponse.ok) {
        const titleData = await titleResponse.json()
        
        // Chercher la meilleure correspondance
        if (titleData.items) {
          for (const item of titleData.items) {
            const bookTitle = item.volumeInfo?.title?.toLowerCase() || ''
            const bookAuthors = item.volumeInfo?.authors?.map((a: string) => a.toLowerCase()) || []
            
            // Vérifier si le titre correspond
            const titleMatch = bookTitle.includes(title.toLowerCase()) || title.toLowerCase().includes(bookTitle)
            
            // Vérifier si l'auteur correspond (si fourni)
            let authorMatch = true
            if (author) {
              authorMatch = bookAuthors.some((bookAuthor: string) => 
                bookAuthor.includes(author.toLowerCase()) || author.toLowerCase().includes(bookAuthor)
              )
            }
            
            if (titleMatch && authorMatch && item.volumeInfo?.imageLinks?.thumbnail) {
              coverUrl = item.volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')
              break
            }
          }
          
          // Si pas de correspondance exacte, prendre la première avec une image
          if (!coverUrl && titleData.items[0]?.volumeInfo?.imageLinks?.thumbnail) {
            coverUrl = titleData.items[0].volumeInfo.imageLinks.thumbnail.replace('http:', 'https:')
          }
        }
      }
    }

    // Priorité 3: Fallback avec Open Library
    if (!coverUrl && title) {
      try {
        const openLibraryQuery = author ? `${title} ${author}` : title
        const openLibResponse = await fetch(
          `https://openlibrary.org/search.json?title=${encodeURIComponent(openLibraryQuery)}&limit=5`
        )
        
        if (openLibResponse.ok) {
          const openLibData = await openLibResponse.json()
          
          if (openLibData.docs && openLibData.docs[0]?.cover_i) {
            coverUrl = `https://covers.openlibrary.org/b/id/${openLibData.docs[0].cover_i}-M.jpg`
          }
        }
      } catch (error) {
        console.log('Erreur Open Library:', error)
      }
    }

    return NextResponse.json({
      coverUrl,
      source: coverUrl ? (coverUrl.includes('googleapis') ? 'Google Books' : 'Open Library') : null
    })

  } catch (error) {
    console.error('Erreur lors de la recherche de couverture:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de couverture' },
      { status: 500 }
    )
  }
}