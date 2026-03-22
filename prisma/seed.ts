import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Vendly with test data...')

  // Create test sellers
  const password = await bcrypt.hash('heslo123', 10)
  
  const sellers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'martin.novak@test.cz' },
      update: {},
      create: { email: 'martin.novak@test.cz', password, name: 'Martin Novák', nickname: 'martin_n', trustScore: 95, totalSales: 23, role: 'SELLER', status: 'ACTIVE' }
    }),
    prisma.user.upsert({
      where: { email: 'jana.kral@test.cz' },
      update: {},
      create: { email: 'jana.kral@test.cz', password, name: 'Jana Králová', nickname: 'jana_k', trustScore: 88, totalSales: 11, role: 'SELLER', status: 'ACTIVE' }
    }),
    prisma.user.upsert({
      where: { email: 'petr.svoboda@test.cz' },
      update: {},
      create: { email: 'petr.svoboda@test.cz', password, name: 'Petr Svoboda', nickname: 'petr_s', trustScore: 72, totalSales: 5, role: 'SELLER', status: 'ACTIVE' }
    }),
  ])

  console.log('Created', sellers.length, 'sellers')

  // Seed listings
  const listings = [
    {
      title: 'iPhone 13 Pro 256GB – skvělý stav',
      slug: 'iphone-13-pro-256gb',
      description: 'Prodávám iPhone 13 Pro v barvě Sierra Blue, 256GB. Telefon je v perfektním stavu, bez škrábanců. Baterie 91%. Součástí krabice a originální nabíječka. Nekouřím, zvířata nemám.',
      category: 'Elektronika',
      condition: 'VERY_GOOD',
      price: 15990,
      location: 'Praha 2',
      images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&q=80'],
      sellerId: sellers[0].id,
      deliveryMethods: ['PERSONAL', 'ZASILKOVNA'],
      allowsOffers: true,
    },
    {
      title: 'Trek Marlin 7 2022 – horské kolo vel. L',
      slug: 'trek-marlin-7-2022',
      description: 'Horské kolo Trek Marlin 7 z roku 2022, velikost L, barva černá/červená. Najeto cca 800 km, servisováno. Hydraulické kotouče, hydraulické řazení Shimano. Stav výborný.',
      category: 'Cyklo',
      condition: 'GOOD',
      price: 8500,
      location: 'Brno-střed',
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'],
      sellerId: sellers[1].id,
      deliveryMethods: ['PERSONAL'],
      allowsOffers: true,
    },
    {
      title: 'Sony PlayStation 5 + 2 ovladače',
      slug: 'sony-playstation-5',
      description: 'PS5 disk edition, koupeno 2022, funguje bezchybně. V balení 2 DualSense ovladače (oba plně funkční) + 3 hry (Spider-Man, GT7, Horizon). Důvod prodeje: stěhování do zahraničí.',
      category: 'Elektronika',
      condition: 'GOOD',
      price: 11000,
      location: 'Ostrava',
      images: ['https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=80'],
      sellerId: sellers[2].id,
      deliveryMethods: ['PERSONAL', 'POST'],
      allowsOffers: false,
    },
    {
      title: 'Zimní bunda Patagonia Nano Puff – dámská M',
      slug: 'patagonia-nano-puff-damska',
      description: 'Originální Patagonia Nano Puff, dámská velikost M, barva tmavomodrá. Bunda je v perfektním stavu, nošena 1 sezonu. Lehká, teplá, vhodná i jako středová vrstva.',
      category: 'Móda',
      condition: 'VERY_GOOD',
      price: 2200,
      location: 'Praha 5',
      images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80'],
      sellerId: sellers[0].id,
      deliveryMethods: ['PERSONAL', 'ZASILKOVNA', 'POST'],
      allowsOffers: true,
    },
    {
      title: 'MacBook Air M2 – 8/256GB, záruka do 2025',
      slug: 'macbook-air-m2',
      description: 'MacBook Air M2 2022, barva Midnight, 8GB RAM, 256GB SSD. Koupeno v CZC, záruka platí do listopadu 2025. Výkon naprosto perfektní, baterie 97%. Prodávám kvůli přechodu na Pro verzi.',
      category: 'Elektronika',
      condition: 'LIKE_NEW',
      price: 28500,
      originalPrice: 34990,
      location: 'Praha 1',
      images: ['https://images.unsplash.com/photo-1611186871525-c5edd9c7bbad?w=400&q=80'],
      sellerId: sellers[1].id,
      deliveryMethods: ['PERSONAL', 'ZASILKOVNA'],
      allowsOffers: true,
    },
    {
      title: 'Rohová sedací souprava IKEA KIVIK',
      slug: 'rohova-souprava-ikea-kivik',
      description: 'IKEA KIVIK rohová sedačka, šedý potah (Orrsta), rozměry cca 290x190cm. Koupeno 2021, stav velmi dobrý, bez poškození. Možnost demontáže a odvozu vlastním autem. Nutné odebrat osobně v Plzni.',
      category: 'Dům a zahrada',
      condition: 'GOOD',
      price: 4900,
      location: 'Plzeň',
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'],
      sellerId: sellers[2].id,
      deliveryMethods: ['PERSONAL'],
      allowsOffers: true,
    },
    {
      title: 'Nike Air Max 90 – vel. 42, nové',
      slug: 'nike-air-max-90-42',
      description: 'Nové Nike Air Max 90, velikost EUR 42 / US 8.5, bílé s černými detaily. Zakoupeny jako dárek, ale nesedí velikost. Nikdy nenošené, originální krabice.',
      category: 'Móda',
      condition: 'NEW',
      price: 1800,
      originalPrice: 2990,
      location: 'Brno-Královo Pole',
      images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'],
      sellerId: sellers[0].id,
      deliveryMethods: ['PERSONAL', 'ZASILKOVNA', 'POST'],
      allowsOffers: false,
    },
    {
      title: 'Xiaomi Robot Vacuum X10+ – robot vysavač',
      slug: 'xiaomi-robot-vacuum-x10',
      description: 'Xiaomi Robot Vacuum X10+, automatická čistící stanice, mopování + vysávání. Koupeno před rokem, plně funkční, čistá základna. Ideální pro byty do 120m². Prodej kvůli stěhování do menšího.',
      category: 'Dům a zahrada',
      condition: 'GOOD',
      price: 3200,
      originalPrice: 8990,
      location: 'Praha 3',
      images: ['https://images.unsplash.com/photo-1589802829985-817e51171b92?w=400&q=80'],
      sellerId: sellers[1].id,
      deliveryMethods: ['PERSONAL', 'POST'],
      allowsOffers: true,
    },
  ]

  let created = 0
  for (const listing of listings) {
    try {
      await prisma.listing.upsert({
        where: { slug: listing.slug },
        update: {},
        create: {
          ...listing,
          price: listing.price as any,
          originalPrice: listing.originalPrice as any,
          status: 'PUBLISHED' as any,
          views: Math.floor(Math.random() * 200) + 10,
          thumbnailUrl: listing.images[0],
        }
      })
      created++
    } catch (e: any) {
      console.error('Skip listing:', listing.slug, e.message?.slice(0, 80))
    }
  }

  console.log(`Created/skipped ${created}/${listings.length} listings`)
  console.log('Seed done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

