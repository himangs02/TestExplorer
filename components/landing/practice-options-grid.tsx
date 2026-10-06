import Link from 'next/link';
import { ArrowRight, Stethoscope, Cog, Scale, GraduationCap, ChevronLeft, ChevronRight, BookOpen, Layers } from 'lucide-react';

interface Category {
  id: string;
  title: string;
  bg_color?: string | null;
  slug?: string | null;
  description?: string | null;
}

// Preset themes for standard exams to guarantee high-end aesthetics
const EXAM_PRESET_THEMES: Record<string, {
  gradient: string;
  badgeBg: string;
  badgeText: string;
  icon: any;
  subtlePattern: string;
  tag: string;
  desc: string;
  shadowColor: string;
}> = {
  'neet': {
    gradient: 'from-blue-900 via-sky-900 to-slate-950',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
    badgeText: 'Medical Entrance',
    icon: Stethoscope,
    subtlePattern: 'medical',
    tag: 'NEET-UG',
    desc: 'Be ready for your medical dreams with real exam pattern mock tests & high-yield MCQs.',
    shadowColor: 'hover:shadow-blue-500/20'
  },
  'engineering': {
    gradient: 'from-amber-700 via-orange-800 to-slate-950',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
    badgeText: 'JEE Main & Adv',
    icon: Cog,
    subtlePattern: 'tech',
    tag: 'Engineering',
    desc: 'Practice with structured tests, advanced numerical problems and speed analytics.',
    shadowColor: 'hover:shadow-orange-500/20'
  },
  'clat': {
    gradient: 'from-indigo-900 via-purple-900 to-slate-950',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
    badgeText: 'Law Aptitude',
    icon: Scale,
    subtlePattern: 'law',
    tag: 'CLAT',
    desc: 'Sharpen your legal aptitude, logical reasoning, and English reading comprehension.',
    shadowColor: 'hover:shadow-purple-500/20'
  },
  'cuet': {
    gradient: 'from-emerald-900 via-teal-900 to-slate-950',
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
    badgeText: 'Central Universities',
    icon: GraduationCap,
    subtlePattern: 'university',
    tag: 'CUET',
    desc: 'Access domain-specific & general test mocks to maximize your top-college admissions.',
    shadowColor: 'hover:shadow-teal-500/20'
  }
};

const DEFAULT_FALLBACK_CARDS: Category[] = [
  {
    id: 'neet-ug',
    title: 'NEET-UG',
    description: 'Be ready for your medical dreams with real exam pattern mock tests.',
  },
  {
    id: 'engineering',
    title: 'Engineering (JEE Main & Advanced)',
    description: 'Practice with structured tests and detailed analytics.',
  },
  {
    id: 'clat',
    title: 'CLAT',
    description: 'Sharpen your legal aptitude with high-quality mock tests.',
  },
  {
    id: 'cuet',
    title: 'CUET',
    description: 'Access subject-wise tests and boost your university admissions chances.',
  }
];

export default function PracticeOptionsGrid({ categories }: { categories?: Category[] }) {
  const displayItems = (categories && categories.length > 0) ? categories : DEFAULT_FALLBACK_CARDS;

  const getThemeForCategory = (title: string, index: number) => {
    const t = title.toLowerCase();
    if (t.includes('neet') || t.includes('medical')) return EXAM_PRESET_THEMES['neet'];
    if (t.includes('jee') || t.includes('engineer') || t.includes('iit')) return EXAM_PRESET_THEMES['engineering'];
    if (t.includes('clat') || t.includes('law')) return EXAM_PRESET_THEMES['clat'];
    if (t.includes('cuet') || t.includes('arts') || t.includes('commerce') || t.includes('science')) return EXAM_PRESET_THEMES['cuet'];

    // Rotate across presets for any custom categories
    const keys = Object.keys(EXAM_PRESET_THEMES);
    return EXAM_PRESET_THEMES[keys[index % keys.length]];
  };

  return (
    <section className="py-10 sm:py-14 bg-white relative">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Section Header with Editorial Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              <span>Tailored Curriculums</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
              Explore Exam Categories
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Choose your goal and start practicing with curated mock tests.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Link
              href="/categories"
              prefetch={true}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 px-4 py-2 rounded-full transition-colors"
            >
              <span>View All Exams</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Large Premium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayItems.map((cat, idx) => {
            const theme = getThemeForCategory(cat.title, idx);
            const IconComp = theme.icon;
            const description = cat.description || theme.desc;

            return (
              <Link
                key={cat.id || idx}
                href={cat.id ? `/categories/${cat.id}` : '/categories'}
                prefetch={true}
                className="group relative block w-full outline-none"
              >
                <div
                  className={`
                    relative h-[280px] sm:h-[300px] p-6 rounded-3xl overflow-hidden
                    bg-gradient-to-br ${theme.gradient} text-white
                    border border-white/10 shadow-lg ${theme.shadowColor}
                    transition-all duration-300 ease-out flex flex-col justify-between
                    group-hover:-translate-y-2 group-hover:shadow-2xl
                  `}
                >
                  {/* Subtle Thematic Background Graphic / Glow */}
                  <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-white/5 blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-500" />
                  
                  {/* Background Icon Watermark */}
                  <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
                    <IconComp className="w-24 h-24 stroke-[1]" />
                  </div>

                  {/* Top: Icon + Badge */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${theme.badgeBg}`}>
                        {theme.badgeText}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white tracking-tight leading-snug group-hover:text-blue-100 transition-colors">
                      {cat.title}
                    </h3>
                    
                    <p className="text-xs text-slate-300/90 font-medium line-clamp-3 mt-2 leading-relaxed">
                      {description}
                    </p>
                  </div>

                  {/* Bottom: Button */}
                  <div className="relative z-10 pt-4 border-t border-white/10">
                    <div className="w-full py-2.5 px-4 rounded-full bg-white text-gray-950 font-bold text-xs flex items-center justify-between group-hover:bg-blue-50 transition-colors shadow-sm">
                      <span>Take Mock Test</span>
                      <div className="w-5 h-5 rounded-full bg-gray-100 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}


