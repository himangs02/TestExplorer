import Link from "next/link";
import { ArrowRight, Play, Sparkles, TrendingUp, CheckCircle2, Award, Clock, Target, BarChart2, ShieldCheck } from "lucide-react";

export default async function HeroMain() {
  return (
    <section className="relative pt-8 sm:pt-12 md:pt-16 pb-12 md:pb-20 overflow-hidden bg-white">
      {/* Background Architectural Glow & Subtle Grid Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[650px] h-[450px] bg-gradient-to-bl from-blue-100/50 via-indigo-50/40 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-purple-100/40 via-blue-50/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ================= LEFT COLUMN: EDITORIAL CONTENT ================= */}
          <div className="lg:col-span-5 text-left flex flex-col justify-center">
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-200/80 rounded-full px-3.5 py-1.5 shadow-2xs mb-6 w-fit hover:scale-105 transition-transform cursor-default">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="text-xs font-bold text-blue-900 tracking-wide">
                #1 Platform for Entrance Exam Preparation
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-gray-950 mb-5 leading-[1.08]">
              Turn Your <br />
              Preparation Into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700">
                Real Possibilities.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-gray-600 mb-8 font-medium leading-relaxed max-w-lg">
              Unlimited mock tests, AI-driven analytics, and a community that actually helps you study.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8">
              <Link
                href="/signup"
                className="px-7 py-3.5 bg-blue-600 text-white rounded-full font-bold text-base hover:bg-blue-700 transition-all hover:scale-105 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 group"
              >
                <span>Start Practicing Free</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              <Link
                href="#features"
                className="px-6 py-3.5 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-base hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-700">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </div>
                <span>Watch Demo</span>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3.5 pt-3 border-t border-gray-100">
              <div className="flex -space-x-2.5 items-center">
                <img
                  src="/testimonials/manish.jpg"
                  alt="Student Manish"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs"
                />
                <img
                  src="/testimonials/priya.jpg"
                  alt="Student Priya"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs"
                />
                <img
                  src="/testimonials/varun.jpg"
                  alt="Student Varun"
                  className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-xs"
                />
                <div className="w-9 h-9 rounded-full border-2 border-white bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-[11px] flex items-center justify-center shadow-xs tracking-tighter">
                  +50k
                </div>
              </div>
              <div className="text-xs font-semibold text-gray-600 leading-snug">
                <span className="font-bold text-gray-950 block sm:inline">Trusted by 100+ Schools</span>
                <span className="text-gray-500"> & 50,000+ Aspirants</span>
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: PRODUCT DASHBOARD MOCKUP ================= */}
          <div className="lg:col-span-7 relative">
            
            {/* Playful Handwritten Tag */}
            <div className="hidden sm:flex absolute -top-7 left-6 sm:left-10 z-20 items-center gap-1.5 text-gray-700 text-xs font-bold font-mono tracking-tight transform -rotate-2 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/70 shadow-xs">
              <span>Practice • Predict • Perform</span>
              <span className="text-amber-600 text-sm">↳</span>
            </div>

            {/* Laptop / Browser Container Frame */}
            <div className="relative mx-auto rounded-2xl sm:rounded-3xl border border-gray-300/80 bg-gray-900 p-2 sm:p-2.5 shadow-2xl shadow-blue-950/20">
              
              {/* Window Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-900 rounded-t-xl text-gray-400 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div className="flex items-center gap-1.5 bg-gray-800/80 px-3 py-1 rounded-md text-[11px] text-gray-300 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  app.testexplorer.com/dashboard
                </div>
                <div className="w-8" />
              </div>

              {/* Window Inner Screen */}
              <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 text-slate-100 grid grid-cols-12 min-h-[380px] sm:min-h-[420px]">
                
                {/* Mini Sidebar */}
                <div className="hidden md:flex md:col-span-3 bg-slate-950/70 border-r border-slate-800/80 p-3.5 flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-6 px-1">
                      <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                        TE
                      </div>
                      <span className="text-xs font-bold text-white tracking-tight">TestExplorer</span>
                    </div>

                    <div className="space-y-1 text-[11px] font-medium text-slate-400">
                      <div className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white font-bold flex items-center gap-2">
                        <BarChart2 className="w-3.5 h-3.5" />
                        <span>Dashboard</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg hover:text-white flex items-center gap-2">
                        <Target className="w-3.5 h-3.5" />
                        <span>Mock Tests</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg hover:text-white flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Analytics</span>
                      </div>
                      <div className="px-2.5 py-1.5 rounded-lg hover:text-white flex items-center gap-2">
                        <Award className="w-3.5 h-3.5" />
                        <span>Rank Predictor</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-1 text-[11px] text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-medium text-slate-300">JEE Main 2027</span>
                  </div>
                </div>

                {/* Dashboard Main Workspace */}
                <div className="col-span-12 md:col-span-9 p-4 sm:p-5 bg-slate-900/90 flex flex-col justify-between gap-4">
                  
                  {/* Top Bar Greeting */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Good Morning, Student</span>
                        <span>☀️</span>
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400">
                        Consistency today, success tomorrow.
                      </div>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold">
                      Target: AIR &lt; 5,000
                    </div>
                  </div>

                  {/* 4 Key Metric Tiles */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    
                    {/* Progress */}
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-semibold mb-1">Your Progress</div>
                      <div className="flex items-center gap-2">
                        <div className="text-lg sm:text-xl font-black text-white">78%</div>
                        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin duration-3000" />
                      </div>
                      <div className="text-[9px] text-blue-400 font-medium mt-0.5">Mock Completed</div>
                    </div>

                    {/* Accuracy */}
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-semibold mb-1">Accuracy</div>
                      <div className="text-lg sm:text-xl font-black text-emerald-400">86%</div>
                      <div className="text-[9px] text-emerald-500 font-medium flex items-center gap-0.5 mt-0.5">
                        <span>↑ 12%</span> vs last week
                      </div>
                    </div>

                    {/* Predicted Rank */}
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-semibold mb-1">Predicted Rank</div>
                      <div className="text-lg sm:text-xl font-black text-amber-400">2,341</div>
                      <div className="text-[9px] text-emerald-400 font-medium flex items-center gap-0.5 mt-0.5">
                        <span>↑ 540 ranks</span>
                      </div>
                    </div>

                    {/* Time Spent */}
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 font-semibold mb-1">Time Spent</div>
                      <div className="text-lg sm:text-xl font-black text-cyan-400">42 hrs</div>
                      <div className="text-[9px] text-cyan-400 font-medium flex items-center gap-0.5 mt-0.5">
                        <span>↑ 18%</span> active study
                      </div>
                    </div>

                  </div>

                  {/* Bottom Insight & Performance Chart Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    
                    {/* AI Insights */}
                    <div className="sm:col-span-6 p-3.5 bg-linear-to-br from-indigo-950/50 to-slate-950/60 rounded-xl border border-indigo-900/40 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 mb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>AI Study Insights</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-snug">
                          High accuracy in <span className="text-white font-bold">Inorganic Chemistry</span>. Focus more on <span className="text-amber-300 font-bold">Physics Mechanics</span> to boost rank into top 1,500.
                        </p>
                      </div>
                      <div className="mt-2 text-[10px] text-indigo-400 font-bold hover:underline cursor-pointer">
                        View recommended questions →
                      </div>
                    </div>

                    {/* Activity Weekly Chart Simulation */}
                    <div className="sm:col-span-6 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 flex flex-col justify-between">
                      <div className="text-[10px] font-bold text-slate-400 mb-1 flex justify-between">
                        <span>Weekly Mock Score Velocity</span>
                        <span className="text-emerald-400">+24 pts</span>
                      </div>
                      {/* Bar Visualization */}
                      <div className="flex items-end justify-between h-14 pt-2 gap-1.5">
                        <div className="w-full bg-blue-900/60 rounded-t h-[40%]" title="Mon" />
                        <div className="w-full bg-blue-900/60 rounded-t h-[60%]" title="Tue" />
                        <div className="w-full bg-blue-900/60 rounded-t h-[50%]" title="Wed" />
                        <div className="w-full bg-blue-800/80 rounded-t h-[75%]" title="Thu" />
                        <div className="w-full bg-blue-600 rounded-t h-[90%]" title="Fri" />
                        <div className="w-full bg-cyan-400 rounded-t h-[100%]" title="Sat" />
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-500 mt-1 font-mono">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Floating Glass Pill Badge: Predicted Rank */}
            <div className="hidden sm:flex absolute -bottom-5 -left-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-gray-200/90 shadow-xl items-center gap-3 animate-float-slow">
              <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-500/30">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Predicted Rank</div>
                <div className="text-sm font-black text-gray-950 flex items-center gap-1.5">
                  <span>2,341</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    Top 0.8%
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Live Test Badge */}
            <div className="hidden sm:flex absolute -top-4 -right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2.5 border border-gray-200/90 shadow-xl items-center gap-2.5 animate-float-reverse">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs font-bold text-gray-800">
                <span className="text-blue-600 font-black">1,420+</span> students online now
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}