require('dotenv/config')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })

  const adapter = new PrismaPg(pool)

  const prisma = new PrismaClient({
    adapter,
    log: ['query', 'error', 'warn'],
  })

  try {
    console.log('1. Testing connection...')

    await prisma.$connect()
    console.log('✅ Connected to database')

    console.log('2. Checking available models...')
    const models = Object.getOwnPropertyNames(prisma)
      .filter((name) => !name.startsWith('$') && !name.startsWith('_'))
      .sort()
    console.log('Available in PrismaClient:', models)

    // adjust or comment these out if you don't have TestUser model:
    // const user = await prisma.testUser.create({
    //   data: { email: 'test' + Date.now() + '@example.com' },
    // })

    // const users = await prisma.testUser.findMany()
    // console.log('✅ Total users:', users.length)

    const migrations = await prisma.$queryRaw`
      SELECT * FROM _prisma_migrations
    `
    console.log('✅ Migrations count:', migrations.length)
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
    console.log('Disconnected')
    await pool.end()
  }
}

main()