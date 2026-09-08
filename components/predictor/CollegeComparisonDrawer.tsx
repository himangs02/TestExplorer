'use client';

import React from 'react';
import { CollegePredictionItem } from '@/lib/predictor/types';
import { X, Layers, Award, DollarSign, Briefcase, MapPin, CheckCircle } from 'lucide-react';

interface CollegeComparisonDrawerProps {
  colleges: CollegePredictionItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const CollegeComparisonDrawer: React.FC<CollegeComparisonDrawerProps> = ({
  colleges,
  onRemove,
  onClear,
  onClose
}) => {
  if (colleges.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border-2 border-gray-200 shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Side-by-Side Analysis
            </span>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              Compare Colleges ({colleges.length}/4 Selected)
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClear}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto py-6">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-xs font-bold text-gray-400 uppercase w-44">
                  Feature / Metric
                </th>
                {colleges.map((col) => (
                  <th key={col.id} className="py-3 px-4 min-w-[200px] align-top">
                    <div className="relative p-3 rounded-2xl bg-gray-50 border border-gray-200">
                      <button
                        onClick={() => onRemove(col.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-200 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-gray-500 cursor-pointer text-xs font-bold"
                        title="Remove from compare"
                      >
                        ×
                      </button>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-gray-900 text-white inline-block mb-1">
                        {col.instituteType}
                      </span>
                      <h5 className="text-sm font-black text-gray-900 leading-tight line-clamp-2">
                        {col.instituteName}
                      </h5>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
              {/* Branch */}
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 bg-gray-50/50">
                  Branch / Course
                </td>
                {colleges.map((col) => (
                  <td key={col.id} className="py-3 px-4 font-bold text-blue-700">
                    {col.branch}
                  </td>
                ))}
              </tr>

              {/* Admission Chance */}
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 bg-gray-50/50">
                  Admission Chance
                </td>
                {colleges.map((col) => (
                  <td key={col.id} className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-black ${
                        col.chance === 'HIGH'
                          ? 'bg-emerald-100 text-emerald-800'
                          : col.chance === 'MODERATE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {col.chance} ({col.chancePercentage}%)
                    </span>
                  </td>
                ))}
              </tr>

              {/* Previous Closing Rank */}
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 bg-gray-50/50">
                  Closing Rank (Prev)
                </td>
                {colleges.map((col) => (
                  <td key={col.id} className="py-3 px-4 font-bold text-gray-900 text-sm">
                    ~{col.previousClosingRank.toLocaleString('en-IN')}
                  </td>
                ))}
              </tr>

              {/* NIRF Ranking */}
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 bg-gray-50/50">
                  NIRF Ranking
                </td>
                {colleges.map((col) => (
                  <td key={col.id} className="py-3 px-4 font-bold text-indigo-700">
                    {col.nirfRank ? `#${col.nirfRank}` : 'Unranked'}
                  </td>
                ))}
              </tr>

              {/* Average CTC */}
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 bg-gray-50/50">
                  Average Package (LPA)
                </td>
                {colleges.map((col) => (
                  <td key={col.id} className="py-3 px-4 font-bold text-emerald-700 text-sm">
                    {col.avgPackageLpa ? `₹${col.avgPackageLpa} LPA` : 'N/A'}
                  </td>
                ))}
              </tr>

              {/* Annual Tuition Fees */}
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 bg-gray-50/50">
                  Tuition Fee / Year
                </td>
                {colleges.map((col) => (
                  <td key={col.id} className="py-3 px-4 font-semibold text-gray-800">
                    {col.tuitionFeePerYear || 'Subsidized'}
                  </td>
                ))}
              </tr>

              {/* Location */}
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 bg-gray-50/50">
                  Location
                </td>
                {colleges.map((col) => (
                  <td key={col.id} className="py-3 px-4 text-gray-600">
                    {col.city}, {col.state}
                  </td>
                ))}
              </tr>

              {/* Counselling System */}
              <tr>
                <td className="py-3 px-4 font-bold text-gray-900 bg-gray-50/50">
                  Counselling System
                </td>
                {colleges.map((col) => (
                  <td key={col.id} className="py-3 px-4 font-bold text-gray-700">
                    {col.counselling}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action button */}
        <button
          onClick={onClose}
          className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all cursor-pointer"
        >
          Close Comparison
        </button>
      </div>
    </div>
  );
};
