const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectProfiles() {
  const allProfiles = await prisma.profiles.findMany();
  console.log(`Total profiles in DB: ${allProfiles.length}`);
  
  const byRole = {};
  for (const p of allProfiles) {
    const r = p.role || 'NULL';
    byRole[r] = (byRole[r] || 0) + 1;
  }
  console.log('Profiles by role:', byRole);

  const students = allProfiles.filter(p => p.role === 'student');
  console.log(`Total students: ${students.length}`);
  
  const publicStudents = students.filter(p => !p.organization_id);
  console.log(`Public (Individual) students (organization_id is null/empty): ${publicStudents.length}`);
  console.log('Sample public students:', publicStudents.slice(0, 10).map(s => ({ id: s.id, name: s.full_name, email: s.email, role: s.role, org: s.organization_id })));

  const nonStudentOrgs = allProfiles.filter(p => p.role !== 'student');
  console.log('Non-student profiles:', nonStudentOrgs.map(s => ({ id: s.id, name: s.full_name, email: s.email, role: s.role, org: s.organization_id })));
}

inspectProfiles().finally(() => prisma.$disconnect());
