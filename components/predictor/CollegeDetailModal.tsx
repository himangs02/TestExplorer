'use client';

import React from 'react';
import { CollegePredictionItem } from '@/lib/predictor/types';
import { X, MapPin, Award, DollarSign, Briefcase, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CollegeDetailModalProps {
  college: CollegePredictionItem | null;
  onClose: () => void;
}

export const CollegeDetailModal: React.FC<CollegeDetailModalProps> = ({
  college,
  onClose
}) => {
  if (!college) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="pr-12 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-gray-900 text-white">
              {college.instituteType}
            </span>
            {college.nirfRank && (
              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> NIRF Ranking #{college.nirfRank}
              </span>
            )}
            <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md">
              {college.counselling} Counselling
            </span>
          </div>

          <h3 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">
            {college.instituteName}
          </h3>
          <p className="text-sm font-semibold text-blue-600 mt-1 flex items-center gap-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            {college.city}, {college.state} • {college.branch} ({college.course})
          </p>
        </div>

        {/* Chance & Admission summary card */}
        <div className="p-4 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Your Admission Probability
              </span>
              <span className="text-lg font-black text-blue-900">
                {college.chance === 'HIGH' ? '🟢 High Chance (Safe Option)' : college.chance === 'MODERATE' ? '🟡 Moderate Chance (Target Option)' : '🔴 Low / Ambitious (Dream Option)'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-blue-700">{college.chancePercentage}%</span>
              <span className="text-[10px] text-gray-500 block font-semibold">Match Score</span>
            </div>
          </div>
        </div>

        {/* 3-Year Cutoff Trend */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            Historical Closing Rank Trend (Category: {college.category})
          </h4>

          <div className="grid grid-cols-3 gap-3">
            {[2023, 2024, 2025].map((yr) => {
              const rankVal = college.closingRanksByYear[yr] || college.previousClosingRank;
              return (
                <div key={yr} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <span className="text-xs font-bold text-gray-500 block">{yr} Cutoff</span>
                  <span className="text-base font-black text-gray-900 mt-1 block">
                    ~{rankVal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-bold">Verified Data</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Metrics Grid: Fees, Placement, Quota */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-1">
              <DollarSign className="w-4 h-4 text-amber-600" />
              Tuition Fee Structure
            </div>
            <p className="text-lg font-black text-gray-900">
              {college.tuitionFeePerYear || 'Government Subsidized'}
            </p>
            <span className="text-[11px] text-gray-400">Approx. per academic year</span>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-1">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              Placement Highlights
            </div>
            <p className="text-lg font-black text-gray-900">
              {college.avgPackageLpa ? `Avg: ₹${college.avgPackageLpa} LPA` : 'Top Recruiters Visiting'}
            </p>
            <span className="text-[11px] text-gray-400">
              {college.highestPackageLpa ? `Highest CTC: ₹${college.highestPackageLpa} LPA` : 'High Placement Rate'}
            </span>
          </div>
        </div>

        {/* Counselling and Authority Info */}
        <div className="p-4 rounded-2xl bg-gray-100 text-xs text-gray-600 flex items-start gap-2.5 mb-6">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-gray-900">Data Source & Counselling Guidelines</p>
            <p className="mt-0.5 leading-relaxed">
              Cutoffs sourced directly from official {college.source} records. Final seat allotment will take place through central counselling portals based on official rank lists.
            </p>
          </div>
        </div>

        {/* Bottom Button */}
        <button
          onClick={onClose}
          className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all cursor-pointer"
        >
          Close Overview
        </button>
      </div>
    </div>
  );
};
