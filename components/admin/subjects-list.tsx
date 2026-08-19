'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Library, BookOpen, Search } from 'lucide-react'
import { deleteSubjectAction } from '@/app/dashboard/admin/subjects/actions'

interface Course {
  id: string
  title: string
}

interface Subject {
  id: string
  title: string
  course_id: string | null
  courses?: {
    id?: string
    title?: string
  } | null
}

export default function SubjectsList({
  subjects,
  courses
}: {
  subjects: Subject[]
  courses: Course[]
}) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL')
  const [search, setSearch] = useState('')

  // Calculate subject counts per course
  const courseCounts: Record<string, number> = {
    ALL: subjects.length
  }
  
  for (const sub of subjects) {
    const cId = sub.course_id || 'UNASSIGNED'
    courseCounts[cId] = (courseCounts[cId] || 0) + 1
  }

  // Filter subjects based on course and search
  const filteredSubjects = subjects.filter((subject) => {
    // Course filter
    if (selectedCourseId !== 'ALL') {
      if (subject.course_id !== selectedCourseId) return false
    }

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase().trim()
      const titleMatch = subject.title.toLowerCase().includes(query)
      const courseMatch = subject.courses?.title?.toLowerCase().includes(query)
      if (!titleMatch && !courseMatch) return false
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* FILTER CONTROLS: COURSE PILLS & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* COURSE FILTER PILLS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCourseId('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCourseId === 'ALL'
                ? 'bg-black text-white shadow-sm'
                : 'bg-white text-gray-600 hover:text-black hover:bg-gray-50 border border-gray-200'
            }`}
          >
            All Courses
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
              selectedCourseId === 'ALL' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
              {courseCounts.ALL || 0}
            </span>
          </button>

          {courses.map((course) => {
            const count = courseCounts[course.id] || 0
            const isSelected = selectedCourseId === course.id

            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setSelectedCourseId(course.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-black text-white shadow-sm'
                    : 'bg-white text-gray-600 hover:text-black hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {course.title}
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                  isSelected ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* SEARCH BAR */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subjects..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-black transition-all"
          />
        </div>
      </div>

      {/* SUBJECTS LIST */}
      <div className="grid gap-4">
        {filteredSubjects.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white">
            <p className="text-gray-400 font-medium">
              {search.trim() || selectedCourseId !== 'ALL'
                ? 'No subjects matching the selected filter.'
                : 'No subjects found. Add one to get started.'}
            </p>
          </div>
        ) : (
          filteredSubjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white p-6 rounded-2xl border border-gray-200 flex justify-between items-center group hover:border-blue-400 transition-all shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
                  <Library className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{subject.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-xs uppercase tracking-wide">
                      <BookOpen className="w-3 h-3" />
                      {subject.courses?.title || 'Unknown Course'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/admin/subjects/${subject.id}/edit`}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil className="w-5 h-5" />
                </Link>
                <form action={deleteSubjectAction}>
                  <input type="hidden" name="id" value={subject.id} />
                  <button
                    type="submit"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
