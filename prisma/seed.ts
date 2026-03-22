// Seed script to create initial admin user
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminEmail = 'admin@vendly.cz'
  const adminPassword = 'admin123456' // Change this in production!

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })

  if (!existingAdmin) {
    const hashedPassword = await hash(adminPassword, 12)
    
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Admin Vendly',
        role: 'ADMIN',
        status: 'ACTIVE',
        idVerified: true,
        trustScore: 100,
      }
    })

    console.log('✅ Admin user created:')
    console.log('   Email:', adminEmail)
    console.log('   Password:', adminPassword)
    console.log('   ⚠️  CHANGE PASSWORD AFTER FIRST LOGIN!')
  } else {
    console.log('ℹ️  Admin user already exists')
  }

  // Create demo user
  const demoEmail = 'demo@vendly.cz'
  const demoPassword = 'demo123456'

  const existingDemo = await prisma.user.findUnique({
    where: { email: demoEmail }
  })

  let demoUser
  if (!existingDemo) {
    const hashedDemoPassword = await hash(demoPassword, 12)
    
    demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        password: hashedDemoPassword,
        name: 'Demo Prodejce',
        role: 'SELLER',
        status: 'ACTIVE',
        idVerified: true,
        phoneVerified: true,
        phone: '+420 777 123 456',
        trustScore: 85.5,
        totalSales: 5,
      }
    })

    console.log('✅ Demo user created:')
    console.log('   Email:', demoEmail)
    console.log('   Password:', demoPassword)
  } else {
    demoUser = existingDemo
    console.log('ℹ️  Demo user already exists')
  }

  // Create demo listing
  const existingListing = await prisma.listing.findFirst({
    where: { 
      title: 'iPhone 14 Pro - Jako nový',
      sellerId: demoUser.id 
    }
  })

  if (!existingListing) {
    const demoListing = await prisma.listing.create({
      data: {
        title: 'iPhone 14 Pro - Jako nový',
        description: `iPhone 14 Pro v perfektním stavu - používán pouze 3 měsíce.\n\n🔹 128GB úložiště\n🔹 Space Black\n🔹 Kompletní balení + originální nabíječka\n🔹 Bezpečnostní sklo nalepené od začátku\n🔹 Baterie: 98% kapacita\n🔹 Žádné poškození, škrábance\n\nDůvod prodeje: přechod na Android.\nMožnost osobní prohlídky v Praze.\n\nVendly escrow = bezpečná platba pro obě strany! 🛡️`,
        category: 'Telefony a tablety',
        condition: 'LIKE_NEW',
        price: 24900,
        originalPrice: 31990,
        images: [
          'https://images.unsplash.com/photo-1592286634280-dabe6d6a3b63?w=500',
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500'
        ],
        thumbnailUrl: 'https://images.unsplash.com/photo-1592286634280-dabe6d6a3b63?w=300',
        location: 'Praha 5, Praha',
        latitude: 50.0747,
        longitude: 14.4012,
        status: 'ACTIVE',
        views: 47,
        sellerId: demoUser.id,
      }
    })

    console.log('✅ Demo listing created:')
    console.log('   Title:', demoListing.title)
    console.log('   Price:', demoListing.price + ' Kč')
    console.log('   Location:', demoListing.location)
  } else {
    console.log('ℹ️  Demo listing already exists')
  }

  console.log('✅ Seeding completed')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
