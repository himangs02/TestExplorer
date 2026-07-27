const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orgs = await prisma.organizations.findMany();
  console.log(orgs.map(o => ({name: o.name, slug: o.slug, domain: o.domain})));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
