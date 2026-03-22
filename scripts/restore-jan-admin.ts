import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if Jan Světinský exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: 'jan@svetinsky.cz' },
        { name: { contains: 'Světinský' } }
      ]
    }
  })

  if (existingUser) {
    // Update to admin if exists
    const updated = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: 'ADMIN',
        status: 'ACTIVE',
        idVerified: true,
        phoneVerified: true,
      }
    })
    
    console.log('✅ Uživatel aktualizován na admina:')
    console.log('   ID:', updated.id)
    console.log('   Email:', updated.email)
    console.log('   Jméno:', updated.name)
    console.log('   Role:', updated.role)
  } else {
    // Create new admin user
    const password = await hash('admin123456', 12)
    
    const newUser = await prisma.user.create({
      data: {
        email: 'jan@svetinsky.cz',
        password: password,
        name: 'Jan Světinský',
        role: 'ADMIN',
        status: 'ACTIVE',
        idVerified: true,
        phoneVerified: true,
        trustScore: 100,
      }
    })
    
    console.log('✅ Nový admin uživatel vytvořen:')
    console.log('   Email: jan@svetinsky.cz')
    console.log('   Heslo: admin123456')
    console.log('   Jméno:', newUser.name)
    console.log('   Role:', newUser.role)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
