const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.event.updateMany({
    where: { updatedAt: null },
    data: { updatedAt: new Date() },
  });

  await prisma.user.updateMany({
    where: { updatedAt: null },
    data: { updatedAt: new Date() },
  });

  console.log('updatedAt fields fixed!');
}

main().finally(() => prisma.$disconnect());
