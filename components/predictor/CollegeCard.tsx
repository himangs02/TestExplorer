'use client';

import React from 'react';
import { CollegePredictionItem, AdmissionChance } from '@/lib/predictor/types';
import {
  MapPin,
  Building2,
  TrendingUp,
  Award,
  Layers,
  CheckSquare,
  Square,
  ArrowUpRight,
  Bookmark,
  Check,
  Lock,
  LockOpen
} from 'lucide-react';

interface CollegeCardProps {
  college: CollegePredictionItem;
  onViewDetails: (college: CollegePredictionItem) => void;
  onToggleCompare?: (college: CollegePredictionItem) => void;
  isCompared?: boolean;
  isLocked?: boolean;
  onUnlock?: () => void;
}

export const CollegeCard: React.FC<CollegeCardProps> = ({
  college,
  onViewDetails,
  onToggleCompare,
  isCompared = false,
  isLocked = false,
  onUnlock
}) => {
  const buffer = college.previousClosingRank - college.candidateRank;
  const isPositiveBuffer = buffer >= 0;

  // Visual calculation for progress bar
  const openRank = Math.round(college.previousClosingRank * 0.3);
  const closeRank = college.previousClosingRank;
  const fillPercent = Math.min(
    100,
    Math.max(
      5,
      Math.round(((closeRank - college.candidateRank) / (closeRank - openRank || 1)) * 100)
    )
  );

  const getStatusPill = (chance: AdmissionChance) => {
    switch (chance) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
            Safe
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            Target
          </span>
        );
      case 'AMBITIOUS':
      case 'LOW':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            Ambitious
          </span>
        );
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'IIT':
        return 'bg-purple-100 text-purple-900 border border-purple-200';
      case 'NIT':
        return 'bg-blue-100 text-blue-900 border border-blue-200';
      case 'IIIT':
        return 'bg-cyan-100 text-cyan-900 border border-cyan-200';
      case 'AIIMS':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-200';
      case 'NLU':
        return 'bg-amber-100 text-amber-900 border border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-400 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group overflow-hidden">
      {isLocked && (
        <div
          onClick={onUnlock}
          className="absolute inset-0 z-20 bg-slate-950/65 backdrop-blur-[3px] flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all hover:bg-slate-950/75 group"
        >
          <div className="w-10 h-10 rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg mb-2 transform group-hover:scale-105 transition-transform">
            <Lock className="w-5 h-5" />
          </div>
          <span className="text-xs font-black text-white uppercase tracking-wider mb-1">
            Eligible College Locked
          </span>
          <p className="text-[11px] text-slate-300 mb-3 max-w-[210px] leading-tight">
            Fill your student details to reveal this college, branch cutoffs & chance.
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onUnlock?.();
            }}
            className="px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-1.5"
          >
            <LockOpen className="w-3.5 h-3.5" />
            <span>Unlock Details</span>
          </button>
        </div>
      )}
      <div className={`flex flex-col justify-between h-full ${isLocked ? 'filter blur-[2px] select-none pointer-events-none opacity-60' : ''}`}>
        <div>
          {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider ${getTypeBadgeColor(college.instituteType)}`}>
              {college.instituteType}
            </span>
            {getStatusPill(college.chance)}
          </div>

          <div className="flex items-center gap-2">
            {onToggleCompare && (
              <button
                type="button"
                onClick={() => onToggleCompare(college)}
                className="text-gray-400 hover:text-blue-600 cursor-pointer p-1 rounded-md hover:bg-gray-50"
                title="Compare this college"
              >
                {isCompared ? (
                  <CheckSquare className="w-4 h-4 text-blue-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Institute Name */}
        <h4 className="text-base font-black text-gray-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
          {college.instituteName}
        </h4>

        {/* Branch / Program */}
        <p className="text-xs font-semibold text-gray-600 mt-1 leading-relaxed">
          {college.branch}
        </p>

        {/* Quota & Pool Tags */}
        <div className="flex items-center gap-2 mt-2 text-[11px] font-semibold text-gray-500">
          <span className="px-2 py-0.5 bg-gray-100 rounded-md">
            {college.quota === 'AI' ? 'All India' : college.quota === 'OS' ? 'Other State' : 'Home State'}
          </span>
          <span className="px-2 py-0.5 bg-gray-100 rounded-md">
            {college.gender === 'Female-only' ? 'Female Only' : 'GN (Gender-Neutral)'}
          </span>
          {college.nirfRank && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold">
              NIRF #{college.nirfRank}
            </span>
          )}
        </div>

        {/* Rank vs Cutoff Buffer indicator */}
        <div className="mt-3.5 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-gray-500 text-[11px]">Your rank vs cutoff</span>
            <span
              className={`font-black text-xs ${
                isPositiveBuffer ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {isPositiveBuffer ? `+${buffer.toLocaleString('en-IN')} buffer` : `${buffer.toLocaleString('en-IN')} buffer`}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all ${
                isPositiveBuffer ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.max(10, Math.min(100, fillPercent))}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-1">
            <span>Open: ~{openRank.toLocaleString('en-IN')}</span>
            <span>Close: ~{closeRank.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Bottom 3-Column Box */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-2 text-center text-xs py-1.5 px-2 bg-gray-50 rounded-xl border border-gray-100 mb-3">
          <div>
            <span className="text-[10px] text-gray-400 block font-semibold">Your Rank</span>
            <span className="font-black text-gray-900 text-xs sm:text-sm">
              {college.candidateRank.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block font-semibold">Closing</span>
            <span className="font-black text-gray-900 text-xs sm:text-sm">
              {college.previousClosingRank.toLocaleString('en-IN')}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block font-semibold">Category</span>
            <span className="font-black text-gray-700 text-xs sm:text-sm">
              {college.category}
            </span>
          </div>
        </div>

        {/* View Details Link */}
        <button
          type="button"
          onClick={() => onViewDetails(college)}
          className="w-full text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 cursor-pointer py-1"
        >
          <span>More details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
);
};
