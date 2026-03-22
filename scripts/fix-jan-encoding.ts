import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixJanName() {
  console.log('🔧 Opravuji jméno Jana Světinského...')

  const users = await prisma.user.findMany({
    where: {
      email: 'jan@svetinsky.cz'
    }
  })

  if (users.length === 0) {
    console.log('❌ Uživatel jan@svetinsky.cz nebyl nalezen')
    return
  }

  for (const user of users) {
    console.log(`Aktuální jméno: "${user.name}"`)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        name: 'Jan Světinský'
      }
    })
    
    console.log(`✅ Opraveno na: "Jan Světinský"`)
  }

  // Také opravíme názvy inzerátů
  const listings = await prisma.listing.findMany({
    where: {
      title: {
        contains: '??'
      }
    }
  })

  console.log(`\n📋 Nalezeno ${listings.length} inzerátů s chybným názvem`)

  for (const listing of listings) {
    const fixedTitle = listing.title
      .replace(/\?\?/g, 'š')
      .replace(/\?/g, '')

    const fixedDescription = listing.description
      .replace(/\?\?/g, 'š')
      .replace(/\?/g, '')
    
    await prisma.listing.update({
      where: { id: listing.id },
      data: { 
        title: fixedTitle,
        description: fixedDescription
      }
    })
    
    console.log(`✅ "${listing.title}" → "${fixedTitle}"`)
  }

  console.log('\n✨ Hotovo!')
}

fixJanName()
  .catch((e) => {
    console.error('❌ Chyba:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
