import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Delete corrupted listings
  const result = await prisma.listing.deleteMany({
    where: {
      OR: [
        { title: { contains: '??' } },
        { description: { contains: '??' } },
      ]
    }
  })

  console.log(`✅ Deleted ${result.count} corrupted listings`)

  // Delete corrupted users (except admin)
  const userResult = await prisma.user.deleteMany({
    where: {
      AND: [
        { role: { not: 'ADMIN' } },
        { name: { contains: '??' } }
      ]
    }
  })

  console.log(`✅ Deleted ${userResult.count} corrupted users`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
