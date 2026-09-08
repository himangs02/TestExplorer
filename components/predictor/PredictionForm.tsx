'use client';

import React, { useState } from 'react';
import {
  ExamConfig,
  InputMode,
  Category,
  Gender,
  PredictionRequest,
  Quota
} from '@/lib/predictor/types';
import { INDIAN_STATES, CUET_UNIVERSITIES } from '@/lib/predictor/data/exams-config';
import { ArrowRight, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface PredictionFormProps {
  exam: ExamConfig;
  onSubmit: (data: PredictionRequest) => void;
  isLoading: boolean;
  initialValues?: Partial<PredictionRequest>;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  exam,
  onSubmit,
  isLoading,
  initialValues
}) => {
  const [inputMode, setInputMode] = useState<InputMode>(
    initialValues?.inputMode || exam.supportedInputModes[0]
  );
  const [inputValue, setInputValue] = useState<string>(
    initialValues?.inputValue?.toString() || ''
  );
  const [category, setCategory] = useState<Category>(initialValues?.category || 'OPEN');
  const [gender, setGender] = useState<Gender>(initialValues?.gender || 'Gender-Neutral');
  const [isPwd, setIsPwd] = useState<boolean>(initialValues?.isPwd || false);
  const [homeState, setHomeState] = useState<string>(initialValues?.homeState || 'Delhi');
  const [preferredBranch, setPreferredBranch] = useState<string>(initialValues?.preferredBranch || 'All');
  const [preferredCollegeType, setPreferredCollegeType] = useState<string>(
    initialValues?.preferredCollegeType || 'All'
  );
  const [targetUniversity, setTargetUniversity] = useState<string>(
    initialValues?.targetUniversity || CUET_UNIVERSITIES[0]
  );
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    setInputValue('');
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const val = parseFloat(inputValue);
    if (isNaN(val) || val < 0) {
      setFormError('Please enter a valid number.');
      return;
    }

    if (inputMode === 'marks' && val > exam.maxMarks) {
      setFormError(`Marks cannot exceed the maximum of ${exam.maxMarks} for ${exam.name}.`);
      return;
    }

    if (inputMode === 'percentile' && (val > 100 || val < 0)) {
      setFormError('Percentile must be between 0 and 100.');
      return;
    }

    if (inputMode === 'rank' && val < 1) {
      setFormError('Rank must be at least 1.');
      return;
    }

    onSubmit({
      exam: exam.id,
      inputMode,
      inputValue: val,
      category,
      gender: exam.hasGenderPool ? gender : undefined,
      isPwd,
      homeState: exam.hasHomeState ? homeState : undefined,
      preferredBranch: preferredBranch !== 'All' ? preferredBranch : undefined,
      preferredCollegeType: preferredCollegeType !== 'All' ? preferredCollegeType : undefined,
      targetUniversity: exam.hasTargetUniversity ? targetUniversity : undefined
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border-2 border-gray-200 p-6 md:p-8 shadow-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Step 1: Student Profile & Score
          </span>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            {exam.name} Predictor 2027
          </h2>
        </div>

        {/* Input Mode Selector */}
        <div className="inline-flex p-1 bg-gray-100 rounded-xl">
          {exam.supportedInputModes.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => handleModeChange(mode)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${inputMode === mode
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
                }`}
            >
              {mode === 'marks' ? 'I know Marks' : mode === 'rank' ? 'I know Rank' : 'I know Percentile'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Score Input */}
      <div className="py-6">
        <label className="block text-sm font-bold text-gray-800 mb-2">
          {inputMode === 'marks'
            ? `Enter Your Expected / Actual Marks (Out of ${exam.maxMarks})`
            : inputMode === 'percentile'
              ? 'Enter Your Percentile Score (e.g. 98.75)'
              : 'Enter Your All India Rank (AIR)'}
        </label>
        <div className="relative">
          <input
            type="number"
            step={inputMode === 'percentile' ? '0.01' : '1'}
            placeholder={
              inputMode === 'marks'
                ? `e.g. ${Math.round(exam.maxMarks * 0.7)}`
                : inputMode === 'percentile'
                  ? 'e.g. 98.50'
                  : 'e.g. 15420'
            }
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            required
            className="w-full h-14 px-5 text-xl font-bold text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:outline-hidden transition-all shadow-inner"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
            {inputMode === 'marks'
              ? `/ ${exam.maxMarks}`
              : inputMode === 'percentile'
                ? '%ile'
                : 'AIR'}
          </div>
        </div>

        {formError && (
          <p className="mt-2 text-xs font-semibold text-rose-600">{formError}</p>
        )}
      </div>

      {/* Primary Attributes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-6">
        {/* Category */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:border-blue-600 focus:bg-white focus:outline-hidden"
          >
            <option value="OPEN">General / Open</option>
            <option value="GEN-EWS">GEN-EWS</option>
            <option value="OBC-NCL">OBC-NCL</option>
            <option value="SC">Scheduled Caste (SC)</option>
            <option value="ST">Scheduled Tribe (ST)</option>
          </select>
        </div>

        {/* Gender */}
        {exam.hasGenderPool && (
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Seat Pool / Gender
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:border-blue-600 focus:bg-white focus:outline-hidden"
            >
              <option value="Gender-Neutral">Gender-Neutral Pool</option>
              <option value="Female-only">Female-Only Supernumerary</option>
            </select>
          </div>
        )}

        {/* Home State */}
        {exam.hasHomeState && (
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Home State (Domicile)
            </label>
            <select
              value={homeState}
              onChange={(e) => setHomeState(e.target.value)}
              className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:border-blue-600 focus:bg-white focus:outline-hidden"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Target University for CUET */}
        {exam.hasTargetUniversity && (
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
              Target University
            </label>
            <select
              value={targetUniversity}
              onChange={(e) => setTargetUniversity(e.target.value)}
              className="w-full h-11 px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-800 focus:border-blue-600 focus:bg-white focus:outline-hidden"
            >
              {CUET_UNIVERSITIES.map((univ) => (
                <option key={univ} value={univ}>
                  {univ}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Advanced / Optional Filters (Progressive Disclosure) */}
      <div className="pt-2 pb-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          <span>{showAdvanced ? 'Hide Advanced Filters' : '+ Add Branch & Institute Preferences (Optional)'}</span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                Preferred Branch / Specialization
              </label>
              <select
                value={preferredBranch}
                onChange={(e) => setPreferredBranch(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
              >
                <option value="All">All Branches</option>
                {exam.popularBranches.map((br) => (
                  <option key={br} value={br}>
                    {br}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                College Type
              </label>
              <select
                value={preferredCollegeType}
                onChange={(e) => setPreferredCollegeType(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
              >
                {exam.collegeTypes.map((ctype) => (
                  <option key={ctype} value={ctype}>
                    {ctype}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="pwd-checkbox"
                checked={isPwd}
                onChange={(e) => setIsPwd(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="pwd-checkbox" className="text-xs font-bold text-gray-700 cursor-pointer">
                Person with Benchmark Disability (PwD) Quota Applicable
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 bg-gray-900 hover:bg-gray-800 text-white font-bold text-base md:text-lg rounded-2xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01] shadow-lg shadow-gray-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing Historical Cutoff Data...
          </span>
        ) : (
          <>
            <span>Predict My Rank & Eligible Colleges</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      {/* Privacy / Integrity footnote */}
      <p className="text-[11px] text-gray-400 text-center mt-3 font-medium">
        🔒 Free & No Mandatory Login required. Predictions derived from verified historical JoSAA, MCC & Central counselling datasets.
      </p>
    </form>
  );
};
