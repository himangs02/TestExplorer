const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEmptyOrgIds() {
  console.log('Fixing empty organization_id strings in profiles...');
  const updatedOrgs = await prisma.$executeRawUnsafe(`UPDATE \`profiles\` SET \`organization_id\` = NULL WHERE \`organization_id\` = '' OR \`organization_id\` = 'NULL' OR \`organization_id\` = 'null';`);
  console.log(`Updated ${updatedOrgs} profiles organization_id to NULL.`);

  const updatedPhones = await prisma.$executeRawUnsafe(`UPDATE \`profiles\` SET \`phone\` = \`phone_no\` WHERE (\`phone\` IS NULL OR \`phone\` = '') AND \`phone_no\` IS NOT NULL AND \`phone_no\` != '';`);
  console.log(`Updated ${updatedPhones} profiles phone numbers.`);

  const publicStudents = await prisma.profiles.count({
    where: {
      role: 'student',
      OR: [{ organization_id: null }, { organization_id: '' }]
    }
  });
  console.log(`Total public (individual) students count now: ${publicStudents}`);
}

fixEmptyOrgIds().finally(() => prisma.$disconnect());
