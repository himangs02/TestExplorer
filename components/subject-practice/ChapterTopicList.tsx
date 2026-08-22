'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  PlayCircle, 
  ArrowRight,
  FolderOpen,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Target
} from 'lucide-react'

interface Chapter {
  id: string
  name: string
  description: string | null
  order: number
  _count?: {
    questions: number
  }
}

interface ChapterTopicListProps {
  chapters: Chapter[]
  categoryId: string
  courseId: string
  subjectId: string
}

export default function ChapterTopicList({
  chapters,
  categoryId,
  courseId,
  subjectId
}: ChapterTopicListProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter chapters by search query
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return chapters
    const query = searchQuery.toLowerCase()

    return chapters.filter(
      (ch) =>
        ch.name.toLowerCase().includes(query) ||
        (ch.description && ch.description.toLowerCase().includes(query))
    )
  }, [chapters, searchQuery])

  if (!chapters || chapters.length === 0) {
    return (
      <div className="p-12 border border-gray-200 bg-white rounded-3xl text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">No Chapters Available Yet</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Our team is currently preparing curated chapters and practice questions for this subject. Please check back soon!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Bar & Chapter Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search chapters (e.g. Thermodynamics, Organic Chemistry)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 bg-gray-200/60 px-1.5 py-0.5 rounded-md"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0 px-2">
          <span className="text-xs font-bold text-gray-500">
            {filteredChapters.length} {filteredChapters.length === 1 ? 'Chapter' : 'Chapters'}
          </span>
        </div>
      </div>

      {/* Chapters Direct List */}
      {filteredChapters.length === 0 ? (
        <div className="p-10 border border-gray-200 bg-white rounded-2xl text-center">
          <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <h4 className="font-bold text-gray-800 text-base">No matching chapters</h4>
          <p className="text-gray-400 text-xs mt-1">Try adjusting your search terms</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredChapters.map((chapter, index) => {
            const chapterQuestionCount = chapter._count?.questions || 0
            const hasQuestions = chapterQuestionCount > 0

            return (
              <div
                key={chapter.id}
                className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                {/* Chapter Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center font-black text-lg shrink-0 transition-colors shadow-xs">
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  <div className="space-y-1 flex-1">
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                      Chapter {index + 1}
                    </span>

                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {chapter.name}
                    </h3>

                    {chapter.description && (
                      <p className="text-gray-500 text-xs sm:text-sm font-normal line-clamp-2 leading-relaxed">
                        {chapter.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Direct Action Button */}
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  {hasQuestions ? (
                    <Link
                      href={`/subject-practice/${categoryId}/${courseId}/${subjectId}/practice?chapterId=${chapter.id}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Start Practice</span>
                    </Link>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
                      <Clock className="w-3.5 h-3.5" /> Coming Soon
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Student Study Tips Card */}
      <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Target className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
              <span>Master One Chapter at a Time</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white px-2 py-0.5 rounded-full">
                Practice Strategy
              </span>
            </h4>
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
              Complete each chapter's questions to build strong fundamental concepts. Review immediate explanations for every question to eliminate doubts before moving to full test series!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


