'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, BookOpen, Layers, FileText, Search } from 'lucide-react'

export default function TreeView({ subjects }: { subjects: any[] }) {
  const [openSubjects, setOpenSubjects] = useState<Record<string, boolean>>({})
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({})
  const [search, setSearch] = useState('')

  const toggleSubject = (id: string) => setOpenSubjects(p => ({ ...p, [id]: !p[id] }))
  const toggleChapter = (id: string) => setOpenChapters(p => ({ ...p, [id]: !p[id] }))

  const filteredSubjects = subjects.filter(sub => {
    if (!search) return true
    const term = search.toLowerCase()
    if (sub.title.toLowerCase().includes(term)) return true
    if (sub.chapters.some((ch: any) => ch.name.toLowerCase().includes(term))) return true
    if (sub.chapters.some((ch: any) => ch.topics.some((t: any) => t.name.toLowerCase().includes(term)))) return true
    return false
  })

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden pb-20">
      <div className="p-4 border-b border-gray-100 bg-gray-50/50">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search hierarchy..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="p-4 space-y-2">
        {filteredSubjects.length === 0 && (
          <p className="text-gray-500 text-sm italic p-4 text-center">No matches found.</p>
        )}
        {filteredSubjects.map(subject => {
          const isSubOpen = openSubjects[subject.id] || !!search // Auto-open if searching
          
          return (
            <div key={subject.id} className="border border-gray-100 rounded-2xl overflow-hidden transition-all">
              {/* SUBJECT LEVEL */}
              <button 
                onClick={() => toggleSubject(subject.id)}
                className="w-full flex items-center justify-between p-3 bg-white hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {isSubOpen ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-gray-900">{subject.title}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] font-bold px-2 py-1 bg-purple-50 text-purple-600 rounded uppercase">{subject._count.chapters} Chapters</span>
                  <span className="text-[10px] font-bold px-2 py-1 bg-orange-50 text-orange-600 rounded uppercase">{subject._count.topics} Topics</span>
                  <span className="text-[10px] font-bold px-2 py-1 bg-green-50 text-green-600 rounded uppercase">{subject._count.questions} Questions</span>
                </div>
              </button>

              {/* CHAPTER LEVEL */}
              {isSubOpen && (
                <div className="bg-gray-50 border-t border-gray-100 p-2 pl-6 space-y-1">
                  {subject.chapters.length === 0 && <p className="text-xs text-gray-400 p-2 italic">No chapters.</p>}
                  {subject.chapters.map((chapter: any) => {
                    const isChapOpen = openChapters[chapter.id] || !!search

                    return (
                      <div key={chapter.id} className="border border-gray-100 bg-white rounded-xl overflow-hidden">
                        <button 
                          onClick={() => toggleChapter(chapter.id)}
                          className="w-full flex items-center justify-between p-2.5 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            {isChapOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                            <div className="w-6 h-6 bg-purple-50 text-purple-600 rounded flex items-center justify-center">
                              <Layers className="w-3 h-3" />
                            </div>
                            <span className="font-semibold text-gray-800 text-sm">{chapter.name}</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-50 text-orange-600 rounded uppercase">{chapter._count.topics} Topics</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-green-50 text-green-600 rounded uppercase">{chapter._count.questions} Questions</span>
                          </div>
                        </button>

                        {/* TOPIC LEVEL */}
                        {isChapOpen && (
                          <div className="bg-gray-50 border-t border-gray-100 p-2 pl-12 space-y-1">
                            {chapter.topics.length === 0 && <p className="text-xs text-gray-400 p-1 italic">No topics.</p>}
                            {chapter.topics.map((topic: any) => (
                              <div key={topic.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5 text-orange-400" />
                                  <span className="text-xs font-medium text-gray-700">{topic.name}</span>
                                </div>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-green-50 text-green-600 rounded uppercase">{topic._count.questions} Questions</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
