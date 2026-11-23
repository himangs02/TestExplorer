'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Sparkles, 
  ShieldAlert, 
  Award, 
  Flame, 
  ChevronRight, 
  HelpCircle, 
  X, 
  CheckCircle2, 
  ArrowUpRight,
  TrendingUp,
  Brain,
  Zap
} from 'lucide-react'
import { LearningTierInfo } from '@/lib/learning-tier'

interface Props {
  tier: LearningTierInfo
}

export default function StudentLearningTierCard({ tier }: Props) {
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  const isFoundation = tier.tierId === 'FOUNDATION'
  const isProficient = tier.tierId === 'PROFICIENT'
  const isAdvanced = tier.tierId === 'ADVANCED'

  return (
    <>
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-sm mb-10 transition-all ${
        isFoundation 
          ? 'bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white border-amber-200/80' 
          : isProficient
            ? 'bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-white border-blue-200/80'
            : 'bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white border-emerald-200/80'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Left: Tier badge & details */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                isFoundation
                  ? 'bg-amber-100 text-amber-900 border border-amber-200'
                  : isProficient
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
              }`}>
                {isFoundation && <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />}
                {isProficient && <Zap className="w-3.5 h-3.5 text-blue-700" />}
                {isAdvanced && <Flame className="w-3.5 h-3.5 text-emerald-700" />}
                {tier.badgeText}
              </span>

              <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                title="Learn how personalized learning works"
              >
                <HelpCircle className="w-3.5 h-3.5" /> How it works
              </button>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                {tier.title}
                {isAdvanced && <Sparkles className="w-5 h-5 text-amber-500 inline" />}
              </h3>
              <p className="text-sm font-medium text-gray-600 mt-1 leading-relaxed">
                {tier.statusMessage}
              </p>
            </div>

            {/* Progress to next level bar */}
            <div className="pt-2 max-w-lg space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-600">
                <span>{tier.nextLevelMessage}</span>
                <span className="font-black text-gray-900">
                  {tier.currentScore > 0 ? `${tier.currentScore}%` : 'N/A'}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-200/80 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    isFoundation
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                      : isProficient
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                        : 'bg-gradient-to-r from-emerald-400 to-teal-600'
                  }`}
                  style={{ width: `${Math.max(0, tier.progressToNext)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right: Quick Action Button */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Link
              href="/categories"
              className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-white shadow-md transition-all ${
                isFoundation
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  : isProficient
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {isFoundation ? (
                <>Strengthen Basics <ArrowUpRight className="w-4 h-4" /></>
              ) : (
                <>Take Adaptive Challenge <ArrowUpRight className="w-4 h-4" /></>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors text-center"
            >
              View Learning Path Guide
            </button>
          </div>

        </div>
      </div>

      {/* Guide Modal for Students */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsGuideOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-6">
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">How Personalized Learning Works</h3>
                  <p className="text-xs text-gray-500 font-medium">Your questions adapt automatically to your skills.</p>
                </div>
              </div>

              {/* The 3 Tiers Explained */}
              <div className="space-y-3 text-sm">
                
                {/* Tier 1 */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-amber-950 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Level 1: Foundation Booster (&lt; 60%)
                    </div>
                    <span className="text-xs font-bold bg-amber-200/60 text-amber-900 px-2.5 py-0.5 rounded-full">Core Basics</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Designed for students mastering new chapters. Questions focus on direct formulas, definitions, and 1-step problems to guarantee you build a rock-solid foundation without unnecessary stress.
                  </p>
                </div>

                {/* Tier 2 */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-blue-950 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Level 2: Concept Master (60% - 85%)
                    </div>
                    <span className="text-xs font-bold bg-blue-200/60 text-blue-900 px-2.5 py-0.5 rounded-full">Application</span>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    Once you score 60%+, the platform unlocks multi-step questions where you apply concepts to real problem sets and improve your timed speed.
                  </p>
                </div>

                {/* Tier 3 */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="font-black text-emerald-950 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Level 3: Challenger & Olympiad (&gt; 85%)
                    </div>
                    <span className="text-xs font-bold bg-emerald-200/60 text-emerald-900 px-2.5 py-0.5 rounded-full">Elite HOTS</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Top ranker mode. Presents advanced Higher Order Thinking Skills (HOTS) questions, multi-concept problems, and Olympiad/NTSE level benchmarks.
                  </p>
                </div>

              </div>

              {/* Student Motivation Guide */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs text-slate-700">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" /> How to Level Up:
                </div>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
                  <li>Complete chapter practice sets and review missed question solutions.</li>
                  <li>Maintain an accuracy above 60% on your next test to automatically upgrade your learning level.</li>
                  <li>Every question is arranged progressively (Easy &rarr; Medium &rarr; Hard) so you never get stuck.</li>
                </ul>
              </div>

              <button
                onClick={() => setIsGuideOpen(false)}
                className="w-full py-3 bg-black hover:bg-gray-800 text-white font-bold rounded-xl text-sm transition"
              >
                Got it, Let's Practice!
              </button>

            </div>
          </div>
        </div>
      )}
    </>
  )
}
