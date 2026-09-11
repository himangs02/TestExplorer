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
  TrendingUp
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
    activeBorder: 'border-blue-600',
    activeBg: 'bg-blue-50/60',
    badgeText: 'Engineering',
    dotColor: 'bg-blue-600'
  },
  'jee-advanced': {
    icon: Rocket,
    gradient: 'from-indigo-600 via-purple-600 to-pink-500',
    activeBorder: 'border-indigo-600',
    activeBg: 'bg-indigo-50/60',
    badgeText: 'IITs (Elite)',
    dotColor: 'bg-indigo-600'
  },
  'neet': {
    icon: HeartPulse,
    gradient: 'from-emerald-500 to-teal-600',
    activeBorder: 'border-emerald-600',
    activeBg: 'bg-emerald-50/60',
    badgeText: 'Medical (MBBS)',
    dotColor: 'bg-emerald-600'
  },
  'cuet': {
    icon: Landmark,
    gradient: 'from-purple-600 to-pink-500',
    activeBorder: 'border-purple-600',
    activeBg: 'bg-purple-50/60',
    badgeText: 'DU & Central Univ',
    dotColor: 'bg-purple-600'
  },
  'clat': {
    icon: Scale,
    gradient: 'from-amber-500 to-orange-600',
    activeBorder: 'border-amber-600',
    activeBg: 'bg-amber-50/60',
    badgeText: 'Law (NLUs)',
    dotColor: 'bg-amber-600'
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
    <section className="py-12 sm:py-16 bg-linear-to-b from-gray-50 via-blue-50/30 to-white relative overflow-hidden border-t border-b border-gray-100">
      {/* Ambient background blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-200/40 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 bg-white border border-blue-200/60 rounded-full px-4 py-1.5 shadow-2xs mb-4">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="text-[11px] sm:text-xs font-bold text-blue-700 tracking-wide uppercase">
              🎯 Test Explorer Rank & College Predictor 2027
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-[34px] font-black tracking-tight text-gray-900 mb-3 leading-tight">
            Find Your Rank.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              Find Your College.
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-xl mx-auto">
            Enter your marks or rank and discover your estimated rank, admission chances, and colleges you may be eligible for.
          </p>
        </div>

        {/* Interactive Main Predictor Box */}
        <div className="max-w-3xl sm:max-w-4xl mx-auto bg-white rounded-3xl border border-gray-200/90 shadow-xl p-5 sm:p-7 md:p-8 transition-all">
          {/* Exam Selector Tabs */}
          <div className="mb-4">
            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2">
              1. Choose Your Exam
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {Object.values(EXAM_CONFIGS).map((exam) => {
                const isSelected = selectedExam === exam.id;
                const theme = EXAM_THEMES[exam.id];
                const IconComponent = theme.icon;

                return (
                  <button
                    key={exam.id}
                    type="button"
                    onClick={() => {
                      setSelectedExam(exam.id);
                      if (!exam.supportedInputModes.includes(inputMode)) {
                        setInputMode(exam.supportedInputModes[0]);
                      }
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl border font-bold text-left transition-all cursor-pointer flex flex-col justify-between group ${isSelected
                      ? `${theme.activeBorder} ${theme.activeBg} text-gray-900 shadow-xs ring-1 ring-blue-500/20`
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white hover:bg-gray-50/50'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs ${isSelected
                          ? `bg-linear-to-br ${theme.gradient} text-white shadow-xs`
                          : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                          }`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className={`w-2 h-2 rounded-full ${theme.dotColor} animate-pulse`} />
                      )}
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-black block leading-tight">{exam.name}</span>
                      <span className="text-[9px] sm:text-[10px] text-gray-400 font-semibold">{theme.badgeText}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Input Form */}
          <form onSubmit={handlePredictRedirect} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {/* Score / Rank Input */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">
                    {inputMode === 'marks'
                      ? `Marks (Out of ${currentConfig.maxMarks})`
                      : inputMode === 'percentile'
                        ? 'Percentile'
                        : 'All India Rank'}
                  </label>
                  {/* Mode switcher pills */}
                  <div className="flex gap-1 text-[9px] font-bold text-gray-500">
                    {currentConfig.supportedInputModes.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setInputMode(m)}
                        className={`px-1.5 py-0.5 rounded uppercase ${inputMode === m
                          ? 'bg-blue-100 text-blue-800'
                          : 'hover:text-gray-800'
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
                    step={inputMode === 'percentile' ? '0.01' : '1'}
                    placeholder={
                      inputMode === 'marks'
                        ? `e.g. ${Math.round(currentConfig.maxMarks * 0.75)}`
                        : inputMode === 'percentile'
                          ? 'e.g. 98.7'
                          : 'e.g. 18450'
                    }
                    value={scoreVal}
                    onChange={(e) => setScoreVal(e.target.value)}
                    required
                    className="w-full h-10 sm:h-10.5 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">
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
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 sm:h-10.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:border-blue-600 focus:bg-white focus:outline-hidden"
                >
                  <option value="OPEN">General / Open</option>
                  <option value="GEN-EWS">GEN-EWS</option>
                  <option value="OBC-NCL">OBC-NCL</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              {/* Home State */}
              <div>
                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                  {currentConfig.hasHomeState ? 'Home State' : 'Preferred Stream'}
                </label>
                {currentConfig.hasHomeState ? (
                  <select
                    value={homeState}
                    onChange={(e) => setHomeState(e.target.value)}
                    className="w-full h-10 sm:h-10.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:border-blue-600 focus:bg-white focus:outline-hidden"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={preferredBranch}
                    onChange={(e) => setPreferredBranch(e.target.value)}
                    className="w-full h-10 sm:h-10.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:border-blue-600 focus:bg-white focus:outline-hidden"
                  >
                    <option value="All">All Courses</option>
                    {currentConfig.courses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              className="w-full h-11 sm:h-12 bg-gray-900 hover:bg-black text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.005] shadow-md shadow-gray-200 cursor-pointer mt-2"
            >
              <span>Predict My Rank & Eligible Colleges</span>
              <ArrowRight className="w-4 h-4 text-yellow-400" />
            </button>
          </form>
        </div>

        {/* Value Props / Stats strip */}
        <div className="mt-8 text-center">
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">
            One Score. Thousands of Possibilities.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-xl sm:text-2xl font-black text-blue-600 block">5 Major</span>
              <span className="text-[11px] font-bold text-gray-600 mt-0.5 block">Exams Supported</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-xl sm:text-2xl font-black text-purple-600 block">1,500+</span>
              <span className="text-[11px] font-bold text-gray-600 mt-0.5 block">Premier Colleges</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-xl sm:text-2xl font-black text-emerald-600 block">Multi-Year</span>
              <span className="text-[11px] font-bold text-gray-600 mt-0.5 block">Verified Cutoffs</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-xl sm:text-2xl font-black text-indigo-600 block">JoSAA & MCC</span>
              <span className="text-[11px] font-bold text-gray-600 mt-0.5 block">Counselling Systems</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
