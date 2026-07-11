import { headers } from "next/headers";
import { getSchoolBySubdomain } from "@/lib/db/school";
import { prisma } from "@/lib/prisma";

// Import your Hero variations
import HeroMain from "@/components/landing/hero-main";
import HeroSchool from "@/components/landing/hero-school";

// Import Shared Content Sections
import Footer from "@/components/landing/footer";
import Features from "@/components/landing/features";
import Steps from "@/components/landing/steps";
import Testimonials from "@/components/landing/testimonials";
import Faq from "@/components/landing/faq";

// Import New Section
import SchoolUpdates from "@/components/landing/school-updates";
import CategoryGrid from "../categories/category-grid";

export default async function LandingPage() {
  // 1. Detect Subdomain Logic
  const headersList = await headers();
  const hostname = headersList.get("host") || "";
  let schoolData: any = null;

  const parts = hostname.split(".");
  let subdomain = null;

  if (hostname.includes("localhost")) {
    if (parts.length >= 2) subdomain = parts[0];
  } else {
    if (parts.length >= 3) subdomain = parts[0];
  }

  // 3. Fetch School Data
  if (subdomain && subdomain !== "www" && subdomain !== "test-explorer") {
    schoolData = await getSchoolBySubdomain(subdomain);
  }

  const categories = await prisma.categories.findMany({
    orderBy: { order_index: 'asc' }
  })

  let schoolTestimonials: any[] = [];

  if (schoolData) {
    const tData = await prisma.school_testimonials.findMany({
      where: { organization_id: schoolData.id },
      orderBy: { created_at: 'desc' }
    });
    if (tData) schoolTestimonials = tData;
  }

  return (
    <main className="flex flex-col min-h-screen">
      
      {/* === SECTION 1: DYNAMIC HERO === */}
      {schoolData ? (
        <HeroSchool school={schoolData} />
      ) : (
        <HeroMain />
      )}

      {/* === SECTION 1.5: SCHOOL SPECIFIC UPDATES (Only on School Page) === */}
      {schoolData && (
        <SchoolUpdates school={schoolData} />
      )}

      {/* === SECTION 2: SHARED CONTENT === */}
      <CategoryGrid categories={categories}/>
      <Steps />
      <Features />
      {schoolData ? (
        schoolTestimonials.length > 0 && <Testimonials data={schoolTestimonials} />
      ) : (
        <Testimonials />
      )}
      <Faq />

      {/* === SECTION 3: FOOTER === */}
      <Footer school={schoolData} /> 
    </main>
  );
}
