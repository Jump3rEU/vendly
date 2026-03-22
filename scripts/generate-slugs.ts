import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSlug(title: string, id: string): string {
  // Převod na lowercase a normalizace
  let slug = title
    .toLowerCase()
    .normalize('NFD')  // Rozdělit znaky s diakritikou
    .replace(/[\u0300-\u036f]/g, '')  // Odstranit diakritiku
    
  // České znaky
  slug = slug
    .replace(/š/g, 's')
    .replace(/č/g, 'c')
    .replace(/ř/g, 'r')
    .replace(/ž/g, 'z')
    .replace(/ý/g, 'y')
    .replace(/á/g, 'a')
    .replace(/í/g, 'i')
    .replace(/é/g, 'e')
    .replace(/ě/g, 'e')
    .replace(/ú/g, 'u')
    .replace(/ů/g, 'u')
    .replace(/ó/g, 'o')
    .replace(/ď/g, 'd')
    .replace(/ť/g, 't')
    .replace(/ň/g, 'n')
    
  // Odstranit speciální znaky a nahradit mezery pomlčkami
  slug = slug
    .replace(/[^a-z0-9\s-]/g, '')  // Pouze písmena, čísla, mezery a pomlčky
    .replace(/\s+/g, '-')          // Mezery na pomlčky
    .replace(/-+/g, '-')           // Více pomlček na jednu
    .replace(/^-|-$/g, '')         // Odstranit pomlčky na začátku/konci
    
  // Přidat zkrácené ID pro uniqueness
  const shortId = id.slice(-8)
  slug = `${slug}-${shortId}`
  
  return slug
}

async function generateSlugs() {
  console.log('🔧 Generuji slugy pro existující inzeráty...')

  const listings = await prisma.listing.findMany({
    where: {
      slug: null
    }
  })

  console.log(`📋 Nalezeno ${listings.length} inzerátů bez slugu`)

  for (const listing of listings) {
    const slug = generateSlug(listing.title, listing.id)
    
    await prisma.listing.update({
      where: { id: listing.id },
      data: { slug }
    })
    
    console.log(`✅ Vygenerován slug: ${listing.title} → ${slug}`)
  }

  console.log('✨ Hotovo!')
}

generateSlugs()
  .catch((e) => {
    console.error('❌ Chyba:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
