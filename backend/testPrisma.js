const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('Users:', users);
  } catch (error) {
    console.error('Erreur de connexion Prisma:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
