import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Secret key to prevent unauthorized access
const SEED_SECRET = 'vendly-seed-2026'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const password = await bcrypt.hash('heslo123', 10)

    const sellers = await Promise.all([
      prisma.user.upsert({
        where: { email: 'martin.novak@vendly.test' },
        update: {},
        create: { email: 'martin.novak@vendly.test', password, name: 'Martin Novák', nickname: 'martin_novak', trustScore: 95, totalSales: 23, role: 'SELLER', status: 'ACTIVE' }
      }),
      prisma.user.upsert({
        where: { email: 'jana.kral@vendly.test' },
        update: {},
        create: { email: 'jana.kral@vendly.test', password, name: 'Jana Králová', nickname: 'jana_kralova', trustScore: 88, totalSales: 11, role: 'SELLER', status: 'ACTIVE' }
      }),
      prisma.user.upsert({
        where: { email: 'petr.svoboda@vendly.test' },
        update: {},
        create: { email: 'petr.svoboda@vendly.test', password, name: 'Petr Svoboda', nickname: 'petr_svoboda', trustScore: 72, totalSales: 5, role: 'SELLER', status: 'ACTIVE' }
      }),
    ])

    const listingsData = [
      { title: 'iPhone 13 Pro 256GB – skvělý stav', slug: 'iphone-13-pro-256gb', description: 'iPhone 13 Pro v barvě Sierra Blue, 256GB. Baterie 91%. Nekouřím, zvířata nemám.', category: 'Elektronika', condition: 'VERY_GOOD', price: '15990', location: 'Praha 2', images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&q=80'], deliveryMethods: ['PERSONAL', 'ZASILKOVNA'], allowsOffers: true, sellerId: sellers[0].id },
      { title: 'Trek Marlin 7 2022 – horské kolo vel. L', slug: 'trek-marlin-7-2022', description: 'Horské kolo Trek Marlin 7, velikost L. Najeto cca 800 km, servisováno.', category: 'Cyklo', condition: 'GOOD', price: '8500', location: 'Brno-střed', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'], deliveryMethods: ['PERSONAL'], allowsOffers: true, sellerId: sellers[1].id },
      { title: 'Sony PlayStation 5 + 2 ovladače', slug: 'sony-playstation-5', description: 'PS5 disk edition, 2 DualSense ovladače + 3 hry. Stav výborný.', category: 'Elektronika', condition: 'GOOD', price: '11000', location: 'Ostrava', images: ['https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&q=80'], deliveryMethods: ['PERSONAL', 'POST'], allowsOffers: false, sellerId: sellers[2].id },
      { title: 'Zimní bunda Patagonia Nano Puff – dámská M', slug: 'patagonia-nano-puff-damska', description: 'Originální Patagonia Nano Puff, dámská M, tmavomodrá. Nošena 1 sezonu.', category: 'Móda', condition: 'VERY_GOOD', price: '2200', location: 'Praha 5', images: ['https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&q=80'], deliveryMethods: ['PERSONAL', 'ZASILKOVNA', 'POST'], allowsOffers: true, sellerId: sellers[0].id },
      { title: 'MacBook Air M2 – 8/256GB', slug: 'macbook-air-m2', description: 'MacBook Air M2 2022, Midnight, 8GB/256GB. Baterie 97%, záruka do 11/2025.', category: 'Elektronika', condition: 'LIKE_NEW', price: '28500', location: 'Praha 1', images: ['https://images.unsplash.com/photo-1611186871525-c5edd9c7bbad?w=400&q=80'], deliveryMethods: ['PERSONAL', 'ZASILKOVNA'], allowsOffers: true, sellerId: sellers[1].id },
      { title: 'Rohová sedačka IKEA KIVIK – šedá', slug: 'ikea-kivik-rohova', description: 'IKEA KIVIK rohová sedačka, šedý potah, 290x190cm. Koupeno 2021.', category: 'Dům a zahrada', condition: 'GOOD', price: '4900', location: 'Plzeň', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'], deliveryMethods: ['PERSONAL'], allowsOffers: true, sellerId: sellers[2].id },
      { title: 'Nike Air Max 90 – vel. 42, nové', slug: 'nike-air-max-90-42', description: 'Nové Nike Air Max 90, vel. 42, bílé s černými detaily. Originální krabice.', category: 'Móda', condition: 'NEW', price: '1800', location: 'Brno', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'], deliveryMethods: ['PERSONAL', 'ZASILKOVNA', 'POST'], allowsOffers: false, sellerId: sellers[0].id },
      { title: 'Xiaomi Robot Vacuum X10+', slug: 'xiaomi-robot-vacuum-x10', description: 'Xiaomi Robot Vacuum X10+, automatická čistící stanice. Plně funkční.', category: 'Dům a zahrada', condition: 'GOOD', price: '3200', location: 'Praha 3', images: ['https://images.unsplash.com/photo-1589802829985-817e51171b92?w=400&q=80'], deliveryMethods: ['PERSONAL', 'POST'], allowsOffers: true, sellerId: sellers[1].id },
    ]

    let created = 0
    for (const l of listingsData) {
      try {
        await prisma.listing.upsert({
          where: { slug: l.slug },
          update: {},
          create: { title: l.title, slug: l.slug, description: l.description, category: l.category, condition: l.condition as any, price: l.price as any, location: l.location, images: l.images, deliveryMethods: l.deliveryMethods, allowsOffers: l.allowsOffers, status: "PUBLISHED" as any, thumbnailUrl: l.images[0], views: Math.floor(Math.random() * 200) + 10, seller: { connect: { id: l.sellerId } } }
        })
        created++
      } catch (e: any) {
        console.error('Listing skip:', l.slug, e.message?.slice(0, 60))
      }
    }

    return NextResponse.json({ success: true, sellers: sellers.length, listings: created })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}


