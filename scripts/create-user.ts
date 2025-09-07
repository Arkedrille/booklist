// scripts/create-user.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createUser() {
  const email = 'karlvercelbooklist.2hlrh@passmail.net'  // Change avec ton email
  const password = 'qD%zcCZf$Kk268mwvnCk'       // Change avec ton mot de passe
  const name = 'Karl'                 // Change avec ton nom
  
  try {
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      console.log('❌ Un utilisateur avec cet email existe déjà')
      return
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
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
  } finally {
    await prisma.$disconnect()
  }
}

createUser()