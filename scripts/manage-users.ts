// scripts/manage-users.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: {
        select: { books: true }
      }
    }
  })
  
  console.log('\n📋 Liste des utilisateurs:')
  console.log('========================')
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`)
    console.log(`   🆔 ID: ${user.id}`)
    console.log(`   📚 Livres: ${user._count.books}`)
    console.log(`   📅 Créé le: ${user.createdAt.toLocaleDateString('fr-FR')}`)
    console.log('')
  })
}

async function deleteUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { _count: { select: { books: true } } }
    })
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé avec cet email')
      return
    }
    
    console.log(`🗑️  Suppression de: ${user.name} (${user.email})`)
    console.log(`📚 Cet utilisateur a ${user._count.books} livre(s) qui seront aussi supprimé(s)`)
    
    // Supprimer l'utilisateur (les livres seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.user.delete({
      where: { email }
    })
    
    console.log('✅ Utilisateur supprimé avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression:', error)
  }
}

async function createUser(email: string, password: string, name: string) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log('❌ Un utilisateur avec cet email existe déjà')
      return
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name
      }
    })
    
    console.log('✅ Utilisateur créé avec succès!')
    console.log('📧 Email:', user.email)
    console.log('👤 Nom:', user.name)
    console.log('🆔 ID:', user.id)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]
  
  switch (command) {
    case 'list':
      await listUsers()
      break
      
    case 'delete':
      const emailToDelete = args[1]
      if (!emailToDelete) {
        console.log('❌ Usage: npm run manage-users delete <email>')
        break
      }
      await deleteUser(emailToDelete)
      break
      
    case 'create':
      const [, email, password, name] = args
      if (!email || !password || !name) {
        console.log('❌ Usage: npm run manage-users create <email> <password> <name>')
        break
      }
      await createUser(email, password, name)
      break
      
    default:
      console.log('🔧 Commandes disponibles:')
      console.log('  npm run manage-users list                           - Lister tous les utilisateurs')
      console.log('  npm run manage-users delete <email>                 - Supprimer un utilisateur')
      console.log('  npm run manage-users create <email> <password> <name> - Créer un utilisateur')
      console.log('')
      console.log('📌 Exemples:')
      console.log('  npm run manage-users list')
      console.log('  npm run manage-users delete admin@booklist.com')
      console.log('  npm run manage-users create "john@example.com" "motdepasse123" "John Doe"')
  }
  
  await prisma.$disconnect()
}

main().catch(console.error)