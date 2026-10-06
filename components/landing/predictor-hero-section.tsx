'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExamId } from '@/lib/predictor/types';
import { EXAM_CONFIGS, INDIAN_STATES } from '@/lib/predictor/data/exams-config';
import {
  Cpu,
  Rocket,
  HeartPulse,
  Landmark,
  Scale,
  ArrowRight,
  Target,
  ShieldCheck,
  Building,
  TrendingUp,
  Zap,
  Layers,
  Award,
  CheckCircle2
} from 'lucide-react';

const EXAM_THEMES: Record<
  ExamId,
  {
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    activeBorder: string;
    activeBg: string;
    badgeText: string;
    dotColor: string;
  }
> = {
  'jee-main': {
    icon: Cpu,
    gradient: 'from-blue-600 to-cyan-500',
    activeBorder: 'border-cyan-400',
    activeBg: 'bg-cyan-950/50 text-cyan-200 ring-1 ring-cyan-400/40',
    badgeText: 'Engineering',
    dotColor: 'bg-cyan-400'
  },
  'jee-advanced': {
    icon: Rocket,
    gradient: 'from-indigo-600 via-purple-600 to-pink-500',
    activeBorder: 'border-purple-400',
    activeBg: 'bg-purple-950/50 text-purple-200 ring-1 ring-purple-400/40',
    badgeText: 'IITs (Elite)',
    dotColor: 'bg-purple-400'
  },
  'neet': {
    icon: HeartPulse,
    gradient: 'from-emerald-500 to-teal-600',
    activeBorder: 'border-teal-400',
    activeBg: 'bg-teal-950/50 text-teal-200 ring-1 ring-teal-400/40',
    badgeText: 'Medical (MBBS)',
    dotColor: 'bg-teal-400'
  },
  'cuet': {
    icon: Landmark,
    gradient: 'from-purple-600 to-pink-500',
    activeBorder: 'border-pink-400',
    activeBg: 'bg-pink-950/50 text-pink-200 ring-1 ring-pink-400/40',
    badgeText: 'DU & Central Univ',
    dotColor: 'bg-pink-400'
  },
  'clat': {
    icon: Scale,
    gradient: 'from-amber-500 to-orange-600',
    activeBorder: 'border-amber-400',
    activeBg: 'bg-amber-950/50 text-amber-200 ring-1 ring-amber-400/40',
    badgeText: 'Law (NLUs)',
    dotColor: 'bg-amber-400'
  }
};

export default function PredictorHeroSection() {
  const router = useRouter();
  const [selectedExam, setSelectedExam] = useState<ExamId>('jee-main');
  const [scoreVal, setScoreVal] = useState('');
  const [inputMode, setInputMode] = useState<'marks' | 'percentile' | 'rank'>('marks');
  const [category, setCategory] = useState('OPEN');
  const [homeState, setHomeState] = useState('Delhi');
  const [preferredBranch, setPreferredBranch] = useState('All');

  const currentConfig = EXAM_CONFIGS[selectedExam];

  const handlePredictRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (scoreVal) queryParams.set('score', scoreVal);
    queryParams.set('mode', inputMode);
    queryParams.set('category', category);
    if (currentConfig.hasHomeState) queryParams.set('state', homeState);
    if (preferredBranch !== 'All') queryParams.set('branch', preferredBranch);

    router.push(`/predictor/${selectedExam}?${queryParams.toString()}`);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-slate-950 text-white relative overflow-hidden">
      {/* Glow / Ambient Lighting Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-full px-4 py-1.5 shadow-md mb-4">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-xs font-bold text-cyan-300 tracking-wider uppercase">
              Test Explorer Rank & College Predictor 2027
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            Find Your Rank.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-400 to-blue-400">
              Find Your College.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 font-medium leading-relaxed max-w-xl mx-auto">
            Enter your marks or rank and discover your estimated rank, admission chances, and colleges you may be eligible for.
          </p>
        </div>

        {/* Interactive Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          
          {/* LEFT: Stats & Authority Badges (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3.5">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center gap-4 group hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">5 Major Exams</div>
                <div className="text-xs text-slate-400 font-medium">JEE, NEET, CUET, CLAT & BITSAT</div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center gap-4 group hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">1,500+ Colleges</div>
                <div className="text-xs text-slate-400 font-medium">IITs, NITs, AIIMS, NLUs & Central Unis</div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center gap-4 group hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">Multi-Year Cutoffs</div>
                <div className="text-xs text-slate-400 font-medium">Verified historical counseling rounds</div>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center gap-4 group hover:border-slate-700 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white">JoSAA & MCC</div>
                <div className="text-xs text-slate-400 font-medium">Accurate AI allocation algorithm</div>
              </div>
            </div>
          </div>

          {/* RIGHT: High-Impact Predictor Panel (8 cols) */}
          <div className="lg:col-span-8 relative">
            
            {/* Playful Floating Tag */}
            <div className="hidden sm:flex absolute -top-5 right-6 z-20 items-center gap-1.5 text-xs font-bold font-mono tracking-tight bg-teal-950 text-teal-300 px-3 py-1 rounded-full border border-teal-500/30 shadow-md">
              <Zap className="w-3.5 h-3.5 text-teal-400" />
              <span>Get AI-powered College Predictions instantly!</span>
            </div>

            <div className="bg-slate-900/90 rounded-3xl border border-slate-800/90 p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
              
              {/* 1. Exam Selector Tabs */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Select Target Examination
                  </label>
                  <span className="text-[11px] font-semibold text-cyan-400">
                    {currentConfig.name} Selected
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {Object.values(EXAM_CONFIGS).map((exam) => {
                    const isSelected = selectedExam === exam.id;
                    const theme = EXAM_THEMES[exam.id];
                    const IconComponent = theme.icon;

                    return (
                      <button
                        key={exam.id}
                        type="button"
                        suppressHydrationWarning
                        onClick={() => {
                          setSelectedExam(exam.id);
                          if (!exam.supportedInputModes.includes(inputMode)) {
                            setInputMode(exam.supportedInputModes[0]);
                          }
                        }}
                        className={`p-2.5 sm:p-3 rounded-2xl border font-bold text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? `${theme.activeBg} ${theme.activeBorder}`
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white ${
                              isSelected
                                ? `bg-linear-to-br ${theme.gradient}`
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <span className={`w-2 h-2 rounded-full ${theme.dotColor} animate-pulse`} />
                          )}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-black block leading-tight text-white">
                            {exam.name}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                            {theme.badgeText}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Predictor Inputs Form */}
              <form onSubmit={handlePredictRedirect} className="space-y-4" suppressHydrationWarning>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  
                  {/* Score / Rank Input */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                        {inputMode === 'marks'
                          ? `Marks (Out of ${currentConfig.maxMarks})`
                          : inputMode === 'percentile'
                            ? 'Percentile'
                            : 'All India Rank'}
                      </label>
                      {/* Mode switcher pills */}
                      <div className="flex gap-1 text-[10px] font-bold">
                        {currentConfig.supportedInputModes.map((m) => (
                          <button
                            key={m}
                            type="button"
                            suppressHydrationWarning
                            onClick={() => setInputMode(m)}
                            className={`px-2 py-0.5 rounded-full uppercase transition-colors ${
                              inputMode === m
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        suppressHydrationWarning
                        step={inputMode === 'percentile' ? '0.01' : '1'}
                        placeholder={
                          inputMode === 'marks'
                            ? `e.g. ${Math.round(currentConfig.maxMarks * 0.75)}`
                            : inputMode === 'percentile'
                              ? 'e.g. 98.75'
                              : 'e.g. 18450'
                        }
                        value={scoreVal}
                        onChange={(e) => setScoreVal(e.target.value)}
                        required
                        className="w-full h-11 px-4 bg-slate-950 border border-slate-700/80 rounded-xl text-sm font-bold text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        {inputMode === 'marks'
                          ? `/${currentConfig.maxMarks}`
                          : inputMode === 'percentile'
                            ? '%ile'
                            : 'AIR'}
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                      Category
                    </label>
                    <select
                      suppressHydrationWarning
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-11 px-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-bold text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none cursor-pointer"
                    >
                      <option value="OPEN" className="bg-slate-900 text-white">General / Open</option>
                      <option value="GEN-EWS" className="bg-slate-900 text-white">GEN-EWS</option>
                      <option value="OBC-NCL" className="bg-slate-900 text-white">OBC-NCL</option>
                      <option value="SC" className="bg-slate-900 text-white">SC</option>
                      <option value="ST" className="bg-slate-900 text-white">ST</option>
                    </select>
                  </div>

                  {/* Home State / Course */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1.5">
                      {currentConfig.hasHomeState ? 'Home State' : 'Stream'}
                    </label>
                    {currentConfig.hasHomeState ? (
                      <select
                        suppressHydrationWarning
                        value={homeState}
                        onChange={(e) => setHomeState(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-bold text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none cursor-pointer"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st} className="bg-slate-900 text-white">
                            {st}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        suppressHydrationWarning
                        value={preferredBranch}
                        onChange={(e) => setPreferredBranch(e.target.value)}
                        className="w-full h-11 px-3 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-bold text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none cursor-pointer"
                      >
                        <option value="All" className="bg-slate-900 text-white">All Courses</option>
                        {currentConfig.courses.map((c) => (
                          <option key={c} value={c} className="bg-slate-900 text-white">
                            {c}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  suppressHydrationWarning
                  className="w-full h-12 bg-linear-to-r from-blue-600 via-cyan-500 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-extrabold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-cyan-500/25 cursor-pointer mt-3"
                >
                  <span>Predict My Rank & Eligible Colleges</span>
                  <ArrowRight className="w-5 h-5 text-yellow-300" />
                </button>
              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
