'use client';

import React, { useState, useEffect } from 'react';
import {
  ExamId,
  PredictionRequest,
  PredictionResponse,
  CollegePredictionItem
} from '@/lib/predictor/types';
import { EXAM_CONFIGS } from '@/lib/predictor/data/exams-config';
import { ExamSelector } from './ExamSelector';
import { PredictionForm } from './PredictionForm';
import { RankPredictionCard } from './RankPredictionCard';
import { CollegePredictionList } from './CollegePredictionList';
import { CollegeDetailModal } from './CollegeDetailModal';
import { CollegeComparisonDrawer } from './CollegeComparisonDrawer';
import { PreferenceListBuilder } from './PreferenceListBuilder';
import { PredictionShareModal } from './PredictionShareModal';
import { CsvImporter } from './admin/CsvImporter';
import { Target, Database, ShieldCheck, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PredictorDashboardProps {
  defaultExam?: ExamId;
  initialQuery?: Partial<PredictionRequest>;
}

export const PredictorDashboard: React.FC<PredictorDashboardProps> = ({
  defaultExam = 'jee-main',
  initialQuery
}) => {
  const [selectedExam, setSelectedExam] = useState<ExamId>(defaultExam);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);

  // Modals / Drawers state
  const [selectedCollegeForDetail, setSelectedCollegeForDetail] = useState<CollegePredictionItem | null>(null);
  const [compareList, setCompareList] = useState<CollegePredictionItem[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isPreferenceListOpen, setIsPreferenceListOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAdminCsvOpen, setIsAdminCsvOpen] = useState(false);

  // If initialQuery provided, auto-run prediction
  useEffect(() => {
    if (initialQuery?.inputValue !== undefined && initialQuery.inputValue > 0) {
      handlePredictionSubmit({
        exam: initialQuery.exam || defaultExam,
        inputMode: initialQuery.inputMode || 'marks',
        inputValue: initialQuery.inputValue,
        category: initialQuery.category || 'OPEN',
        homeState: initialQuery.homeState,
        gender: initialQuery.gender,
        preferredBranch: initialQuery.preferredBranch
      });
    }
  }, []);

  const handleSelectExam = (examId: ExamId) => {
    setSelectedExam(examId);
    setPredictionResult(null);
    setCompareList([]);
  };

  const handlePredictionSubmit = async (request: PredictionRequest) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/predictor/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to predict rank & colleges.');
      }

      setPredictionResult(data);
      toast.success(`Prediction generated for ${EXAM_CONFIGS[request.exam].name}!`);

      // Scroll smoothly to prediction results
      setTimeout(() => {
        const resultsEl = document.getElementById('prediction-results-anchor');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Error generating prediction.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentExamConfig = EXAM_CONFIGS[selectedExam];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Top Banner / Heading */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-4 shadow-2xs">
          <Target className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span>Test Explorer Admissions Intelligence 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.15] mb-4">
          Find Your Rank.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Find Your College.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-gray-600 font-medium leading-relaxed">
          Enter your marks, rank or percentile to discover your estimated All India Rank, admission probability bands, and verified eligible institutions across India.
        </p>

        {/* Quick Admin Access trigger */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold text-gray-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Historical Datasets
          </span>
          <span>•</span>
          <button
            onClick={() => setIsAdminCsvOpen(true)}
            className="hover:text-gray-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Admin CSV Importer
          </button>
        </div>
      </div>

      {/* 1. Exam Selector */}
      <div className="mb-8">
        <ExamSelector
          exams={EXAM_CONFIGS}
          selectedExam={selectedExam}
          onSelectExam={handleSelectExam}
        />
      </div>

      {/* 2. Prediction Form */}
      <div className="mb-10">
        <PredictionForm
          key={selectedExam}
          exam={currentExamConfig}
          onSubmit={handlePredictionSubmit}
          isLoading={isLoading}
          initialValues={initialQuery}
        />
      </div>

      {/* 3. Loading State Feedback */}
      {isLoading && (
        <div className="p-12 text-center bg-white rounded-3xl border-2 border-gray-200 shadow-sm animate-pulse mb-10">
          <div className="w-12 h-12 rounded-full border-3 border-blue-600 border-t-transparent animate-spin mx-auto mb-4" />
          <h4 className="text-lg font-bold text-gray-900">
            Analyzing Your Score Against Historical Exam Data...
          </h4>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            Cross-referencing JoSAA, MCC, and Central University round-by-round cutoff matrices for {currentExamConfig.name}.
          </p>
        </div>
      )}

      {/* 4. Results Section */}
      <div id="prediction-results-anchor">
        {predictionResult && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Rank Prediction Card */}
            <RankPredictionCard
              prediction={predictionResult.rankPrediction}
              exam={predictionResult.exam}
            />

            {/* College List with Filters */}
            <CollegePredictionList
              prediction={predictionResult}
              onViewDetails={(col) => setSelectedCollegeForDetail(col)}
              onOpenCompare={(cols) => {
                setCompareList(cols);
                setIsCompareOpen(true);
              }}
              onOpenPreferenceList={() => setIsPreferenceListOpen(true)}
              onOpenShare={() => setIsShareModalOpen(true)}
            />
          </div>
        )}
      </div>

      {/* College Detail Modal */}
      <CollegeDetailModal
        college={selectedCollegeForDetail}
        onClose={() => setSelectedCollegeForDetail(null)}
      />

      {/* Comparison Drawer */}
      {isCompareOpen && (
        <CollegeComparisonDrawer
          colleges={compareList}
          onRemove={(id) => {
            const updated = compareList.filter((c) => c.id !== id);
            setCompareList(updated);
            if (updated.length === 0) setIsCompareOpen(false);
          }}
          onClear={() => {
            setCompareList([]);
            setIsCompareOpen(false);
          }}
          onClose={() => setIsCompareOpen(false)}
        />
      )}

      {/* Preference List Builder Modal */}
      {isPreferenceListOpen && predictionResult && (
        <PreferenceListBuilder
          initialColleges={predictionResult.colleges}
          onClose={() => setIsPreferenceListOpen(false)}
        />
      )}

      {/* Share Modal */}
      {isShareModalOpen && predictionResult && (
        <PredictionShareModal
          prediction={predictionResult}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Admin CSV Importer Modal */}
      {isAdminCsvOpen && (
        <CsvImporter onClose={() => setIsAdminCsvOpen(false)} />
      )}
    </div>
  );
};
