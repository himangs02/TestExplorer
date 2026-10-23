'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Search, X, ArrowUpRight, BookOpen, Filter, ChevronRight } from 'lucide-react'
import { getCategoryIcon } from '@/lib/icons'

interface CourseItem {
  id: string
  title: string
  slug: string | null
  description: string | null
}

interface CategoryItem {
  id: string
  title: string
  description: string | null
  bg_color: string | null
  icon_key: string | null
  courses?: CourseItem[]
}

interface Props {
  initialCategories: CategoryItem[]
}

export default function CategorySearchExplorer({ initialCategories }: Props) {
  const searchParams = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('All')

  // Auto-focus if arriving from "Search exams" navbar icon
  useEffect(() => {
    if (searchParams.get('search') === '1' || searchParams.has('q')) {
      const q = searchParams.get('q') || ''
      if (q) setQuery(q)
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 150)
    }
  }, [searchParams])

  const popularTags = ['All', 'Engineering', 'Medical', 'Management', 'Law', 'CUET', 'Arts & Humanities']

  const filteredData = useMemo(() => {
    const q = query.trim().toLowerCase()

    return initialCategories.map(cat => {
      const catMatchesTag = selectedTag === 'All' || 
        cat.title.toLowerCase().includes(selectedTag.toLowerCase()) ||
        cat.description?.toLowerCase().includes(selectedTag.toLowerCase())

      if (!catMatchesTag && !q) return null

      if (!q) {
        return {
          ...cat,
          matchedCourses: cat.courses || []
        }
      }

      const catMatchesQuery = cat.title.toLowerCase().includes(q) || cat.description?.toLowerCase().includes(q)
      const matchingCourses = (cat.courses || []).filter(c => 
        c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q)
      )

      if (catMatchesQuery || matchingCourses.length > 0) {
        return {
          ...cat,
          matchedCourses: matchingCourses.length > 0 ? matchingCourses : (cat.courses || [])
        }
      }

      return null
    }).filter(Boolean) as (CategoryItem & { matchedCourses: CourseItem[] })[]
  }, [initialCategories, query, selectedTag])

  return (
    <div className="space-y-8">
      {/* Search Bar + Quick Filter Chips */}
      <div className="bg-white rounded-3xl border-2 border-black p-4 sm:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exams, streams, engineering, medical, CUET, law..."
            className="w-full h-14 pl-12 pr-12 text-base sm:text-lg font-bold text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-black focus:outline-hidden transition-all placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-black rounded-lg transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1 hidden sm:inline-block">
            Quick Filters:
          </span>
          {popularTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag)
                if (tag === 'All') setQuery('')
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selectedTag === tag && !query
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black'
              }`}
            >
              {tag}
            </button>
          ))}
          {query && (
            <span className="ml-auto text-xs font-bold text-blue-600">
              Found {filteredData.reduce((acc, c) => acc + (c.matchedCourses?.length || 1), 0)} results
            </span>
          )}
        </div>
      </div>

      {/* Grid of Results */}
      {filteredData.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No matching exams found</h3>
          <p className="text-sm text-gray-500 mb-4">
            Try adjusting your search terms or select "All" from the filters above.
          </p>
          <button
            onClick={() => { setQuery(''); setSelectedTag('All') }}
            className="px-5 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredData.map((cat) => {
            const Icon = getCategoryIcon(cat.icon_key)
            const rawBg = cat.bg_color || 'bg-gray-50'
            const isArbitrary = rawBg.startsWith('bg-[#') && rawBg.endsWith(']')
            const hexColor = isArbitrary ? rawBg.slice(4, -1) : null
            const finalClass = hexColor ? '' : rawBg
            const finalStyle = hexColor ? { backgroundColor: hexColor } : undefined

            return (
              <div
                key={cat.id}
                className="group relative block"
              >
                <div 
                  className={`
                    relative z-10 h-full p-7 rounded-[2rem] border-2 border-black 
                    transition-all duration-300 ease-out flex flex-col justify-between
                    hover:-translate-y-2 hover:translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                    ${finalClass} 
                  `}
                  style={finalStyle}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-white border-2 border-black rounded-2xl flex items-center justify-center">
                        <Icon className="w-6 h-6 text-black" />
                      </div>
                      <Link
                        href={`/categories/${cat.id}`}
                        className="bg-white rounded-full p-2.5 border-2 border-black transition-transform hover:rotate-45"
                        title={`Browse all ${cat.title} exams`}
                      >
                        <ArrowUpRight className="w-4 h-4 text-black" />
                      </Link>
                    </div>

                    <Link href={`/categories/${cat.id}`}>
                      <h3 className="text-2xl font-black text-black mb-1.5 tracking-tight hover:underline">
                        {cat.title}
                      </h3>
                    </Link>
                    <p className="text-black/70 font-bold text-xs sm:text-sm mb-4">
                      {cat.description}
                    </p>
                  </div>

                  {/* Nested Quick Exam Pills if courses exist */}
                  {cat.matchedCourses && cat.matchedCourses.length > 0 && (
                    <div className="pt-4 border-t border-black/10 mt-auto space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">
                        Available Exams ({cat.matchedCourses.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.matchedCourses.slice(0, 4).map(course => (
                          <Link
                            key={course.id}
                            href={`/exams/${course.slug || course.id}`}
                            className="px-2.5 py-1 bg-white/80 hover:bg-white border border-black/30 rounded-lg text-xs font-bold text-black transition-all flex items-center gap-1 hover:shadow-xs"
                          >
                            <span>{course.title}</span>
                            <ChevronRight className="w-3 h-3 text-black/50" />
                          </Link>
                        ))}
                        {cat.matchedCourses.length > 4 && (
                          <Link
                            href={`/categories/${cat.id}`}
                            className="px-2 py-1 bg-black text-white rounded-lg text-[10px] font-black hover:bg-gray-800 transition-colors"
                          >
                            +{cat.matchedCourses.length - 4} more
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
