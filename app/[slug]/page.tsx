import { notFound } from "next/navigation";
import { getSchoolBySubdomain as getSchoolBySlug } from "@/lib/db/school";
import { prisma } from "@/lib/prisma";

import HeroSchool from "@/components/landing/hero-school";
import Footer from "@/components/landing/footer";
import Features from "@/components/landing/features";
import Steps from "@/components/landing/steps";
import Testimonials from "@/components/landing/testimonials";
import Faq from "@/components/landing/faq";
import SchoolUpdates from "@/components/landing/school-updates";
import CategoryGrid from "@/components/categories/category-grid";

export default async function SchoolLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  if (slug === "www" || slug === "test-explorer") {
    return notFound();
  }

  const schoolData = await getSchoolBySlug(slug);

  if (!schoolData) {
    return notFound();
  }

  const categories = await prisma.categories.findMany({
    orderBy: { order_index: 'asc' }
  });

  const schoolTestimonials = await prisma.school_testimonials.findMany({
    where: { organization_id: schoolData.id },
    orderBy: { created_at: 'desc' }
  });

  return (
    <main className="flex flex-col min-h-screen">
      <HeroSchool school={schoolData} />
      <SchoolUpdates school={schoolData} />
      <CategoryGrid categories={categories}/>
      <Steps />
      <Features />
      {schoolTestimonials.length > 0 && <Testimonials data={schoolTestimonials} />}
      <Faq />
      <Footer school={schoolData} /> 
    </main>
  );
}
