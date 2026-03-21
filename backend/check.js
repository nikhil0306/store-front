const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const stores = await prisma.store.findMany()
    console.log(JSON.stringify(stores, null, 2))
    await prisma.$disconnect()
}

main()