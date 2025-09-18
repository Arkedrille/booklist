// scripts/migrate-mysql-data.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Données des utilisateurs existants (ne pas créer, juste mapper)
const userEmailMapping = {
  1: 'karlvercelbooklist.2hlrh@passmail.net',  // Karl
  2: 'zoelacoume@proton.me'                     // Zozo
}

const books = [
  { read_user: 1, read_title: 'Le Seigneur des Anneaux III', read_author: 'J.R.R Tolkien', read_date_deb: '2023-12-24', read_date_end: '2024-01-08' },
  { read_user: 1, read_title: 'La musique et les musiciens', read_author: 'Belgodere-Johannes V.', read_date_deb: '2024-01-09', read_date_end: '2024-01-14' },
  { read_user: 1, read_title: 'Le Sorceleur III', read_author: 'Andrzej Sapkowski', read_date_deb: '2024-01-14', read_date_end: '2024-01-26' },
  { read_user: 1, read_title: 'L\'Aîné (Héritage II)', read_author: 'Christopher Paolini', read_date_deb: '2024-01-26', read_date_end: '2024-02-08' },
  { read_user: 1, read_title: 'Power, les 48 lois du pouvoir', read_author: 'Robert Greene', read_date_deb: '2024-01-29', read_date_end: '2024-02-10' },
  { read_user: 1, read_title: 'Cobain (Journal)', read_author: 'J.C. Zylberstein', read_date_deb: '2024-02-10', read_date_end: '2024-02-27' },
  { read_user: 1, read_title: 'Brisingr (Héritage III)', read_author: 'Christopher Paolini', read_date_deb: '2024-02-13', read_date_end: '2024-02-19' },
  { read_user: 1, read_title: 'L\'Héritage (Héritage IV)', read_author: 'Christopher Paolini', read_date_deb: '2024-02-20', read_date_end: '2024-02-24' },
  { read_user: 1, read_title: 'La fourchette, La sorcière et Le dragon', read_author: 'Christopher Paolini', read_date_deb: '2024-02-24', read_date_end: '2024-02-26' },
  { read_user: 1, read_title: 'L\'amour', read_author: 'François Bégaudeau', read_date_deb: '2024-02-26', read_date_end: '2024-02-28' },
  { read_user: 1, read_title: 'La maîtresse italienne', read_author: 'Jean-Marie Rouart', read_date_deb: '2024-03-01', read_date_end: '2024-03-04' },
  { read_user: 1, read_title: 'Les Fleurs du Mal', read_author: 'Charles Baudelaire', read_date_deb: '2024-03-01', read_date_end: '2024-10-24' },
  { read_user: 1, read_title: 'Blade Runner', read_author: 'Philipp K. Dick', read_date_deb: '2024-03-06', read_date_end: '2024-03-07' },
  { read_user: 1, read_title: 'L\'Homme Invisible', read_author: 'H.G. Wells', read_date_deb: '2024-03-07', read_date_end: '2024-03-11' },
  { read_user: 2, read_title: 'Dolores Claiborne', read_author: 'Stephen King', read_date_deb: '2024-03-11', read_date_end: null },
  { read_user: 2, read_title: 'Shining', read_author: 'Stephen King', read_date_deb: '2024-03-01', read_date_end: '2024-03-10' },
  { read_user: 1, read_title: 'Fahrenheit 451', read_author: 'Ray Bradbury', read_date_deb: '2024-03-12', read_date_end: '2024-03-13' },
  { read_user: 1, read_title: 'La Tresse', read_author: 'Laetitia Colombani', read_date_deb: '2024-03-13', read_date_end: '2024-03-14' },
  { read_user: 1, read_title: 'Poèmes', read_author: 'Edgar Allan Poe', read_date_deb: '2024-03-14', read_date_end: '2024-03-15' },
  { read_user: 1, read_title: 'Les carnets du sous sol', read_author: 'Dostoyevsky', read_date_deb: '2024-03-16', read_date_end: '2024-03-22' },
  { read_user: 1, read_title: 'La geste du sixième royaume', read_author: 'Adrien Thomas', read_date_deb: '2024-03-21', read_date_end: '2024-03-30' },
  { read_user: 1, read_title: 'Alexandre le grand', read_author: 'Maurice Druon', read_date_deb: '2024-03-30', read_date_end: '2024-04-04' },
  { read_user: 1, read_title: 'Fondation', read_author: 'Isaac Asimov', read_date_deb: '2024-04-05', read_date_end: '2024-04-21' },
  { read_user: 1, read_title: 'Persécuté persécuteur', read_author: 'Aragon', read_date_deb: '2024-04-21', read_date_end: '2024-04-21' },
  { read_user: 1, read_title: 'Marthe et autres nouvelles', read_author: 'Joris-Karl Hyusmans', read_date_deb: '2024-04-22', read_date_end: '2024-06-26' },
  { read_user: 2, read_title: 'Au bonheur des dames', read_author: 'Zola', read_date_deb: '2024-03-27', read_date_end: '2024-04-21' },
  { read_user: 2, read_title: 'La tresse', read_author: 'Laeticia Colombani', read_date_deb: '2024-03-20', read_date_end: '2024-03-27' },
  { read_user: 1, read_title: 'Salle 6 et nouvelles', read_author: 'Anton Tchekhov', read_date_deb: '2024-04-26', read_date_end: '2024-05-02' },
  { read_user: 1, read_title: 'Le guide du voyageur galactique', read_author: 'Douglas Adam', read_date_deb: '2024-05-02', read_date_end: '2024-05-07' },
  { read_user: 1, read_title: 'Tragédie Française - Histoire intime de la Vème République', read_author: 'Franz-Olivier Giesbert', read_date_deb: '2024-05-08', read_date_end: '2024-05-16' },
  { read_user: 2, read_title: 'Jessie', read_author: 'Stephen king', read_date_deb: '2024-04-22', read_date_end: '2024-05-10' },
  { read_user: 1, read_title: 'La peste', read_author: 'Albert Camus', read_date_deb: '2024-05-17', read_date_end: '2024-05-30' },
  { read_user: 1, read_title: 'Le mage du Kremlin', read_author: 'Giulliano Da Empoli', read_date_deb: '2024-05-30', read_date_end: '2024-06-03' },
  { read_user: 1, read_title: 'Murtagh', read_author: 'Christopher Paoloni', read_date_deb: '2024-06-03', read_date_end: '2024-06-17' },
  { read_user: 1, read_title: 'Kant à la plage', read_author: 'Francis Métivier', read_date_deb: '2024-06-05', read_date_end: '2024-06-14' },
  { read_user: 1, read_title: 'Le maître du haut château', read_author: 'Philip K. Dick', read_date_deb: '2024-06-07', read_date_end: '2024-06-13' },
  { read_user: 2, read_title: 'Les femmes dans la guerre', read_author: 'Claude Quetel', read_date_deb: '2024-05-10', read_date_end: '2024-06-05' },
  { read_user: 1, read_title: 'The Legend of Zelda - The Minis Cap & Phantom Hourglass', read_author: 'Akira Himekawa', read_date_deb: '2024-06-09', read_date_end: '2024-06-10' },
  { read_user: 1, read_title: 'Berserk 01', read_author: 'Kentaro Miura', read_date_deb: '2024-06-12', read_date_end: '2024-06-13' },
  { read_user: 1, read_title: 'Berserk 02', read_author: 'Kentaro Miura', read_date_deb: '2024-06-13', read_date_end: '2024-06-13' },
  { read_user: 1, read_title: 'Berserk 03', read_author: 'Kentaro Miura', read_date_deb: '2024-06-13', read_date_end: '2024-06-13' },
  { read_user: 1, read_title: 'Jessie', read_author: 'Stephen King', read_date_deb: '2024-06-19', read_date_end: '2024-06-23' },
  { read_user: 1, read_title: 'Berserk 04', read_author: 'Kentaro Miura', read_date_deb: '2024-06-19', read_date_end: '2024-06-21' },
  { read_user: 1, read_title: 'Berserk 05', read_author: 'Kentaro Miura', read_date_deb: '2024-06-22', read_date_end: '2024-06-22' },
  { read_user: 1, read_title: 'Les Pilliers de la Terre', read_author: 'Ken Follett', read_date_deb: '2024-06-23', read_date_end: '2024-06-30' },
  { read_user: 1, read_title: 'Berserk 06', read_author: 'Kentaro Miura', read_date_deb: '2024-06-24', read_date_end: '2024-06-24' },
  { read_user: 1, read_title: 'Berserk 07', read_author: 'Kentaro Miura', read_date_deb: '2024-06-24', read_date_end: '2024-06-25' },
  { read_user: 1, read_title: 'Berserk 08', read_author: 'Kentaro Miura', read_date_deb: '2024-06-26', read_date_end: '2024-06-26' },
  { read_user: 1, read_title: 'Berserk 09', read_author: 'Kentaro Miura', read_date_deb: '2024-06-27', read_date_end: '2024-06-27' },
  { read_user: 1, read_title: 'Berserk 10', read_author: 'Kentaro Miura', read_date_deb: '2024-06-27', read_date_end: '2024-06-24' },
  { read_user: 1, read_title: 'Solo Levelling', read_author: 'Chu-Gong', read_date_deb: '2024-06-27', read_date_end: '2024-06-27' },
  { read_user: 1, read_title: 'Jouissance Club', read_author: 'Jüne Plã', read_date_deb: '2024-06-30', read_date_end: null },
  { read_user: 1, read_title: 'Berserk 11', read_author: 'Kentaro Miura', read_date_deb: '2024-07-01', read_date_end: '2024-07-01' },
  { read_user: 1, read_title: 'Berserk 12', read_author: 'Kentaro Miura', read_date_deb: '2024-07-01', read_date_end: '2024-07-01' },
  { read_user: 1, read_title: 'Berserk 13', read_author: 'Kentaro Miura', read_date_deb: '2024-07-01', read_date_end: '2024-07-03' },
  { read_user: 1, read_title: 'Berserk 14', read_author: 'Kentaro Miura', read_date_deb: '2024-07-03', read_date_end: '2024-07-03' },
  { read_user: 1, read_title: 'Berserk 15', read_author: 'Kentaro Miura', read_date_deb: '2024-07-03', read_date_end: '2024-07-03' },
  { read_user: 1, read_title: 'Berserk 16', read_author: 'Kentaro Miura', read_date_deb: '2024-07-03', read_date_end: '2024-07-03' },
  { read_user: 1, read_title: 'Berserk 17', read_author: 'Kentaro Miura', read_date_deb: '2024-07-03', read_date_end: '2024-07-04' },
  { read_user: 1, read_title: 'Berserk 18', read_author: 'Kentaro Miura', read_date_deb: '2024-07-04', read_date_end: '2024-07-04' },
  { read_user: 1, read_title: 'Berserk 19', read_author: 'Kentaro Miura', read_date_deb: '2024-07-04', read_date_end: '2024-07-04' },
  { read_user: 1, read_title: 'Berserk 20', read_author: 'Kentaro Miura', read_date_deb: '2024-07-04', read_date_end: '2024-07-04' },
  { read_user: 1, read_title: 'Minuit dans la ville des songes', read_author: 'René Frégni', read_date_deb: '2024-07-05', read_date_end: '2024-07-08' },
  { read_user: 1, read_title: 'Shining', read_author: 'Stephen King', read_date_deb: '2024-07-08', read_date_end: '2024-08-04' },
  { read_user: 1, read_title: 'Les Versets sataniques', read_author: 'Salman Rushdie', read_date_deb: '2024-07-09', read_date_end: '2024-07-25' },
  { read_user: 1, read_title: 'Le Collaborateur', read_author: 'Aragon', read_date_deb: '2024-07-26', read_date_end: '2024-08-02' },
  { read_user: 1, read_title: 'Les Aiguilles d\'Or', read_author: 'Michael Mc Dowell', read_date_deb: '2024-08-04', read_date_end: '2024-08-15' },
  { read_user: 1, read_title: 'Carnets noirs', read_author: 'Stephen King', read_date_deb: '2024-08-15', read_date_end: '2024-08-23' },
  { read_user: 1, read_title: 'Photographie - technique, pratique, esthétique', read_author: 'Jean Christophe Béchet', read_date_deb: '2024-08-20', read_date_end: '2024-09-16' },
  { read_user: 1, read_title: 'La dernière mission de Gwendy', read_author: 'Stephen King, Richard Chizmar', read_date_deb: '2024-08-23', read_date_end: '2024-08-28' },
  { read_user: 1, read_title: 'La Pologne Des origines à nos jours', read_author: 'Daniel Beauvois', read_date_deb: '2024-08-28', read_date_end: '2024-09-16' },
  { read_user: 1, read_title: 'Des souris et des hommes', read_author: 'John Steinbeck', read_date_deb: '2024-09-17', read_date_end: '2024-09-18' },
  { read_user: 1, read_title: 'Le vieil homme et la mer', read_author: 'Ernest Hemingway', read_date_deb: '2024-09-18', read_date_end: '2024-09-19' },
  { read_user: 1, read_title: 'Paris est une fête', read_author: 'Ernest Hemingway', read_date_deb: '2024-09-19', read_date_end: '2024-09-25' },
  { read_user: 1, read_title: 'L\'adieu aux armes', read_author: 'Ernest Hemingway', read_date_deb: '2024-09-25', read_date_end: '2024-10-01' },
  { read_user: 1, read_title: 'Salem', read_author: 'Stephen King', read_date_deb: '2024-10-03', read_date_end: '2024-10-11' },
  { read_user: 1, read_title: 'Au-delà du fleuve et sous les arbres', read_author: 'Ernest Hemingway', read_date_deb: '2024-10-11', read_date_end: '2024-10-20' },
  { read_user: 1, read_title: 'La tour sombre Tome 5 - Les loups de la calla', read_author: 'Stephen King', read_date_deb: '2024-10-21', read_date_end: '2024-11-01' },
  { read_user: 1, read_title: 'Le soleil se lève aussi', read_author: 'Ernest Hemingway', read_date_deb: '2024-11-01', read_date_end: '2024-11-08' },
  { read_user: 1, read_title: 'Le premier homme', read_author: 'Albert Camus', read_date_deb: '2024-11-10', read_date_end: '2024-12-09' },
  { read_user: 1, read_title: 'Les rois maudits', read_author: 'Maurice Druon', read_date_deb: '2024-11-18', read_date_end: '2025-05-28' },
  { read_user: 1, read_title: 'American Psycho', read_author: 'Bret Easton Ellis', read_date_deb: '2024-12-16', read_date_end: '2025-01-04' },
  { read_user: 1, read_title: 'La zone du dehors', read_author: 'Alain Damasio', read_date_deb: '2024-12-23', read_date_end: '2025-01-15' },
  { read_user: 1, read_title: 'Danse Macabre', read_author: 'Stephen King', read_date_deb: '2024-12-25', read_date_end: '2025-01-04' },
  { read_user: 1, read_title: 'Berserk 21', read_author: 'Kentaro Miura', read_date_deb: '2024-12-24', read_date_end: '2024-12-28' },
  { read_user: 1, read_title: 'Neuromancien', read_author: 'William Gibson', read_date_deb: '2025-01-15', read_date_end: '2025-01-20' },
  { read_user: 2, read_title: 'Le soleil se lève aussi', read_author: 'Hemingway', read_date_deb: '2024-11-10', read_date_end: '2025-01-19' },
  { read_user: 2, read_title: 'A l\'est d\'Eden', read_author: 'Steinbeck', read_date_deb: '2024-09-01', read_date_end: '2024-10-20' },
  { read_user: 2, read_title: 'Les choses humaines', read_author: 'Tuil', read_date_deb: '2024-08-08', read_date_end: '2024-09-01' },
  { read_user: 2, read_title: 'Docteur sleep', read_author: 'Stephen King', read_date_deb: '2024-10-21', read_date_end: '2024-11-16' },
  { read_user: 2, read_title: 'Katie', read_author: 'Michael mcdowell', read_date_deb: '2024-07-22', read_date_end: '2024-07-31' },
  { read_user: 2, read_title: 'Mémoire de fille', read_author: 'Annie Ernaux', read_date_deb: '2024-08-01', read_date_end: '2024-08-08' },
  { read_user: 2, read_title: '1984', read_author: 'George Orwell', read_date_deb: '2024-05-15', read_date_end: '2024-06-21' },
  { read_user: 1, read_title: 'Gatsby le Magnifique', read_author: 'F. Scott Fitzgerald', read_date_deb: '2025-01-20', read_date_end: '2025-01-23' },
  { read_user: 1, read_title: 'Les grandes oubliées - Pourquoi l\'histoire a effacé les femmes', read_author: 'Titiou Lecoq', read_date_deb: '2025-01-23', read_date_end: '2025-01-27' },
  { read_user: 1, read_title: 'L\'étranger', read_author: 'Albert Camus', read_date_deb: '2025-01-29', read_date_end: '2025-01-29' },
  { read_user: 1, read_title: 'Histoire intime de la Vème République', read_author: 'Franz-Olivier Giesbert', read_date_deb: '2025-01-29', read_date_end: '2025-02-06' },
  { read_user: 1, read_title: 'Le problème à trois corps', read_author: 'Liu Cixin', read_date_deb: '2025-02-06', read_date_end: '2025-02-13' },
  { read_user: 1, read_title: 'Nouvelles de Pétersbourg', read_author: 'Gogol', read_date_deb: '2025-02-13', read_date_end: '2025-02-19' },
  { read_user: 1, read_title: 'Conte de fées', read_author: 'Stephen King', read_date_deb: '2025-02-19', read_date_end: '2025-03-06' },
  { read_user: 1, read_title: 'L\'histoire ignorée de la marine francaise', read_author: 'Étienne Taillemite', read_date_deb: '2025-03-06', read_date_end: '2025-03-26' },
  { read_user: 1, read_title: 'Chroniques Martiennes', read_author: 'Ray Bradbury', read_date_deb: '2025-03-26', read_date_end: '2025-04-01' },
  { read_user: 1, read_title: 'Pour que l\'on se souvienne', read_author: 'Caroline Darian', read_date_deb: '2025-04-03', read_date_end: '2025-04-03' },
  { read_user: 1, read_title: 'La Grande Histoire de la Chine', read_author: 'Laurent Testot', read_date_deb: '2025-04-04', read_date_end: '2025-04-14' },
  { read_user: 1, read_title: 'Fille de la révolution', read_author: 'Vera Broido', read_date_deb: '2025-04-15', read_date_end: '2025-04-23' },
  { read_user: 1, read_title: 'Plus noir que noir', read_author: 'Stephen King', read_date_deb: '2025-04-23', read_date_end: '2025-05-04' },
  { read_user: 1, read_title: 'Les présidents des États-Unis', read_author: 'George Ayache', read_date_deb: '2025-05-05', read_date_end: '2025-05-25' },
  { read_user: 1, read_title: 'Voyage au bout de la nuit', read_author: 'Louis-Ferdinand Céline', read_date_deb: '2025-05-28', read_date_end: '2025-06-17' },
  { read_user: 1, read_title: 'Le Maître et Marguerite', read_author: 'Mikhaïl Boulgakov', read_date_deb: '2025-06-17', read_date_end: '2025-07-02' },
  { read_user: 1, read_title: 'Nexus', read_author: 'Yuval Noah Harari', read_date_deb: '2025-07-02', read_date_end: null }
]

async function migrateData() {
  console.log('Début de la migration des données MySQL vers PostgreSQL')
  
  try {
    // 1. Récupérer les utilisateurs existants
    console.log('Récupération des utilisateurs existants...')
    
    const userMapping: Record<number, string> = {}
    
    for (const [mysqlUserId, email] of Object.entries(userEmailMapping)) {
      const user = await prisma.user.findUnique({
        where: { email }
      })
      
      if (user) {
        userMapping[Number(mysqlUserId)] = user.id
        console.log(`Utilisateur trouvé: ${user.name} (${email})`)
      } else {
        console.log(`Utilisateur non trouvé: ${email}`)
        throw new Error(`Utilisateur ${email} non trouvé dans la base PostgreSQL`)
      }
    }
    
    // 2. Migrer les livres
    console.log('Migration des livres...')
    
    let migratedCount = 0
    let skippedCount = 0
    
    for (const bookData of books) {
      const userId = userMapping[bookData.read_user]
      
      if (!userId) {
        console.log(`Utilisateur non trouvé pour le livre: ${bookData.read_title}`)
        skippedCount++
        continue
      }
      
      // Vérifier si le livre existe déjà
      const existingBook = await prisma.book.findFirst({
        where: {
          title: bookData.read_title,
          author: bookData.read_author,
          userId: userId
        }
      })
      
      if (existingBook) {
        console.log(`Livre déjà existant: ${bookData.read_title}`)
        skippedCount++
        continue
      }
      
      // Traitement des dates
      const startDate = bookData.read_date_deb && bookData.read_date_deb !== '0000-00-00' 
        ? new Date(bookData.read_date_deb) 
        : null
        
      const endDate = bookData.read_date_end && bookData.read_date_end !== '0000-00-00' 
        ? new Date(bookData.read_date_end) 
        : null
      
      await prisma.book.create({
        data: {
          title: bookData.read_title,
          author: bookData.read_author,
          startDate,
          endDate,
          userId,
          rating: null,
          isbn: null,
          coverUrl: null
        }
      })
      
      migratedCount++
      console.log(`Livre migré: ${bookData.read_title} par ${bookData.read_author}`)
    }
    
    console.log(`\nMigration terminée!`)
    console.log(`Statistiques:`)
    console.log(`   - Livres migrés: ${migratedCount}`)
    console.log(`   - Livres ignorés: ${skippedCount}`)
    console.log(`   - Total: ${books.length}`)
    
  } catch (error) {
    console.error('Erreur lors de la migration:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Lancer la migration
migrateData()