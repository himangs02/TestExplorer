'use client';

import React from 'react';
import { BookOpen, TrendingUp, Trophy, Clock } from 'lucide-react';

interface JuniorClassCard {
  title: string;
  badgeBg: string;
  badgeText: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  shadowColor: string;
}

const JUNIOR_CLASSES: JuniorClassCard[] = [
  {
    title: 'Class 8',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
    badgeText: 'Foundation Level',
    desc: 'Build a strong foundation in core concepts and develop problem-solving skills.',
    icon: BookOpen,
    gradient: 'from-blue-900 via-sky-900 to-slate-950',
    shadowColor: 'hover:shadow-blue-500/20',
  },
  {
    title: 'Class 9',
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
    badgeText: 'Concept Mastery',
    desc: 'Strengthen concepts, improve application skills and build confidence for higher challenges.',
    icon: TrendingUp,
    gradient: 'from-emerald-900 via-teal-900 to-slate-950',
    shadowColor: 'hover:shadow-teal-500/20',
  },
  {
    title: 'Class 10',
    badgeBg: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
    badgeText: 'Boards & NTSE',
    desc: 'Prepare for board exams and competitive exams like NTSE with focused practice.',
    icon: Trophy,
    gradient: 'from-amber-700 via-orange-800 to-slate-950',
    shadowColor: 'hover:shadow-orange-500/20',
  }
];

export default function JuniorSection() {
  return (
    <section className="py-12 sm:py-16 bg-slate-200/80 relative border-t border-b border-slate-300">
      <div className="container mx-auto px-4 sm:px-6">

        {/* ================= SECTION HEADER ================= */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">

          {/* Logo with green JR superscript as requested */}
          <div className="inline-flex items-center justify-center mb-2.5">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 flex items-center">
              <span>Test</span>
              <span className="text-blue-600">Explorer</span>
              <sup className="text-emerald-600 font-black text-sm sm:text-lg -top-2 ml-0.5 tracking-tight uppercase">
                JR
              </sup>
            </h2>
          </div>

          {/* Target classes pill */}
          <div className="mb-2.5">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs">
              For Classes 8 • 9 • 10
            </span>
          </div>

          {/* Section description */}
          <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
            Build strong foundations early. Practice for school boards, Olympiads and competitive exams.
          </p>
        </div>

        {/* ================= 3 JUNIOR CARDS (MATCHING EXPLORE EXAM CATEGORIES DITTO) ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {JUNIOR_CLASSES.map((cat, idx) => {
            const IconComp = cat.icon;

            return (
              <div
                key={idx}
                className="group relative block w-full outline-none"
              >
                <div
                  className={`
                    relative h-[280px] sm:h-[300px] p-6 rounded-3xl overflow-hidden
                    bg-gradient-to-br ${cat.gradient} text-white
                    border border-white/10 shadow-lg ${cat.shadowColor}
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
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${cat.badgeBg}`}>
                        {cat.badgeText}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-white tracking-tight leading-snug group-hover:text-blue-100 transition-colors">
                      {cat.title}
                    </h3>

                    <p className="text-xs text-slate-300/90 font-medium line-clamp-3 mt-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  {/* Bottom: Coming Soon Badge (Start Learning button removed) */}
                  <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/25 text-[11px] font-bold text-amber-300 tracking-wide">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Coming Soon</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300/80">
                      Curriculum in progress
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
