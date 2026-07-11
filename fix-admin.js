const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const profile = await prisma.profiles.findUnique({where: {id: 'dac21f57-0375-41f7-96cc-da3e48e20bd9'}});
  console.log('Profile:', profile);
  
  // Update it to super_admin to fix it for them!
  const updatedUser = await prisma.users.update({
    where: { id: 'dac21f57-0375-41f7-96cc-da3e48e20bd9' },
    data: { role: 'super_admin' }
  });
  
  const updatedProfile = await prisma.profiles.upsert({
    where: { id: 'dac21f57-0375-41f7-96cc-da3e48e20bd9' },
    update: { role: 'super_admin' },
    create: { 
      id: 'dac21f57-0375-41f7-96cc-da3e48e20bd9', 
      email: 'super@gmail.com',
      role: 'super_admin' 
    }
  });
  
  console.log("Updated Role in DB!");
}
main().catch(console.error).finally(()=>prisma.$disconnect());
