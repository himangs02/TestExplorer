'use client';

import React from 'react';
import { ExamConfig, ExamId } from '@/lib/predictor/types';
import {
  Cpu,
  Rocket,
  HeartPulse,
  Landmark,
  Scale,
  ArrowRight
} from 'lucide-react';

interface ExamSelectorProps {
  exams: Record<ExamId, ExamConfig>;
  selectedExam: ExamId;
  onSelectExam: (examId: ExamId) => void;
}

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

export const ExamSelector: React.FC<ExamSelectorProps> = ({
  exams,
  selectedExam,
  onSelectExam
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          Select Your Target Examination
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
          2027 Admissions
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {Object.values(exams).map((exam) => {
          const isSelected = selectedExam === exam.id;
          const theme = EXAM_THEMES[exam.id];
          const IconComponent = theme.icon;

          return (
            <button
              key={exam.id}
              type="button"
              onClick={() => onSelectExam(exam.id)}
              className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between group ${isSelected
                  ? `${theme.activeBorder} ${theme.activeBg} shadow-md ring-2 ring-blue-500/20`
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-xs'
                }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-2xs ${isSelected
                        ? `bg-linear-to-br ${theme.gradient} text-white shadow-md`
                        : 'bg-gray-100 text-gray-700 group-hover:bg-gray-200'
                      }`}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <span className={`flex h-2.5 w-2.5 rounded-full ${theme.dotColor} animate-pulse`} />
                  )}
                </div>

                <h4 className="text-base font-black text-gray-900 tracking-tight leading-tight mb-1">
                  {exam.name}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {exam.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                <span className={isSelected ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-700'}>
                  Predict Now
                </span>
                <ArrowRight
                  className={`w-3.5 h-3.5 transition-transform ${isSelected
                      ? 'text-blue-600 translate-x-0.5'
                      : 'text-gray-400 group-hover:translate-x-1'
                    }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
