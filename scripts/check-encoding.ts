import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAndFix() {
  console.log('🔍 Kontroluji data v databázi...\n')

  // Získej data surově
  const listings = await prisma.$queryRaw`
    SELECT id, title, encode(title::bytea, 'hex') as title_hex
    FROM listings
  `

  console.log('Inzeráty:')
  console.log(listings)

  const users = await prisma.$queryRaw`
    SELECT id, name, email, encode(name::bytea, 'hex') as name_hex
    FROM users
  `

  console.log('\nUživatelé:')
  console.log(users)

  // Oprav data pomocí UPDATE s explicitním encoding
  console.log('\n🔧 Opravuji data...')

  await prisma.$executeRaw`
    UPDATE listings 
    SET title = 'Škoda fabia 1'
    WHERE id = 'cmldzpksq0001swwm8y8cdgbc'
  `

  await prisma.$executeRaw`
    UPDATE users
    SET name = 'Jan Světinský'
    WHERE email = 'jan@svetinsky.cz'
  `

  console.log('✅ Data opravena')

  // Ověř
  const fixed = await prisma.listing.findFirst({
    where: { id: 'cmldzpksq0001swwm8y8cdgbc' }
  })

  console.log('\nOpravený inzerát:')
  console.log(fixed)
}

checkAndFix()
  .catch((e) => {
    console.error('❌ Chyba:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
