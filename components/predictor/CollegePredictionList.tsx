'use client';

import React, { useState, useMemo } from 'react';
import {
  CollegePredictionItem,
  AdmissionChance,
  PredictionResponse,
  Category,
  Quota
} from '@/lib/predictor/types';
import { CollegeCard } from './CollegeCard';
import { INDIAN_STATES } from '@/lib/predictor/data/exams-config';
import {
  Search,
  SlidersHorizontal,
  Layers,
  Share2,
  Bookmark,
  ListOrdered,
  Building2,
  CheckCircle2,
  Check,
  TrendingUp,
  Download,
  RotateCcw,
  LayoutGrid,
  ChevronDown,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface CollegePredictionListProps {
  prediction: PredictionResponse;
  onViewDetails: (college: CollegePredictionItem) => void;
  onOpenCompare: (colleges: CollegePredictionItem[]) => void;
  onOpenPreferenceList: (colleges: CollegePredictionItem[]) => void;
  onOpenShare: () => void;
}

export const CollegePredictionList: React.FC<CollegePredictionListProps> = ({
  prediction,
  onViewDetails,
  onOpenCompare,
  onOpenPreferenceList,
  onOpenShare
}) => {
  const [selectedChance, setSelectedChance] = useState<'ALL' | AdmissionChance>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedQuotas, setSelectedQuotas] = useState<Quota[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [homeStateFilter, setHomeStateFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'BEST' | 'LOWEST_CLOSE' | 'HIGHEST_CLOSE' | 'NAME' | 'NIRF'>('BEST');
  const [comparedColleges, setComparedColleges] = useState<CollegePredictionItem[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination for large datasets (e.g. 400+ options)
  const [visibleCount, setVisibleCount] = useState<number>(30);

  // Available college types
  const availableTypes = useMemo(() => {
    const types = new Set(prediction.colleges.map((c) => c.instituteType));
    return Array.from(types).sort();
  }, [prediction.colleges]);

  // Categories list
  const categoryOptions: { label: string; value: Category }[] = [
    { label: 'OPEN', value: 'OPEN' },
    { label: 'EWS', value: 'GEN-EWS' },
    { label: 'OBC-NCL', value: 'OBC-NCL' },
    { label: 'SC', value: 'SC' },
    { label: 'ST', value: 'ST' }
  ];

  // Quotas list
  const quotaOptions: { label: string; value: Quota }[] = [
    { label: 'All India (AI)', value: 'AI' },
    { label: 'Other State (OS)', value: 'OS' },
    { label: 'Home State (HS)', value: 'HS' }
  ];

  // Toggle helpers
  const toggleCategory = (cat: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleQuota = (q: Quota) => {
    setSelectedQuotas((prev) =>
      prev.includes(q) ? prev.filter((item) => item !== q) : [...prev, q]
    );
  };

  const toggleType = (t: string) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleResetFilters = () => {
    setSelectedChance('ALL');
    setSelectedCategories([]);
    setSelectedQuotas([]);
    setSelectedTypes([]);
    setHomeStateFilter('All');
    setSearchQuery('');
    setSortBy('BEST');
    setVisibleCount(30);
    toast.success('Filters reset to defaults');
  };

  // Filtered & sorted colleges
  const filteredColleges = useMemo(() => {
    return prediction.colleges
      .filter((college) => {
        // Chance filter
        if (selectedChance !== 'ALL' && college.chance !== selectedChance) {
          return false;
        }

        // Category filter
        if (selectedCategories.length > 0 && !selectedCategories.includes(college.category)) {
          return false;
        }

        // Quota filter
        if (selectedQuotas.length > 0 && !selectedQuotas.includes(college.quota)) {
          return false;
        }

        // Institute Type filter
        if (selectedTypes.length > 0 && !selectedTypes.includes(college.instituteType)) {
          return false;
        }

        // Home State filter
        if (homeStateFilter !== 'All' && college.state !== homeStateFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = college.instituteName.toLowerCase().includes(q);
          const matchBranch = college.branch.toLowerCase().includes(q);
          const matchCity = college.city.toLowerCase().includes(q);
          const matchState = college.state.toLowerCase().includes(q);
          if (!matchName && !matchBranch && !matchCity && !matchState) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'LOWEST_CLOSE') return a.previousClosingRank - b.previousClosingRank;
        if (sortBy === 'HIGHEST_CLOSE') return b.previousClosingRank - a.previousClosingRank;
        if (sortBy === 'NAME') return a.instituteName.localeCompare(b.instituteName);
        if (sortBy === 'NIRF') return (a.nirfRank || 999) - (b.nirfRank || 999);
        return b.chancePercentage - a.chancePercentage;
      });
  }, [
    prediction.colleges,
    selectedChance,
    selectedCategories,
    selectedQuotas,
    selectedTypes,
    homeStateFilter,
    searchQuery,
    sortBy
  ]);

  const handleToggleCompare = (college: CollegePredictionItem) => {
    const exists = comparedColleges.some((c) => c.id === college.id);
    if (exists) {
      setComparedColleges(comparedColleges.filter((c) => c.id !== college.id));
    } else {
      if (comparedColleges.length >= 4) {
        toast.error('You can compare a maximum of 4 colleges at once.');
        return;
      }
      setComparedColleges([...comparedColleges, college]);
      toast.success(`Added ${college.instituteName} to comparison.`);
    }
  };

  const handleSavePrediction = () => {
    try {
      const savedList = JSON.parse(localStorage.getItem('saved_predictions') || '[]');
      savedList.unshift({
        id: `pred-${Date.now()}`,
        date: new Date().toISOString(),
        exam: prediction.exam.name,
        rank: prediction.rankPrediction.estimatedRank,
        totalColleges: prediction.totalColleges
      });
      localStorage.setItem('saved_predictions', JSON.stringify(savedList.slice(0, 10)));
      setIsSaved(true);
      toast.success('Prediction successfully saved to your browser session!');
    } catch (e) {
      toast.success('Prediction saved!');
    }
  };

  const handleExportCsv = () => {
    const headers = ['Institute', 'Branch', 'Type', 'Chance', 'Closing Rank', 'Your Rank', 'State', 'Quota'];
    const rows = filteredColleges.map((c) => [
      `"${c.instituteName}"`,
      `"${c.branch}"`,
      c.instituteType,
      c.chance,
      c.previousClosingRank,
      c.candidateRank,
      c.state,
      c.quota
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TestExplorer_${prediction.exam.name}_Colleges_${Date.now()}.csv`;
    a.click();
    toast.success('CSV dataset downloaded!');
  };

  return (
    <div className="w-full mt-6 sm:mt-8">
      {/* 1. TOP SUMMARY CARDS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 mb-6">
        {/* Total */}
        <button
          type="button"
          onClick={() => setSelectedChance('ALL')}
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-left border-2 transition-all cursor-pointer ${
            selectedChance === 'ALL'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white text-gray-900 border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xl sm:text-2xl font-black">{prediction.totalColleges}</span>
            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block opacity-80">
            Total Options
          </span>
        </button>

        {/* Safe */}
        <button
          type="button"
          onClick={() => setSelectedChance('HIGH')}
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-left border-2 transition-all cursor-pointer ${
            selectedChance === 'HIGH'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-emerald-50/70 text-emerald-950 border-emerald-200/80 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xl sm:text-2xl font-black">{prediction.summary.highChanceCount}</span>
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700 stroke-[3]" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block opacity-90">
            ✓ Safe Options
          </span>
        </button>

        {/* Target */}
        <button
          type="button"
          onClick={() => setSelectedChance('MODERATE')}
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-left border-2 transition-all cursor-pointer ${
            selectedChance === 'MODERATE'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-blue-50/70 text-blue-950 border-blue-200/80 hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xl sm:text-2xl font-black">{prediction.summary.moderateChanceCount}</span>
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block opacity-90">
            Target Options
          </span>
        </button>

        {/* Ambitious */}
        <button
          type="button"
          onClick={() => setSelectedChance('AMBITIOUS')}
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl text-left border-2 transition-all cursor-pointer ${
            selectedChance === 'AMBITIOUS'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md'
              : 'bg-amber-50/70 text-amber-950 border-amber-200/80 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xl sm:text-2xl font-black">{prediction.summary.ambitiousCount}</span>
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider block opacity-90">
            ↑ Ambitious Options
          </span>
        </button>
      </div>

      {/* Action Toolbar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <span className="text-xs font-bold text-gray-500">
            Showing <strong className="text-gray-900">{filteredColleges.length}</strong> matching programs for{' '}
            <strong className="text-blue-600">{prediction.exam.name}</strong> • AIR: ~{prediction.rankPrediction.estimatedRank.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="md:hidden px-3.5 py-2 bg-gray-100 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          <button
            onClick={() => onOpenPreferenceList(prediction.colleges)}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            Preference List
          </button>

          {comparedColleges.length > 0 && (
            <button
              onClick={() => onOpenCompare(comparedColleges)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm animate-pulse"
            >
              Compare ({comparedColleges.length})
            </button>
          )}

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            title="Download CSV"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          <button
            onClick={onOpenShare}
            className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share
          </button>
        </div>
      </div>

      {/* 2. TWO-COLUMN MAIN BODY (Left Sidebar + Right Cards Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* LEFT FILTER SIDEBAR */}
        <aside
          className={`md:col-span-1 bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-xs space-y-6 md:sticky md:top-20 ${
            isMobileFilterOpen ? 'block' : 'hidden md:block'
          }`}
        >
          {/* Header with Reset */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h4 className="text-sm font-black text-gray-900 tracking-tight">Filters</h4>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>

          {/* Search inside sidebar */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
              Search College / Branch
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Bombay, CSE, AI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
              Category
            </label>
            <div className="space-y-1.5">
              {categoryOptions.map((cat) => (
                <label
                  key={cat.value}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer hover:text-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.value)}
                    onChange={() => toggleCategory(cat.value)}
                    className="w-4 h-4 text-blue-600 rounded-sm border-gray-300 focus:ring-blue-500"
                  />
                  <span>{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quota Filter */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
              Quota
            </label>
            <div className="space-y-1.5">
              {quotaOptions.map((q) => (
                <label
                  key={q.value}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer hover:text-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedQuotas.includes(q.value)}
                    onChange={() => toggleQuota(q.value)}
                    className="w-4 h-4 text-blue-600 rounded-sm border-gray-300 focus:ring-blue-500"
                  />
                  <span>{q.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Home State (HS Quota) */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
              Home State (HS Quota)
            </label>
            <select
              value={homeStateFilter}
              onChange={(e) => setHomeStateFilter(e.target.value)}
              className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:border-blue-600 focus:outline-hidden"
            >
              <option value="All">All States / Locations</option>
              {INDIAN_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Institute Type */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
              Institute Type
            </label>
            <div className="space-y-1.5">
              {availableTypes.map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer hover:text-gray-900"
                >
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(t)}
                    onChange={() => toggleType(t)}
                    className="w-4 h-4 text-blue-600 rounded-sm border-gray-300 focus:ring-blue-500"
                  />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort By Radios */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
              Sort By
            </label>
            <div className="space-y-1.5">
              {[
                { label: 'Best Match', value: 'BEST' },
                { label: 'Lowest Closing Rank', value: 'LOWEST_CLOSE' },
                { label: 'Highest Closing Rank', value: 'HIGHEST_CLOSE' },
                { label: 'NIRF Ranking', value: 'NIRF' },
                { label: 'Institute Name A–Z', value: 'NAME' }
              ].map((s) => (
                <label
                  key={s.value}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer hover:text-gray-900"
                >
                  <input
                    type="radio"
                    name="sortBy"
                    value={s.value}
                    checked={sortBy === s.value}
                    onChange={() => setSortBy(s.value as any)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT CONTENT: COLLEGE CARDS GRID */}
        <div className="md:col-span-3 space-y-4">
          {filteredColleges.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredColleges.slice(0, visibleCount).map((col) => (
                  <CollegeCard
                    key={col.id}
                    college={col}
                    onViewDetails={onViewDetails}
                    onToggleCompare={handleToggleCompare}
                    isCompared={comparedColleges.some((c) => c.id === col.id)}
                  />
                ))}
              </div>

              {/* Load More Button for 400+ options */}
              {visibleCount < filteredColleges.length && (
                <div className="text-center pt-6">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 30)}
                    className="px-8 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-900 font-bold text-xs rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    Load More Colleges ({filteredColleges.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty state */
            <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-gray-800">
                No Colleges Found for Current Filters
              </h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                Try clearing your search query or resetting the category/quota filters to view all matching options.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
