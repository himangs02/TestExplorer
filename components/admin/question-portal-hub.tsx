'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Layers, HelpCircle, ArrowUpRight, UploadCloud, Sparkles } from 'lucide-react'
import UniversalBulkUploadModal from '@/components/admin/universal-bulk-upload-modal'
import { useRouter } from 'next/navigation'

interface QuestionPortalHubProps {
  subjectsCount: number
  chaptersCount: number
  questionsCount: number
}

export default function QuestionPortalHub({
  subjectsCount,
  chaptersCount,
  questionsCount
}: QuestionPortalHubProps) {
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const router = useRouter()

  const sections = [
    {
      title: 'Subjects',
      description: 'Manage root-level subjects and view assigned chapters.',
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      count: subjectsCount,
      link: '/dashboard/admin/subjects'
    },
    {
      title: 'Chapters',
      description: 'Manage chapters assigned to subjects.',
      icon: Layers,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      count: chaptersCount,
      link: '/dashboard/admin/question-portal/chapters'
    },
    {
      title: 'Questions',
      description: 'Manage all chapter practice questions in the portal.',
      icon: HelpCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      count: questionsCount,
      link: '/dashboard/admin/question-portal/questions'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header with Universal Bulk Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Question Portal</h1>
          <p className="text-gray-500 font-medium">Manage Subjects, Chapters, and Questions.</p>
        </div>

        <button
          onClick={() => setIsBulkOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs border border-gray-200 hover:border-black shadow-xs transition-all cursor-pointer shrink-0"
        >
          <UploadCloud className="w-4 h-4 text-gray-600" />
          <span>Universal Bulk Upload</span>
        </button>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Universal Bulk Upload Minimalist Card */}
        <button
          onClick={() => setIsBulkOpen(true)}
          className="group text-left block w-full cursor-pointer"
        >
          <div className="bg-white p-7 rounded-3xl border border-gray-200 shadow-xs hover:border-black hover:shadow-sm transition-all flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-black group-hover:border-black group-hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 font-bold text-[10px] uppercase tracking-wider mb-2">
                Mixed Courses
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Universal Bulk Upload</h2>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Auto-detect & route mixed JEE, CUET questions across subjects & chapters.
              </p>
            </div>
          </div>
        </button>

        {/* Add & Manage Chapters Card */}
        <Link href="/dashboard/admin/question-portal/chapters" className="group block">
          <div className="bg-white p-7 rounded-3xl border border-gray-200 shadow-xs hover:border-purple-500 hover:shadow-sm transition-all flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-7 h-7" />
              </div>
              <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Add & Manage Chapters</h2>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Create and organize chapters under course subjects.
              </p>
            </div>
          </div>
        </Link>

        {/* Add & Manage Questions Card */}
        <Link href="/dashboard/admin/question-portal/questions" className="group block">
          <div className="bg-white p-7 rounded-3xl border border-gray-200 shadow-xs hover:border-green-500 hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <HelpCircle className="w-7 h-7" />
              </div>
              <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-green-600 group-hover:border-green-600 group-hover:text-white transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Add & Manage Questions</h2>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Upload single or bulk questions with answers & solutions.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Content Overview Counters */}
      <h3 className="text-xl font-bold text-gray-900 mb-4">Content Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, idx) => (
          <Link key={idx} href={section.link} className="group block">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs hover:border-black transition-all relative overflow-hidden h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${section.bg} ${section.color}`}>
                    <section.icon className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">{section.title}</h3>
                <p className="text-xs text-gray-500 font-medium mb-4">{section.description}</p>
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">{section.count.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-1">Total {section.title}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Universal Bulk Upload Modal */}
      <UniversalBulkUploadModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        onSuccess={() => {
          router.refresh()
        }}
      />
    </div>
  )
}
