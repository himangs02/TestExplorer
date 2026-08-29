const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const [profilesCount, usersCount, orgs] = await Promise.all([
    prisma.profiles.count(),
    prisma.users.count(),
    prisma.organizations.findMany({ select: { id: true, name: true, slug: true } })
  ]);
  console.log(`Total Profiles in DB: ${profilesCount}`);
  console.log(`Total Users in DB: ${usersCount}`);
  
  for (const org of orgs) {
    const count = await prisma.profiles.count({ where: { organization_id: org.id } });
    console.log(`- ${org.name} (${org.slug}): ${count} students`);
  }
  const individual = await prisma.profiles.count({ where: { organization_id: null, role: 'student' } });
  console.log(`- Individual Students: ${individual}`);
}

main().catch(console.error).finally(()=>prisma.$disconnect());
