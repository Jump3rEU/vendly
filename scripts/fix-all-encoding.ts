import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixAll() {
  console.log('🔧 Opravuji encoding všech dat...')

  // Oprav všechny inzeráty
  const listings = await prisma.listing.findMany()
  
  console.log(`📋 Kontroluji ${listings.length} inzerátů...`)

  for (const listing of listings) {
    const updates: any = {}
    let needsUpdate = false

    if (listing.title.includes('??') || listing.title.includes('�')) {
      updates.title = 'Škoda fabia 1'
      needsUpdate = true
      console.log(`  Opravuji název: "${listing.title}" → "${updates.title}"`)
    }

    if (listing.description && (listing.description.includes('??') || listing.description.includes('�'))) {
      updates.description = listing.description
        .replace(/\?\?/g, 'š')
        .replace(/�/g, 'š')
      needsUpdate = true
      console.log(`  Opravuji popis`)
    }

    if (needsUpdate) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: updates
      })
      console.log(`✅ Inzerát ${listing.id} opraven`)
    }
  }

  // Oprav všechny uživatele
  const users = await prisma.user.findMany()
  
  console.log(`\n👥 Kontroluji ${users.length} uživatelů...`)

  for (const user of users) {
    if (user.name && (user.name.includes('??') || user.name.includes('�'))) {
      const fixedName = user.name === 'Jan Sv??tinsk??' || user.name.includes('Světinsk')
        ? 'Jan Světinský'
        : user.name.replace(/\?\?/g, 'š').replace(/�/g, 'š')

      await prisma.user.update({
        where: { id: user.id },
        data: { name: fixedName }
      })
      
      console.log(`  ✅ "${user.name}" → "${fixedName}"`)
    }
  }

  console.log('\n✨ Hotovo!')
}

fixAll()
  .catch((e) => {
    console.error('❌ Chyba:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
