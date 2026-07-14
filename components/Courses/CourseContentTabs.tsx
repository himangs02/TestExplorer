'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, BookOpen, Clock, PlayCircle } from 'lucide-react'

// A slightly softer, complimentary palette for subjects
const SUBJECT_COLORS = [
  'bg-[#E0F7FA] border-[#006064]', // Cyan-ish
  'bg-[#F3E5F5] border-[#4A148C]', // Purple-ish
  'bg-[#FFF3E0] border-[#E65100]', // Orange-ish
  'bg-[#E8F5E9] border-[#1B5E20]', // Green-ish
  'bg-[#FFEBEE] border-[#B71C1C]', // Red-ish
]

export function CourseContentTabs({ 
  subjects, 
  mockTests, 
  courseId 
}: { 
  subjects: any[], 
  mockTests: any[], 
  courseId: string 
}) {
  const [activeTab, setActiveTab] = useState<'subjects' | 'mocks'>('subjects')

  return (
    <div>
      {/* Tabs */}
      <div className="mb-8 inline-flex items-center rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab('subjects')}
          className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'subjects'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Subjects
        </button>
        <button
          onClick={() => setActiveTab('mocks')}
          className={`rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
            activeTab === 'mocks'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Full Mock Tests
        </button>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        {activeTab === 'subjects' ? (
          (!subjects || subjects.length === 0) ? (
            <div className="p-12 text-center border-3 border-dashed border-gray-200 rounded-4xl bg-gray-50">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No subjects have been added to this course yet.</p>
            </div>
          ) : (
            subjects.map((subject, index) => {
              const style = SUBJECT_COLORS[index % SUBJECT_COLORS.length]
              const [bgColor, borderColor] = style.split(' ')

              return (
                <Link 
                  key={subject.id} 
                  href={`/courses/${courseId}/subjects/${subject.id}`}
                  className="group block relative"
                >
                  <div className={`
                    relative z-10 flex flex-col md:flex-row md:items-center justify-between 
                    p-6 md:p-8 rounded-[2rem] border-2 border-black bg-white
                    transition-all duration-300 ease-out
                    group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  `}>
                    <div className="flex items-center gap-6">
                      <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center border-2 
                        ${bgColor} ${borderColor} text-black font-black text-xl shadow-sm
                        group-hover:scale-110 transition-transform duration-300
                      `}>
                        {subject.title.substring(0, 2).toUpperCase()}
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {subject.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            Explore Chapters & Tests
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 md:mt-0 flex items-center justify-end">
                      <ArrowUpRight className="w-6 h-6 text-gray-300 group-hover:text-black transition-colors" />
                    </div>
                  </div>
                </Link>
              )
            })
          )
        ) : (
          (!mockTests || mockTests.length === 0) ? (
            <div className="p-12 text-center border-3 border-dashed border-gray-200 rounded-4xl bg-gray-50">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No full mock tests available for this course yet.</p>
            </div>
          ) : (
            mockTests.map((test) => (
              <div
                key={test.id}
                className="group relative z-10 flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 rounded-[2rem] border-2 border-black bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-start gap-4 sm:items-center">
                  <div className="relative mt-1 shrink-0 sm:mt-0">
                    <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-black bg-orange-400">
                      <div className="h-full w-full bg-emerald-500" style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }} />
                    </div>
                    <div className="absolute inset-0 m-auto flex h-full w-full items-center justify-center text-white drop-shadow-md">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-2">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {test.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {test.duration_minutes || 60}m
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {test.total_marks || 100} Marks
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 md:mt-0">
                  <Link href={`/courses/${courseId}/subjects/${test.subject_id || 'general'}/test/mock/${test.id}`} className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105">
                    Start Test <PlayCircle className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  )
}
