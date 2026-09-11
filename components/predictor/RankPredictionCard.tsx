'use client';

import React from 'react';
import { RankPredictionResult, ExamConfig } from '@/lib/predictor/types';
import { Award, AlertCircle, TrendingUp } from 'lucide-react';

interface RankPredictionCardProps {
  prediction: RankPredictionResult;
  exam: ExamConfig;
}

export const RankPredictionCard: React.FC<RankPredictionCardProps> = ({
  prediction,
  exam
}) => {
  return (
    <div className="bg-linear-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 sm:pb-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/30 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </span>
            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-blue-300 block">
                Score Analysis
              </span>
              <h3 className="text-sm sm:text-base lg:text-lg font-black tracking-tight leading-tight">
                Estimated {exam.name} Rank Result
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {prediction.confidence} Confidence
            </span>
          </div>
        </div>

        {/* Dynamic proportional numbers grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 py-4 sm:py-5 border-b border-white/10">
          {/* Estimated Rank */}
          <div>
            <span className="text-[11px] sm:text-xs font-semibold text-blue-200 uppercase tracking-wider block mb-1">
              Estimated All India Rank
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                ≈ {prediction.estimatedRank.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Expected Range */}
          <div>
            <span className="text-[11px] sm:text-xs font-semibold text-blue-200 uppercase tracking-wider block mb-1">
              Likely AIR Range
            </span>
            <div className="text-lg sm:text-xl lg:text-2xl font-black text-blue-100 tracking-tight">
              {prediction.rankRange.min.toLocaleString('en-IN')} –{' '}
              {prediction.rankRange.max.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] sm:text-[11px] text-blue-300">Based on historical curve</span>
          </div>

          {/* Percentile (if available) */}
          {prediction.estimatedPercentile !== undefined && (
            <div>
              <span className="text-[11px] sm:text-xs font-semibold text-blue-200 uppercase tracking-wider block mb-1">
                Estimated Percentile
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-amber-300">
                  {prediction.estimatedPercentile.toFixed(2)}
                </span>
                <span className="text-sm sm:text-base font-bold text-amber-200">%ile</span>
              </div>
            </div>
          )}
        </div>

        {/* Interpretation sentence */}
        <div className="pt-3.5 sm:pt-4 flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-medium text-blue-100 leading-relaxed">
            {prediction.interpretation}
          </p>
        </div>

        {/* Official disclaimer box */}
        <div className="mt-4 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] sm:text-xs text-blue-200 leading-relaxed">
            <strong className="text-amber-300">Notice:</strong> {prediction.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
