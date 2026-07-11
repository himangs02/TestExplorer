const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

const supabaseUrl = 'https://ykbehghnwjciwwlxipcw.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const remotePrisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

async function migrateUsers() {
  try {
    console.log("Starting users & profiles migration to Hostinger...");

    // 1. Disable FK checks
    await remotePrisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

    // 2. Clear tables
    console.log("Clearing existing users and profiles in Hostinger...");
    await remotePrisma.$executeRawUnsafe('TRUNCATE TABLE `profiles`;');
    await remotePrisma.$executeRawUnsafe('TRUNCATE TABLE `users`;');

    // 3. Extract all Auth Users
    let allUsers = [];
    let page = 1;
    while (true) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage: 1000
      });
      if (error) throw error;
      if (!data.users || data.users.length === 0) break;
      allUsers = allUsers.concat(data.users);
      page++;
    }

    console.log(`Found ${allUsers.length} auth users in Supabase.`);

    // 4. Map to Prisma `users`
    // Note: We cannot extract the encrypted password from Supabase API.
    // We will set a temporary default password for all users or leave it empty if you use Magic Links.
    // Assuming bcrypt hash for "Welcome@123" for safety so they can login if they need to.
    // But to avoid overwriting auth logic blindly, we just leave password empty if they use magic links, 
    // or just set a mock hash. For now, we will leave it as null, or set a dummy string so they must reset.
    const prismaUsers = allUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.full_name || u.email?.split('@')[0] || 'User',
      emailVerified: u.email_confirmed_at ? new Date(u.email_confirmed_at) : null,
      role: u.user_metadata?.role || 'student'
    }));

    if (prismaUsers.length > 0) {
      console.log(`Inserting ${prismaUsers.length} users into Hostinger...`);
      await remotePrisma.users.createMany({
        data: prismaUsers,
        skipDuplicates: true
      });
      console.log(`Successfully migrated users.`);
    }

    // 5. Extract Profiles
    let allProfiles = [];
    let from = 0;
    const limit = 1000;
    while (true) {
      const { data, error } = await supabase.from('profiles').select('*').range(from, from + limit - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      allProfiles = allProfiles.concat(data);
      if (data.length < limit) break;
      from += limit;
    }

    console.log(`Found ${allProfiles.length} profiles in Supabase.`);
    if (allProfiles.length > 0) {
      console.log(`Inserting ${allProfiles.length} profiles into Hostinger...`);
      
      // Ensure missing roles default to 'student'
      const sanitizedProfiles = allProfiles.map(p => ({
        ...p,
        role: p.role || 'student'
      }));

      await remotePrisma.profiles.createMany({
        data: sanitizedProfiles,
        skipDuplicates: true
      });
      console.log(`Successfully migrated profiles.`);
    }

    // 6. Re-enable FK checks
    await remotePrisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

    console.log("\n🎉 USERS & PROFILES MIGRATION COMPLETE! 🎉");

  } catch (error) {
    console.error("Migration failed:", error);
    await remotePrisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  } finally {
    await remotePrisma.$disconnect();
  }
}

migrateUsers();
