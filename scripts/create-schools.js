const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

function getValidImageUrl(url) {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('drive.google.com')) {
      const pathMatch = urlObj.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
      const idParam = urlObj.searchParams.get('id');
      const fileId = pathMatch ? pathMatch[1] : idParam;
      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}`;
      }
    }
  } catch (e) {}
  return url;
}

const schoolsToCreate = [
  {
    name: "CFI Model school, Varanasi",
    slug: "cfmsv",
    principalName: "Anshula mangeshkar",
    email: "71900@cbseshiksha.com",
    principalPhoto: "https://drive.google.com/open?id=1aTw3K4Jq-ZkNCWvUV2m9z0sbOR2-7K8N",
    logo: "https://drive.google.com/open?id=1M823JgntKSnqFOk1DhJTiwcblr2QTen2",
    tagline: "A better future and a safe future"
  },
  {
    name: "St. Joseph's school Sindhora varanasi",
    slug: "sjssv",
    principalName: "Dr. Ranu Lahiri",
    email: "stjosephsindhora@gmail.com",
    principalPhoto: "https://drive.google.com/open?id=1Dt0OniDlg29qRiLFU-HCSEB-fYmgXR8T",
    logo: "https://drive.google.com/open?id=1qQcBDWeYEggfL3WRP1qBJLDb2m3Xc7Qn",
    tagline: "Truth is beauty"
  },
  {
    name: "Pooja Modern school, noorwala Panipat",
    slug: "pmsnp",
    principalName: "Mrs Lalita Rani",
    email: "poojaschoolpnp@gmail.com",
    principalPhoto: "https://drive.google.com/open?id=1ZhQkvWK2-leUGOWawpdV2fbVYadKo1-7",
    logo: "https://drive.google.com/open?id=18JlYPO-ZWpkXs1l7rBjSrVJ9A6FEo2vQ",
    tagline: "TRUTH, TRUST, TRIUMPH"
  },
  {
    name: "Shastri Memorial Senior Secondary School, Haripur, Hiranagar, Kathua",
    slug: "smssshhk",
    principalName: "Naresh Sharma",
    email: "nareshchander626@gmail.com",
    principalPhoto: "https://drive.google.com/open?id=17YR_wCsl9mhwlF3Ky9oWq6e3NYAQ7jHh",
    logo: "https://drive.google.com/open?id=1qxtbNmnUiQvPm0AFV4AT_PVvmMHSPTDw",
    tagline: "A place where dreams are nurtured and futures are shaped."
  }
];

async function run() {
  const connectionUrl = process.env.LOCAL_DATABASE_URL || process.env.DATABASE_URL || "mysql://root:password@localhost:3306/testexp";
  console.log("Connecting to database...");
  const connection = await mysql.createConnection(connectionUrl);

  try {
    for (const school of schoolsToCreate) {
      console.log(`\nProcessing: ${school.name}`);
      const slug = school.slug.toLowerCase().trim();
      const email = school.email.toLowerCase().trim();
      const adminName = school.principalName;
      const password = 'admin123';
      const logoUrl = getValidImageUrl(school.logo);
      const principalImage = getValidImageUrl(school.principalPhoto);
      const principalMessage = school.tagline;

      // Check if org already exists
      const [existingOrgs] = await connection.execute('SELECT * FROM organizations WHERE slug = ? OR name = ?', [slug, school.name]);
      let orgId;
      if (existingOrgs.length > 0) {
        console.log(`Org ${school.name} already exists with id: ${existingOrgs[0].id}, slug: ${existingOrgs[0].slug}`);
        orgId = existingOrgs[0].id;
        await connection.execute(
          'UPDATE organizations SET logo_url = ?, principal_image = ?, principal_message = ? WHERE id = ?',
          [logoUrl, principalImage, principalMessage, orgId]
        );
      } else {
        orgId = crypto.randomUUID();
        await connection.execute(
          'INSERT INTO organizations (id, name, slug, welcome_message, logo_url, principal_image, principal_message, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
          [orgId, school.name, slug, `Welcome to ${school.name}`, logoUrl, principalImage, principalMessage]
        );
        console.log(`Created organization ${school.name} with slug ${slug} (ID: ${orgId})`);
      }

      // Check if user exists
      const [existingUsers] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
      const hashedPassword = await bcrypt.hash(password, 10);
      let userId;

      if (existingUsers.length > 0) {
        console.log(`User ${email} already exists with id: ${existingUsers[0].id}. Updating password...`);
        userId = existingUsers[0].id;
        await connection.execute(
          'UPDATE users SET password = ?, name = ?, role = "school_admin" WHERE id = ?',
          [hashedPassword, adminName, userId]
        );
      } else {
        userId = crypto.randomUUID();
        await connection.execute(
          'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, "school_admin")',
          [userId, adminName, email, hashedPassword]
        );
        console.log(`Created user ${email} (ID: ${userId})`);
      }

      // Upsert profile
      const [existingProfiles] = await connection.execute('SELECT * FROM profiles WHERE id = ?', [userId]);
      if (existingProfiles.length > 0) {
        await connection.execute(
          'UPDATE profiles SET full_name = ?, role = "school_admin", organization_id = ?, updated_at = NOW() WHERE id = ?',
          [adminName, orgId, userId]
        );
        console.log(`Updated profile for ${userId}`);
      } else {
        await connection.execute(
          'INSERT INTO profiles (id, email, full_name, role, organization_id, created_at, updated_at) VALUES (?, ?, ?, "school_admin", ?, NOW(), NOW())',
          [userId, email, adminName, orgId]
        );
        console.log(`Created profile for ${userId}`);
      }
    }

    console.log("\nALL LOCAL SCHOOLS CREATED SUCCESSFULLY!");
    const [finalOrgs] = await connection.execute('SELECT id, name, slug FROM organizations');
    console.log("Current organizations in DB:", finalOrgs);
  } finally {
    await connection.end();
  }
}

run().catch(err => {
  console.error("Error executing script:", err);
  process.exit(1);
});
