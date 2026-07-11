const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env' });

// We use hardcoded Supabase keys since they are verified
const supabaseUrl = 'https://ykbehghnwjciwwlxipcw.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_KEY';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const prisma = new PrismaClient();

async function fetchAll(table) {
  let allData = [];
  let from = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .range(from, from + limit - 1);
      
    if (error) {
      console.error(`Error fetching ${table}:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      break;
    }
    
    allData = allData.concat(data);
    
    if (data.length < limit) {
      break;
    }
    
    from += limit;
  }
  
  return allData;
}

async function migrateData() {
  try {
    console.log("Starting full data extraction from Supabase to MySQL...");

    // 1. Disable Foreign Key Checks
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');

    const tables = [
      "categories",
      "organizations",
      "courses",
      "subjects",
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
      "blogs"
    ];

    // 2. Clear target tables to prevent duplicate entries
    for (const table of tables.slice().reverse()) {
      console.log(`Clearing MySQL table: ${table}`);
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${table};`);
    }

    // 3. Extract and Insert Data
    for (const table of tables) {
      console.log(`\nExtracting ${table} from Supabase...`);
      const data = await fetchAll(table);
      console.log(`Found ${data.length} records in ${table}.`);
      
      if (data.length > 0) {
        console.log(`Inserting ${data.length} records into MySQL ${table}...`);
        
        // Prisma createMany has a limit on the number of records it can insert at once in MySQL
        // We chunk it to 1000 rows at a time
        const chunkSize = 1000;
        for (let i = 0; i < data.length; i += chunkSize) {
          const chunk = data.slice(i, i + chunkSize);
          await prisma[table].createMany({
            data: chunk,
            skipDuplicates: true
          });
        }
        
        console.log(`Successfully migrated ${table}.`);
      }
    }

    // 4. Re-enable Foreign Key Checks
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

    console.log("\n🎉 FULL DATA MIGRATION COMPLETE! 🎉");

  } catch (error) {
    console.error("Migration failed:", error);
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
  } finally {
    await prisma.$disconnect();
  }
}

migrateData();
