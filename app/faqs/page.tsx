import FAQ from "@/components/landing/faq";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Test Explorer",
  description: "Detailed answers on how Test Explorer Rank & College Predictor 2027 works, AI analytics, mock tests, and exam preparation."
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <FAQ />
    </div>
  );
}
