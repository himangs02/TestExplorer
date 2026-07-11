const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const subject = await prisma.subjects.findFirst({where: {title: 'Biology'}});
  if(!subject) {
      console.log('Biology subject not found');
      return;
  }
  console.log('Subject:', subject.id);
  const mocks = await prisma.exams.findMany({where: {subject_id: subject.id}});
  console.log('Mocks:', mocks);
  const prep = await prisma.prep_modules.findMany({where: {subject_id: subject.id}});
  console.log('Prep:', prep);
}
main().finally(()=>prisma.$disconnect());
