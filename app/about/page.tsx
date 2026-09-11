import { getCurrentSchool } from "@/lib/db/school";
import { Target, Zap, ShieldCheck, Heart, ArrowRight, Sparkles, Globe, Award } from "lucide-react";
import Link from "next/link";

export default async function AboutPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  // 1. Get Params
  const params = await searchParams;
  const isSuccess = params.success === "true";
  
  const school = await getCurrentSchool();
  const schoolName = school?.name || "Test Explorer";

  const values = [
    { title: "Student-First", desc: "Every feature we build starts with the question: 'How does this help a student learn?'", icon: <Heart className="w-6 h-6" />, color: "text-rose-500 bg-rose-50" },
    { title: "Radical Access", desc: "Premium testing infrastructure should be available to every school, regardless of budget.", icon: <Globe className="w-6 h-6" />, color: "text-blue-500 bg-blue-50" },
    { title: "Data Integrity", desc: "We provide honest, raw, and actionable insights to help educators make better decisions.", icon: <ShieldCheck className="w-6 h-6" />, color: "text-emerald-500 bg-emerald-50" },
    { title: "Speed to Feedback", desc: "Waiting days for results is over. We believe in instant gratification in learning.", icon: <Zap className="w-6 h-6" />, color: "text-amber-500 bg-amber-50" },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section - Matching Dashboard/Legal Style */}
      <section className="bg-slate-900 pt-20 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Discover our story
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            We are <span className="text-blue-500">{schoolName}</span>.
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto font-medium leading-relaxed">
            Revolutionizing the way the world prepares. We bridge the gap between classroom learning and exam-day confidence.
          </p>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <section className="py-8 px-6 -mt-10 relative z-20">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {[
            { label: "Active Students", value: "10K+", icon: <Target className="w-4 h-4" /> },
            { label: "Solved Questions", value: "500k+", icon: <Zap className="w-4 h-4" /> },
            { label: "Partner Schools", value: "100+", icon: <Award className="w-4 h-4" /> },
            { label: "Average Growth", value: "42%", icon: <Sparkles className="w-4 h-4" /> },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl shadow-lg shadow-slate-200/50 text-center border border-slate-100 group hover:border-blue-500 transition-all">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center mx-auto mb-2 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                {stat.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-0.5">{stat.value}</h3>
              <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-14 sm:py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden relative group max-w-md mx-auto">
                <div className="absolute inset-0 bg-blue-600 mix-blend-multiply opacity-20 group-hover:opacity-10 transition-opacity" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl animate-pulse">
                      <Target className="w-10 h-10 text-blue-600" />
                   </div>
                </div>
                {/* Visual Accent */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white shadow-lg max-w-[180px]">
                   <p className="text-xs font-black text-slate-900 uppercase mb-0.5">Our Reach</p>
                   <p className="text-slate-500 text-[10px] leading-tight">Empowering students across 15+ states with digital-first assessments.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                Our Mission: To make mastery <span className="text-blue-600">accessible.</span>
              </h2>
              <div className="space-y-4 text-slate-600 text-xs sm:text-sm leading-relaxed">
                <p>
                  Education has evolved, but assessment is often left behind. At <span className="font-bold text-slate-900">{schoolName}</span>, we realized that students were spending hours studying but had no way to measure their progress in real-time.
                </p>
                <p>
                  We built this platform to give schools the power to create professional, scalable mock tests in minutes. From automated grading to deep analytics, we provide the tools that turn guesswork into data-driven success.
                </p>
                <div className="pt-2">
                  <Link href="/contact" className="inline-flex items-center gap-1.5 text-blue-600 font-bold hover:gap-3 transition-all text-sm">
                    Partner with us <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Grid */}
      <section className="py-14 sm:py-16 px-6 bg-slate-50 rounded-3xl mx-4 mb-16">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">What we stand for</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-xl mx-auto">These principles guide every line of code we write and every school we onboard.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                <div className={`w-14 h-14 ${v.color} rounded-2xl flex items-center justify-center mb-6`}>
                  {v.icon}
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-3">{v.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-6xl mx-auto px-6 pb-24 text-center">
        <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 relative z-10">Join the education revolution.</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
             <Link href="/signup" className="px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-blue-50 transition-all">Get Started for Free</Link>
             <Link href="/contact" className="px-10 py-5 bg-blue-700 text-white font-black rounded-2xl border border-blue-500 hover:bg-blue-800 transition-all">Contact Sales</Link>
          </div>
        </div>
      </section>
    </div>
  );
}