'use client'

import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, FileText, X, Layers, AlertCircle, ChevronDown, ChevronUp, Folder, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { createTopicAction, updateTopicAction, deleteTopicAction, bulkCreateTopicsAction } from '@/app/dashboard/admin/topics/actions'

export default function TopicManager({ topics, chapters, subjects, courses }: { topics: any[], chapters: any[], subjects: any[], courses: any[] }) {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ mode: 'create' | 'edit', data?: any } | null>(null)
  const [createTab, setCreateTab] = useState<'single' | 'bulk'>('single')
  
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [bulkAllChapters, setBulkAllChapters] = useState(false)

  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({})
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({})
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({})

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }))
  }

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects(prev => ({ ...prev, [subjectId]: !prev[subjectId] }))
  }

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({ ...prev, [chapterId]: !prev[chapterId] }))
  }

  const openModal = (mode: 'create' | 'edit', data?: any) => {
    if (mode === 'edit' && data) {
      const chapter = chapters.find(ch => ch.id === data.chapter_id)
      const subject = subjects?.find(s => s.id === chapter?.subject_id)
      setSelectedCourseId(subject?.course_id || '')
      setSelectedSubjectId(subject?.id || '')
    } else {
      setSelectedCourseId('')
      setSelectedSubjectId('')
      setBulkAllChapters(false)
    }
    setModal({ mode, data })
  }

  const visibleSubjects = selectedCourseId 
    ? (subjects || []).filter(s => s.course_id === selectedCourseId) 
    : []

  const visibleChapters = selectedSubjectId
    ? chapters.filter(c => c.subject_id === selectedSubjectId)
    : []
  
  // Filtering
  const filteredTopics = topics.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.chapter_name.toLowerCase().includes(search.toLowerCase()) ||
    t.subject_name.toLowerCase().includes(search.toLowerCase())
  )

  // Grouping by Course -> Subject -> Chapter
  const groupedData = courses.map(course => {
    const courseSubjects = (subjects || []).filter(s => s.course_id === course.id)
    
    return {
      id: course.id,
      title: course.title,
      subjects: courseSubjects.map(sub => {
        const subjectChapters = chapters.filter(c => c.subject_id === sub.id)
        
        return {
          id: sub.id,
          title: sub.title,
          chapters: subjectChapters.map(chap => {
            const chapterTopics = filteredTopics.filter(t => t.chapter_id === chap.id)
            return {
              id: chap.id,
              name: chap.name,
              topics: chapterTopics
            }
          }).filter(chap => chap.topics.length > 0)
        }
      }).filter(sub => sub.chapters.length > 0)
    }
  }).filter(course => course.subjects.length > 0)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const isEdit = modal?.mode === 'edit'
    
    const toastId = toast.loading(isEdit ? 'Updating topic...' : 'Creating topic...')
    const result = isEdit 
      ? await updateTopicAction(formData)
      : await createTopicAction(formData)

    toast.dismiss(toastId)
    if (result && 'error' in result) {
      toast.error(result.error)
    } else {
      toast.success(isEdit ? 'Topic updated successfully' : 'Topic created successfully')
      setModal(null)
      setSelectedCourseId('')
      setSelectedSubjectId('')
      setBulkAllChapters(false)
    }
  }

  const handleDelete = async (e: React.FormEvent, id: string) => {
    e.preventDefault()
    if (!confirm('Are you sure you want to delete this topic?')) return

    const formData = new FormData()
    formData.append('id', id)
    
    const toastId = toast.loading('Deleting topic...')
    const result = await deleteTopicAction(formData)
    
    toast.dismiss(toastId)
    if (result && 'error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Topic deleted successfully')
    }
  }

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    const chapterId = formData.get('chapter_id') as string
    const file = formData.get('csv_file') as File
    
    if (!bulkAllChapters && !chapterId) {
      toast.error('Please select a chapter')
      return
    }
    if (!file) {
      toast.error('Please upload a CSV file')
      return
    }

    const toastId = toast.loading('Parsing CSV file...')
    
    try {
      const text = await file.text()
      const lines = text.split('\n').filter(l => l.trim() !== '')
      
      if (lines.length < 2) {
        toast.dismiss(toastId)
        toast.error('CSV must contain a header row and at least one data row')
        return
      }
      
      const topicsToCreate = []
      
      for (let i = 1; i < lines.length; i++) {
        const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        if (!match) continue
        
        const row = match.map(val => val.replace(/^"|"$/g, '').trim())
        
        if (bulkAllChapters) {
          const chapterName = row[0]
          const name = row[1]
          if (!chapterName || !name) continue
          
          const foundChapter = visibleChapters.find(c => c.name.toLowerCase() === chapterName.toLowerCase())
          if (!foundChapter) continue
          
          const description = row[2] || ''
          const order = row[3] || '0'
          
          topicsToCreate.push({
            chapter_id: foundChapter.id,
            name,
            description,
            order,
            status: 'active'
          })
        } else {
          const name = row[0]
          if (!name) continue
          
          const description = row[1] || ''
          const order = row[2] || '0'
          
          topicsToCreate.push({
            chapter_id: chapterId,
            name,
            description,
            order,
            status: 'active'
          })
        }
      }

      if (topicsToCreate.length === 0) {
        toast.dismiss(toastId)
        toast.error('No valid topics found in CSV (Check if chapter names match)')
        return
      }

      toast.loading(`Creating ${topicsToCreate.length} topics...`, { id: toastId })
      
      const result = await bulkCreateTopicsAction(topicsToCreate)
      
      toast.dismiss(toastId)
      if (result && 'error' in result) {
        toast.error(result.error)
      } else {
        toast.success(`Successfully added ${topicsToCreate.length} topics`)
        setModal(null)
        setSelectedCourseId('')
        setSelectedSubjectId('')
        setBulkAllChapters(false)
      }
    } catch (err) {
      console.error(err)
      toast.dismiss(toastId)
      toast.error('Failed to parse CSV file')
    }
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search topics by name, chapter, or subject..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
          />
        </div>
        <button 
          onClick={() => openModal('create')}
          className="w-full md:w-auto bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> Add Topic
        </button>
      </div>

      {/* Topics List */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {filteredTopics.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No topics found</h3>
            <p className="text-gray-500 text-sm">Create your first topic to get started.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4">
            {groupedData.map(course => (
              <div key={course.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <div 
                  className="bg-gray-100 px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => toggleCourse(course.id)}
                >
                  <h2 className="font-black text-gray-900 text-lg flex items-center gap-2">
                    <Folder className="w-5 h-5 text-indigo-600" />
                    {course.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded-lg">
                      {course.subjects.length} Subjects
                    </span>
                    {expandedCourses[course.id] ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                  </div>
                </div>

                {expandedCourses[course.id] && (
                  <div className="flex flex-col border-t border-gray-200 bg-gray-50 p-3 gap-3">
                    {course.subjects.map(sub => (
                      <div key={sub.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                        <div 
                          className="bg-white px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleSubject(sub.id)}
                        >
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-600" />
                            <span className="truncate max-w-[200px] sm:max-w-md">{sub.title}</span>
                          </h3>
                          <div className="flex items-center gap-3">
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-bold">
                              {sub.chapters.length} Chapters
                            </span>
                            {expandedSubjects[sub.id] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </div>
                        </div>

                        {expandedSubjects[sub.id] && (
                          <div className="flex flex-col border-t border-gray-100 bg-gray-50/50 p-3 gap-2">
                            {sub.chapters.map(chapter => (
                              <div key={chapter.id} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                                <div 
                                  className="bg-white px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                                  onClick={() => toggleChapter(chapter.id)}
                                >
                                  <h4 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                                    <Layers className="w-3.5 h-3.5 text-orange-600" />
                                    {chapter.name}
                                  </h4>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-lg font-bold">
                                      {chapter.topics.length} Topics
                                    </span>
                                    {expandedChapters[chapter.id] ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                                  </div>
                                </div>

                                {expandedChapters[chapter.id] && (
                                  <div className="divide-y divide-gray-50 border-t border-gray-50 bg-white">
                                    {chapter.topics.map(topic => (
                                      <div key={topic.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/80 transition-colors group">
                                        <div className="flex items-start gap-4">
                                          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                          </div>
                                          <div>
                                            <h3 className="text-base font-bold text-gray-900 group-hover:text-green-600 transition-colors">{topic.name}</h3>
                                            <div className="flex items-center gap-2 mt-1 text-sm font-medium">
                                              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                                {topic.questions_count} Questions
                                              </span>
                                              {!topic.status || topic.status === 'active' ? (
                                                <span className="ml-2 w-2 h-2 rounded-full bg-green-500"></span>
                                              ) : (
                                                <span className="ml-2 w-2 h-2 rounded-full bg-red-500"></span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 sm:self-center self-end">
                                          <button 
                                            onClick={() => openModal('edit', topic)}
                                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                          >
                                            <Pencil className="w-4 h-4" />
                                          </button>
                                          <form onSubmit={(e) => handleDelete(e, topic.id)}>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </form>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900">
                {modal.mode === 'edit' ? 'Edit Topic' : 'Add New Topic'}
              </h3>
              <button onClick={() => { setModal(null); setSelectedCourseId(''); setSelectedSubjectId(''); setBulkAllChapters(false); }} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {modal.mode === 'create' && (
              <div className="px-6 pt-4">
                <div className="flex bg-gray-100 p-1 rounded-xl w-full">
                  <button
                    type="button"
                    onClick={() => setCreateTab('single')}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${createTab === 'single' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Single Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreateTab('bulk')}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${createTab === 'bulk' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Bulk Upload (CSV)
                  </button>
                </div>
              </div>
            )}

            {modal.mode === 'create' && createTab === 'bulk' ? (
              <form onSubmit={handleBulkUpload} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Target Course</label>
                  <select 
                    value={selectedCourseId}
                    onChange={(e) => {
                      setSelectedCourseId(e.target.value)
                      setSelectedSubjectId('')
                    }}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none appearance-none bg-white font-medium text-gray-800"
                  >
                    <option value="" disabled>Select a Course</option>
                    {(courses || []).map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Target Subject</label>
                  <select 
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    required
                    disabled={!selectedCourseId}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none appearance-none bg-white font-medium text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="" disabled>Select a Subject</option>
                    {visibleSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.title}</option>
                    ))}
                  </select>
                </div>

                {selectedSubjectId && (
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="bulkAllChapters"
                      checked={bulkAllChapters}
                      onChange={(e) => setBulkAllChapters(e.target.checked)}
                      className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500 border-gray-300"
                    />
                    <label htmlFor="bulkAllChapters" className="text-sm font-bold text-gray-700 leading-tight">
                      Upload across all chapters in this subject at once
                      <p className="text-xs font-normal text-gray-500 mt-1">If checked, your CSV must include a 'chapter_name' column.</p>
                    </label>
                  </div>
                )}

                {!bulkAllChapters && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Target Chapter</label>
                    <select 
                      name="chapter_id" 
                      required={!bulkAllChapters}
                      defaultValue=""
                      disabled={!selectedSubjectId}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none appearance-none bg-white font-medium text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="" disabled>Select a Chapter</option>
                      {visibleChapters.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">CSV File</label>
                  <input 
                    type="file" 
                    name="csv_file"
                    accept=".csv"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none font-medium text-gray-800"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Format: {bulkAllChapters ? <b>chapter_name, name, description, order</b> : <b>name, description, order</b>} (Header row required)
                  </p>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl">
                    Upload and Create
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSave} className="p-6 space-y-5">
                {modal.mode === 'edit' && <input type="hidden" name="id" value={modal.data?.id} />}
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Course</label>
                <select 
                  value={selectedCourseId}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value)
                    setSelectedSubjectId('')
                  }}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none appearance-none bg-white font-medium text-gray-800"
                >
                  <option value="" disabled>Select a Course</option>
                  {(courses || []).map(course => (
                    <option key={course.id} value={course.id}>{course.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Subject</label>
                <select 
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  required
                  disabled={!selectedCourseId}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none appearance-none bg-white font-medium text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="" disabled>Select a Subject</option>
                  {visibleSubjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Chapter</label>
                <select 
                  name="chapter_id" 
                  defaultValue={modal.data?.chapter_id || ''} 
                  required
                  disabled={!selectedSubjectId}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none appearance-none bg-white font-medium text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="" disabled>Select a Chapter</option>
                  {visibleChapters.map(ch => (
                    <option key={ch.id} value={ch.id}>{ch.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Topic Name</label>
                <input 
                  name="name"
                  defaultValue={modal.data?.name}
                  placeholder="e.g. Arrays"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none font-medium text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description (Optional)</label>
                <textarea 
                  name="description"
                  defaultValue={modal.data?.description}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none font-medium text-gray-800"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Display Order</label>
                  <input 
                    name="order"
                    type="number"
                    defaultValue={modal.data?.order || 0}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none font-medium text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Status</label>
                  <select 
                    name="status"
                    defaultValue={modal.data?.status || 'active'}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 outline-none font-medium text-gray-800"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl">
                  {modal.mode === 'edit' ? 'Save Changes' : 'Create Topic'}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
