const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Change provider to mysql and remove schemas array
schema = schema.replace(/provider\s*=\s*"postgresql"/, 'provider = "mysql"');
schema = schema.replace(/\s*schemas\s*=\s*\["auth",\s*"public"\]/, '');
schema = schema.replace(/\s*previewFeatures\s*=\s*\["multiSchema",\s*"partialIndexes"\]/, '');

// 2. Remove all models and enums with @@schema("auth")
const blocks = schema.split('\nmodel ').map((block, i) => i === 0 ? block : 'model ' + block);
const publicBlocks = blocks.filter(block => {
  if (!block.startsWith('model ')) return true;
  return !block.includes('@@schema("auth")');
});

let cleanSchema = publicBlocks.join('\n');

const enumBlocks = cleanSchema.split('\nenum ').map((block, i) => i === 0 ? block : 'enum ' + block);
const publicEnumBlocks = enumBlocks.filter(block => {
  if (!block.startsWith('enum ')) return true;
  return !block.includes('@@schema("auth")');
});
cleanSchema = publicEnumBlocks.join('\n');


// 3. Remove @@schema("public")
cleanSchema = cleanSchema.replace(/\s*@@schema\("public"\)/g, '');

// 4. Postgres -> MySQL type mappings
cleanSchema = cleanSchema.replace(/@db\.Uuid/g, '');
cleanSchema = cleanSchema.replace(/@db\.Timestamptz\(6\)/g, '');
cleanSchema = cleanSchema.replace(/@db\.Timestamp\(6\)/g, '');
cleanSchema = cleanSchema.replace(/@db\.Inet/g, '');
cleanSchema = cleanSchema.replace(/@default\(dbgenerated\("gen_random_uuid\(\)"\)\)/g, '@default(uuid())');
cleanSchema = cleanSchema.replace(/@default\(dbgenerated\("\(gen_random_uuid\(\)\)::text"\)\)/g, '@default(uuid())');
cleanSchema = cleanSchema.replace(/@default\(dbgenerated\("timezone\('utc'::text, now\(\)\)"\)\)/g, '@default(now())');
cleanSchema = cleanSchema.replace(/@default\(dbgenerated\("now\(\)"\)\)/g, '@default(now())');

// Fix String[] to Json and default([]) to default("[]")
cleanSchema = cleanSchema.replace(/String\[\]\s+@default\(\[\]\)/g, 'Json @default("[]")');
cleanSchema = cleanSchema.replace(/String\[\]/g, 'Json');
cleanSchema = cleanSchema.replace(/Json\s+@default\(\[\]\)/g, 'Json @default("[]")');
cleanSchema = cleanSchema.replace(/Json\?\s+@default\(\[\]\)/g, 'Json? @default("[]")');

// Replace any remaining Decimal arrays or unsupported things
cleanSchema = cleanSchema.replace(/Decimal\[\]/g, 'Json');

const nextAuthUserSchema = `
model users {
  id            String    @id @default(uuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          String?   @default("student")
  accounts      Account[]
  sessions      Session[]
  attempts      attempts[]
  exam_attempts exam_attempts[]
}

model Account {
  id                 String  @id @default(uuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user users @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         users     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
`;

cleanSchema += '\n' + nextAuthUserSchema;

fs.writeFileSync(schemaPath, cleanSchema);
console.log('Schema cleaned!');
