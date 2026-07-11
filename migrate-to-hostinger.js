const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

// Initialize local Prisma client
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.LOCAL_DATABASE_URL,
    },
  },
});

// Initialize remote Prisma client
const remotePrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function migrateData() {
  try {
    console.log("Starting data migration from Local MySQL to Hostinger MySQL...");

    // 1. Disable Foreign Key Checks on the Remote DB
    await remotePrisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

    const tables = [
      "users",
      "Account",
      "Session",
      "VerificationToken",
      "profiles",
      "categories",
      "organizations",
      "courses",
      "subjects",
      "student_enrollments",
      "prep_modules",
      "practice_tests",
      "mock_tests",
      "exams",
      "question_banks",
      "questions",
      "question_options",
      "tags",
      "mock_blueprints",
      "mock_blueprint_items",
      "mock_test_questions",
      "blogs",
      "attempts",
      "exam_attempts",
      "exam_rank_predictions",
      "contact_messages",
      "school_announcements",
      "school_testimonials"
    ];

    // 2. Clear target tables to prevent duplicate entries
    for (const table of tables.slice().reverse()) {
      console.log(`Clearing Hostinger table: ${table}`);
      await remotePrisma.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\`;`);
    }

    // 3. Extract and Insert Data
    for (const table of tables) {
      console.log(`\nExtracting ${table} from Local MySQL...`);
      // Since local MySQL has all data locally, we can just findMany without pagination for now, unless it's too large.
      // But just to be safe from memory issues, we'll fetch all. 
      const data = await localPrisma[table].findMany();
      console.log(`Found ${data.length} records in ${table}.`);
      
      if (data.length > 0) {
        console.log(`Inserting ${data.length} records into Hostinger ${table}...`);
        
        // Prisma createMany has a limit on the number of records it can insert at once in MySQL
        // We chunk it to 1000 rows at a time
        const chunkSize = 1000;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          await remotePrisma[table].createMany({
            data: chunk,
            skipDuplicates: true
          });
        }
        
        console.log(`Successfully migrated ${table}.`);
      }
    }

    // 4. Re-enable Foreign Key Checks
    await remotePrisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

    console.log("\n🎉 DATA MIGRATION TO HOSTINGER COMPLETE! 🎉");

  } catch (error) {
    console.error("Migration failed:", error);
    await remotePrisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  } finally {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
  }
}

migrateData();
