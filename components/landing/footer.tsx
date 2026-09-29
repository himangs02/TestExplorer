'use client';

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Heart, GraduationCap, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

export default function Footer({ school }: { school?: any }) {
  const brandName = school ? school.name : "Test Explorer";
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white pt-12 sm:pt-16 pb-10 mt-6 sm:mt-10 border-t border-slate-800/80 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-48 bg-blue-600/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* ================= TOP CTA BANNER ================= */}
        <div className="rounded-3xl bg-linear-to-r from-slate-900 via-blue-950/70 to-slate-900 border border-slate-800 p-6 sm:p-10 mb-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  Start Your Preparation Today
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">
                Ready to take the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">next step?</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-md leading-relaxed">
                Join thousands of students using {brandName}. Start your free practice session today and unlock AI-powered rank predictions.
              </p>
            </div>

            {/* Right: Newsletter Input & Live Stats */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    suppressHydrationWarning
                    className="w-full bg-slate-900 border border-slate-700/80 text-white text-xs sm:text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 placeholder-slate-500"
                  />
                </div>
                <button 
                  type="submit"
                  suppressHydrationWarning
                  className="bg-linear-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs sm:text-sm px-6 py-3 rounded-xl font-black transition-all shrink-0 cursor-pointer shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Platform Statistics Strip */}
              <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-800 text-center">
                <div>
                  <div className="text-lg sm:text-xl font-black text-white">50K+</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">Students</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-cyan-400">100+</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">Schools</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-blue-400">1.5K+</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">Colleges</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl font-black text-amber-400">5</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-semibold">Major Exams</div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= MIDDLE NAVIGATION LINKS ================= */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-8 border-b border-slate-900">
          
          {/* Col 1 & 2: Brand Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              {school && school.logo_url ? (
                <div className="w-9 h-9 rounded-xl overflow-hidden">
                  <img 
                    src={school.logo_url} 
                    alt={`${brandName} Logo`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  {school ? school.name.substring(0, 2).toUpperCase() : "TE"}
                </div>
              )}
              <span className="text-xl font-black tracking-tight text-white">
                Test<span className="text-blue-500">Explorer</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-sm font-medium">
              The smartest entrance exam preparation platform. AI-driven mock testing, accurate cutoff analytics, and All India rank forecasting.
            </p>

            <div className="flex gap-2.5">
              <Link href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors text-slate-400" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors text-slate-400" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-colors text-slate-400" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Col 3: Platform */}
          <div>
            <h3 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">Platform</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
              <li><Link href="/getting-started" className="hover:text-cyan-400 transition-colors">Getting Started</Link></li>
              <li><Link href="/library" className="hover:text-cyan-400 transition-colors">Open Library</Link></li>
              <li><Link href="/categories" className="hover:text-cyan-400 transition-colors">Exam Streams</Link></li>
              <li><Link href="/predictor" className="hover:text-cyan-400 transition-colors">Rank Predictor 2027</Link></li>
              <li><Link href="/login" className="hover:text-cyan-400 transition-colors">Student Login</Link></li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div>
            <h3 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
              <li><Link href="/blogs" className="hover:text-cyan-400 transition-colors">Exam Blog & Tips</Link></li>
              <li><Link href="/about" className="hover:text-cyan-400 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Contact Support</Link></li>
              <li><Link href="#features" className="hover:text-cyan-400 transition-colors">How It Works</Link></li>
            </ul>
          </div>

          {/* Col 5: Legal */}
          <div>
            <h3 className="font-bold text-sm text-white mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400 font-medium">
              <li><Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-cyan-400 transition-colors">Cookie Policy</Link></li>
              <li><Link href="/security" className="hover:text-cyan-400 transition-colors">Security Standards</Link></li>
            </ul>
          </div>

        </div>

        {/* ================= BOTTOM COPYRIGHT ================= */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
          <p>
            &copy; {currentYear} {brandName}. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> by Geeta Technical Hub
          </p>
        </div>

      </div>
    </footer>
  );
}
