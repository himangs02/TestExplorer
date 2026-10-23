'use client';

import React, { useState } from 'react';
import { Play, X, CheckCircle2, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function WatchDemoButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-6 py-3.5 bg-white text-gray-800 border border-gray-200 rounded-full font-bold text-base hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer hover:border-gray-300"
      >
        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
          <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
        </div>
        <span>Watch Demo</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-100 relative">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                  TE
                </div>
                <div>
                  <h3 className="font-bold text-sm">Test Explorer Platform Walkthrough</h3>
                  <p className="text-[11px] text-slate-400">Interactive overview of the Mock Engine & AI Predictor</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video / Interactive Demo Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex flex-col justify-between p-6 text-white group">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-blue-600/90 text-white font-bold text-xs uppercase tracking-wider">
                    Official NTA-Pattern Interface
                  </span>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Simulation
                  </div>
                </div>

                <div className="text-center my-auto space-y-3">
                  <div className="w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-blue-500/30 cursor-pointer transform hover:scale-110 transition-all">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                  <h4 className="text-xl font-black">Experience the JEE & NEET Examination Engine</h4>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                    Full-screen CBT layout, question status palette, countdown timer, and AI college forecasting engine.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <span>Duration: 2 min overview</span>
                  <span>Instant Full-Syllabus Mock Access</span>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> CBT Environment
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">Exact NTA question palette with real-time timers and review flags.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-700 font-bold text-xs">
                    <Zap className="w-3.5 h-3.5" /> Instant Solutions
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">Rich stepwise solutions and diagnostic guidance for every problem.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <ShieldCheck className="w-3.5 h-3.5" /> Rank Forecasting
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug">AI admission probability across 1,500+ NITs, IIITs, and IITs.</p>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-sm font-bold text-white hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <span>Start Live Mock Test</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
