import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixEncoding() {
  console.log('🔧 Opravuji encoding v databázi...')

  // Načti všechny inzeráty s problémovým encodingem
  const listings = await prisma.listing.findMany({
    where: {
      OR: [
        { title: { contains: '??' } },
        { description: { contains: '??' } }
      ]
    }
  })

  console.log(`📋 Nalezeno ${listings.length} inzerátů s chybným encodingem`)

  for (const listing of listings) {
    const fixes: any = {}

    // Oprav běžné chyby v encodingu
    if (listing.title.includes('??')) {
      fixes.title = listing.title
        .replace(/\?\?koda/g, 'Škoda')
        .replace(/\?\?/g, 'š')
    }

    if (listing.description && listing.description.includes('??')) {
      fixes.description = listing.description
        .replace(/\?\?koda/g, 'Škoda')
        .replace(/\?\?/g, 'š')
    }

    if (Object.keys(fixes).length > 0) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: fixes
      })
      console.log(`✅ Opraven inzerát: ${listing.title} → ${fixes.title || listing.title}`)
    }
  }

  // Oprav uživatele
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: '??' } }
      ]
    }
  })

  console.log(`👥 Nalezeno ${users.length} uživatelů s chybným encodingem`)

  for (const user of users) {
    if (user.name && user.name.includes('??')) {
      const fixedName = user.name.replace(/\?\?/g, 'š')
      await prisma.user.update({
        where: { id: user.id },
        data: { name: fixedName }
      })
      console.log(`✅ Opraven uživatel: ${user.name} → ${fixedName}`)
    }
  }

  console.log('✨ Hotovo!')
}

fixEncoding()
  .catch((e) => {
    console.error('❌ Chyba:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
