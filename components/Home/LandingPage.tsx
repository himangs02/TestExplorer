import { prisma } from "@/lib/prisma";

// Import your Hero variations
import HeroMain from "@/components/landing/hero-main";
import PredictorHeroSection from "@/components/landing/predictor-hero-section";

// Import Shared Content Sections
import Footer from "@/components/landing/footer";
import Features from "@/components/landing/features";
import Steps from "@/components/landing/steps";
import Testimonials from "@/components/landing/testimonials";
import Faq from "@/components/landing/faq";
import PracticeOptionsGrid from "@/components/landing/practice-options-grid";

export default async function LandingPage() {
  const categories = await prisma.categories.findMany({
    orderBy: { order_index: 'asc' }
  });

  return (
    <main className="flex flex-col min-h-screen">
      {/* === SECTION 1: DYNAMIC HERO === */}
      <HeroMain />

      {/* === SECTION 2: STREAM / COURSE CARDS === */}
      <PracticeOptionsGrid categories={categories} />

      {/* === SECTION 3: EXAM RANK & COLLEGE PREDICTOR === */}
      <PredictorHeroSection />

      <Steps />
      <Features />
      <Testimonials />
      <Faq />

      {/* === SECTION 4: FOOTER === */}
      <Footer school={null} /> 
    </main>
  );
}


