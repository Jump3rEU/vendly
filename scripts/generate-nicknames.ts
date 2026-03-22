import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateNickname(name: string): string {
  if (!name) return ''
  
  // Odstranit diakritiku a převést na lowercase
  let nickname = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  
  // České znaky
  nickname = nickname
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
  
  // Speciální případy pro známá jména
  if (nickname.includes('jan') && nickname.includes('svetinsky')) {
    return 'svjeta'
  }
  
  // Odstranit mezery a speciální znaky
  nickname = nickname
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  
  return nickname
}

async function generateNicknames() {
  console.log('🔧 Generuji nicknames pro uživatele...\n')

  const users = await prisma.user.findMany({
    where: {
      nickname: null
    }
  })

  console.log(`📋 Nalezeno ${users.length} uživatelů bez nickname\n`)

  for (const user of users) {
    if (!user.name) {
      console.log(`⏭️  Přeskakuji uživatele ${user.email} (nemá jméno)`)
      continue
    }

    let nickname = generateNickname(user.name)
    
    // Zkontroluj, jestli nickname už neexistuje
    let counter = 1
    let finalNickname = nickname
    while (await prisma.user.findUnique({ where: { nickname: finalNickname } })) {
      finalNickname = `${nickname}${counter}`
      counter++
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { nickname: finalNickname }
    })
    
    console.log(`✅ ${user.name} → @${finalNickname}`)
  }

  console.log('\n✨ Hotovo!')
  
  // Zobraz všechny nicknames
  const allUsers = await prisma.user.findMany({
    select: {
      name: true,
      nickname: true,
      email: true
    }
  })
  
  console.log('\n📋 Všichni uživatelé:')
  allUsers.forEach(u => {
    console.log(`  ${u.name} (@${u.nickname}) - ${u.email}`)
  })
}

generateNicknames()
  .catch((e) => {
    console.error('❌ Chyba:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
