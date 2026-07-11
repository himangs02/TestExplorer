const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe('ANALYZE TABLE users;');
  await prisma.$executeRawUnsafe('ANALYZE TABLE profiles;');
  console.log('Tables analyzed.');
}
main().finally(() => prisma.$disconnect());
