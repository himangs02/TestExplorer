'use client';

import { useRef } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

// Helper function to handle Google Drive links
const getValidImageUrl = (url: string) => {
  if (!url) return '';
  if (!url.includes('drive.google.com')) return url;
  const fileId = url.match(/\/d\/([^/]+)/)?.[1] || url.match(/id=([^&]+)/)?.[1];
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url;
};

export default function Testimonials({ data }: { data?: any[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const defaultTestimonials = [
    {
      name: "Manish Kumar",
      role: "Student, DPS Patna",
      score: "AIR 1,240 (JEE Main)",
      text: "I solved MCQs on the platform for hardly one month but in a consistent manner. The percentile predictor was 99% accurate!",
      rating: 5,
      image: "/testimonials/manish.jpg",
      accent: "border-t-blue-600"
    },
    {
      name: "Priya Sharma",
      role: "Student, KV Delhi",
      score: "680/720 (NEET-UG)",
      text: "The analytics helped me find my weak areas in Physics Mechanics instantly. The NTA-like interface made me completely stress-free on exam day.",
      rating: 5,
      image: "/testimonials/priya.jpg",
      accent: "border-t-emerald-500"
    },
    {
      name: "Varun S",
      role: "Student, APS Warangal",
      score: "99.4 %ile (CUET)",
      text: "The platform is precisely mapped with CUET conducted by NTA. The subject-wise mock tests and instant answer explanations are unbeatable.",
      rating: 5,
      image: "/testimonials/varun.jpg",
      accent: "border-t-purple-600"
    },
    {
      name: "S.K Malhotra",
      role: "Director, SKM Academy",
      score: "Educator Partner",
      text: "I have been running coaching successfully for more than 2 decades. Test Explorer is by far the most reliable mock test platform for my batches.",
      rating: 5,
      image: "/testimonials/sk_malhotra.jpg",
      accent: "border-t-amber-500"
    },
    {
      name: "Ananya Roy",
      role: "Student, DPS RK Puram",
      score: "AIR 890 (NEET-UG)",
      text: "The chapter-wise breakdown and speed analytics helped me shave off 20 minutes from my Biology paper. Truly a game changer for serious preparation.",
      rating: 5,
      image: "/testimonials/priya.jpg",
      accent: "border-t-teal-500"
    },
    {
      name: "Rohan Mehta",
      role: "Student, Allen Kota",
      score: "99.8 %ile (JEE Adv)",
      text: "Attempting mock tests with the exact CBT exam interface and realistic timer reduced my exam day anxiety to zero. Highly recommended!",
      rating: 5,
      image: "/testimonials/manish.jpg",
      accent: "border-t-rose-500"
    }
  ];

  const fallbackAvatars = [
    "/testimonials/manish.jpg",
    "/testimonials/priya.jpg",
    "/testimonials/varun.jpg",
    "/testimonials/sk_malhotra.jpg",
    "/testimonials/priya.jpg",
    "/testimonials/manish.jpg"
  ];

  const accents = [
    "border-t-blue-600",
    "border-t-emerald-500",
    "border-t-purple-600",
    "border-t-amber-500",
    "border-t-teal-500",
    "border-t-rose-500"
  ];

  const rawTestimonials = data && data.length > 0
    ? data.map((t, index) => ({
      name: t.student_name,
      role: t.course_name,
      score: "Verified Student",
      text: t.message,
      rating: 5,
      image: getValidImageUrl(t.student_image) || fallbackAvatars[index % fallbackAvatars.length],
      accent: accents[index % accents.length]
    }))
    : defaultTestimonials;

  // Duplicate for seamless continuous infinite marquee
  const marqueeItems = [...rawTestimonials, ...rawTestimonials];

  const handleManualScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 380;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-slate-50/60 border-t border-b border-gray-100 overflow-hidden relative">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
              Social Proof & Success Stories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              What Our Students Say
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleManualScroll('left')}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-xs cursor-pointer active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleManualScroll('right')}
              className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center transition-colors shadow-xs cursor-pointer active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* Infinite Auto-Rotating Marquee Track with Edge Gradients */}
      <div className="relative w-full overflow-hidden">
        
        {/* Left & Right Soft Fade Gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-slate-50/90 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-slate-50/90 to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-none py-2"
        >
          <div className="animate-marquee-infinite flex gap-6 px-4 hover:[animation-play-state:paused]">
            {marqueeItems.map((t, i) => (
              <div
                key={i}
                className="w-[300px] sm:w-[350px] md:w-[380px] shrink-0"
              >
                <div
                  className={`h-full bg-white rounded-3xl p-6 border border-gray-200/90 ${t.accent} border-t-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer`}
                >
                  <div>
                    {/* Top: Student Profile & Stars */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={t.image}
                          alt={t.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100 shadow-2xs shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                          }}
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-gray-950 leading-tight truncate">{t.name}</h3>
                          <p className="text-[11px] text-gray-500 font-medium truncate">{t.role}</p>
                        </div>
                      </div>

                      {/* 5 Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400 shrink-0">
                        {[...Array(t.rating || 5)].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>

                    {/* Quote Text */}
                    <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed italic line-clamp-4">
                      "{t.text}"
                    </p>
                  </div>

                  {/* Bottom Badge */}
                  <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400">
                    <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{t.score}</span>
                    <span>Verified Aspirant</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </section>
  );
}
