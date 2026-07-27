import { prisma } from "@/lib/prisma";

// Import your Hero variations
import HeroMain from "@/components/landing/hero-main";

// Import Shared Content Sections
import Footer from "@/components/landing/footer";
import Features from "@/components/landing/features";
import Steps from "@/components/landing/steps";
import Testimonials from "@/components/landing/testimonials";
import Faq from "@/components/landing/faq";

// Import New Section
import CategoryGrid from "../categories/category-grid";

export default async function LandingPage() {
  const categories = await prisma.categories.findMany({
    orderBy: { order_index: 'asc' }
  })

  return (
    <main className="flex flex-col min-h-screen">
      {/* === SECTION 1: DYNAMIC HERO === */}
      <HeroMain />

      {/* === SECTION 2: SHARED CONTENT === */}
      <CategoryGrid categories={categories}/>
      <Steps />
      <Features />
      <Testimonials />
      <Faq />

      {/* === SECTION 3: FOOTER === */}
      <Footer school={null} /> 
    </main>
  );
}
