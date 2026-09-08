'use client';

import React from 'react';
import { RankPredictionResult, ExamConfig } from '@/lib/predictor/types';
import { Award, AlertCircle, TrendingUp, HelpCircle } from 'lucide-react';

interface RankPredictionCardProps {
  prediction: RankPredictionResult;
  exam: ExamConfig;
}

export const RankPredictionCard: React.FC<RankPredictionCardProps> = ({
  prediction,
  exam
}) => {
  return (
    <div className="bg-linear-to-br from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-500/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-blue-300">
                Score Analysis
              </span>
              <h3 className="text-lg font-black tracking-tight leading-tight">
                Estimated {exam.name} Rank Result
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {prediction.confidence} Confidence
            </span>
          </div>
        </div>

        {/* Big numbers grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-white/10">
          {/* Estimated Rank */}
          <div>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block mb-1">
              Estimated All India Rank
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                ≈ {prediction.estimatedRank.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Expected Range */}
          <div>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block mb-1">
              Likely AIR Range
            </span>
            <div className="text-xl sm:text-2xl font-black text-blue-100 tracking-tight">
              {prediction.rankRange.min.toLocaleString('en-IN')} –{' '}
              {prediction.rankRange.max.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-blue-300">Based on historical curve</span>
          </div>

          {/* Percentile (if available) */}
          {prediction.estimatedPercentile !== undefined && (
            <div>
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block mb-1">
                Estimated Percentile
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl sm:text-4xl font-black text-amber-300">
                  {prediction.estimatedPercentile.toFixed(2)}
                </span>
                <span className="text-base font-bold text-amber-200">%ile</span>
              </div>
            </div>
          )}
        </div>

        {/* Interpretation sentence */}
        <div className="pt-4 flex items-start gap-2.5">
          <TrendingUp className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-blue-100 leading-relaxed">
            {prediction.interpretation}
          </p>
        </div>

        {/* Official disclaimer box */}
        <div className="mt-5 p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-200 leading-relaxed">
            <strong className="text-amber-300">Notice:</strong> {prediction.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
};
