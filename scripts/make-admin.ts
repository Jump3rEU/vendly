// Script to make a user admin
// Usage: npx ts-node scripts/make-admin.ts <email>

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  
  if (!email) {
    // List all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, status: true }
    })
    
    console.log('\n📋 All users:')
    console.table(users)
    
    console.log('\n💡 Usage: npx tsx scripts/make-admin.ts <email>')
    return
  }
  
  const user = await prisma.user.findUnique({
    where: { email }
  })
  
  if (!user) {
    console.error(`❌ User with email "${email}" not found`)
    return
  }
  
  if (user.role === 'ADMIN') {
    console.log(`✅ User ${email} is already an admin`)
    return
  }
  
  await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  })
  
  console.log(`✅ User ${email} is now an ADMIN!`)
  console.log(`🔗 Go to http://localhost:3000/admin to access the admin panel`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
