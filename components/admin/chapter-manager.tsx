'use client'

import { useState } from 'react'
import { Search, Plus, Pencil, Trash2, Layers, X, BookOpen, AlertCircle, ChevronDown, ChevronUp, Folder } from 'lucide-react'
import { toast } from 'sonner'
import { createChapterAction, updateChapterAction, deleteChapterAction, bulkCreateChaptersAction } from '@/app/dashboard/admin/chapters/actions'

export default function ChapterManager({ chapters, subjects, courses }: { chapters: any[], subjects: any[], courses: any[] }) {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ mode: 'create' | 'edit', data?: any } | null>(null)
  const [createTab, setCreateTab] = useState<'single' | 'bulk'>('single')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  
  const [expandedCourses, setExpandedCourses] = useState<Record<string, boolean>>({})
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({})

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => ({ ...prev, [courseId]: !prev[courseId] }))
  }

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects(prev => ({ ...prev, [subjectId]: !prev[subjectId] }))
  }

  const openModal = (mode: 'create' | 'edit', data?: any) => {
    if (mode === 'edit' && data) {
      const subject = subjects.find(s => s.id === data.subject_id)
      setSelectedCourseId(subject?.course_id || '')
    } else {
      setSelectedCourseId('')
    }
    setModal({ mode, data })
  }

  const visibleSubjects = selectedCourseId 
    ? subjects.filter(s => s.course_id === selectedCourseId) 
    : []
  
  // Filtering
  const filteredChapters = chapters.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.subject_name.toLowerCase().includes(search.toLowerCase())
  )

  // Grouping by Course -> Subject
  const groupedData = courses.map(course => {
    const courseSubjects = subjects.filter(s => s.course_id === course.id)
    
    return {
      id: course.id,
      title: course.title,
      subjects: courseSubjects.map(sub => {
        const subjectChapters = filteredChapters.filter(c => c.subject_id === sub.id)
        return {
          id: sub.id,
          title: sub.title,
          chapters: subjectChapters
        }
      }).filter(sub => sub.chapters.length > 0)
    }
  }).filter(course => course.subjects.length > 0)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const isEdit = modal?.mode === 'edit'
    
    const toastId = toast.loading(isEdit ? 'Updating chapter...' : 'Creating chapter...')
    const result = isEdit 
      ? await updateChapterAction(formData)
      : await createChapterAction(formData)

    toast.dismiss(toastId)
    if (result && 'error' in result) {
      toast.error(result.error)
    } else {
      toast.success(isEdit ? 'Chapter updated successfully' : 'Chapter created successfully')
      setModal(null)
      setSelectedCourseId('')
    }
  }

  const handleDelete = async (e: React.FormEvent, id: string) => {
    e.preventDefault()
    if (!confirm('Are you sure you want to delete this chapter?')) return

    const formData = new FormData()
    formData.append('id', id)
    
    const toastId = toast.loading('Deleting chapter...')
    const result = await deleteChapterAction(formData)
    
    toast.dismiss(toastId)
    if (result && 'error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Chapter deleted successfully')
    }
  }

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    const subjectId = formData.get('subject_id') as string
    const file = formData.get('csv_file') as File
    
    if (!subjectId || !file) {
      toast.error('Please select a subject and upload a CSV file')
      return
    }

    const toastId = toast.loading('Parsing CSV file...')
    
    try {
      const text = await file.text()
      // Basic CSV parser (handles simple commas and quotes)
      const lines = text.split('\n').filter(l => l.trim() !== '')
      
      if (lines.length < 2) {
        toast.dismiss(toastId)
        toast.error('CSV must contain a header row and at least one data row')
        return
      }

      // Expected headers: name, description, order
      // We'll skip header validation to be flexible, but expect order: name (0), description (1), order (2)
      
      const chaptersToCreate = []
      
      for (let i = 1; i < lines.length; i++) {
        // Simple regex to split by comma, ignoring commas inside quotes
        const match = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        if (!match) continue
        
        const row = match.map(val => val.replace(/^"|"$/g, '').trim())
        
        const name = row[0]
        if (!name) continue
        
        const description = row[1] || ''
        const order = row[2] || '0'
        
        chaptersToCreate.push({
          subject_id: subjectId,
          name,
          description,
          order,
          status: 'active'
        })
      }

      if (chaptersToCreate.length === 0) {
        toast.dismiss(toastId)
        toast.error('No valid chapters found in CSV')
        return
      }

      toast.loading(`Creating ${chaptersToCreate.length} chapters...`, { id: toastId })
      
      const result = await bulkCreateChaptersAction(chaptersToCreate)
      
      toast.dismiss(toastId)
      if (result && 'error' in result) {
        toast.error(result.error)
      } else {
        toast.success(`Successfully added ${chaptersToCreate.length} chapters`)
        setModal(null)
        setSelectedCourseId('')
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
            placeholder="Search chapters by name or subject..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none text-sm font-medium"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <button 
            onClick={() => {
              setCreateTab('single')
              openModal('create')
            }}
            className="w-full md:w-auto bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Chapter
          </button>
        </div>
      </div>

      {/* Chapters List */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {filteredChapters.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No chapters found</h3>
            <p className="text-gray-500 text-sm">Create your first chapter to get started.</p>
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
                          <div className="divide-y divide-gray-100 border-t border-gray-100">
                            {sub.chapters.map(chapter => (
                              <div key={chapter.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors group">
                                <div className="flex items-start gap-4">
                                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                                    <Layers className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{chapter.name}</h3>
                                    <div className="flex items-center gap-2 mt-1 text-sm font-medium">
                                      <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                        {chapter.topics_count} Topics
                                      </span>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                                        {chapter.questions_count} Questions
                                      </span>
                                      {!chapter.status || chapter.status === 'active' ? (
                                        <span className="ml-2 w-2 h-2 rounded-full bg-green-500"></span>
                                      ) : (
                                        <span className="ml-2 w-2 h-2 rounded-full bg-red-500"></span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 sm:self-center self-end">
                                  <button 
                                    onClick={() => openModal('edit', chapter)}
                                    className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <form onSubmit={(e) => handleDelete(e, chapter.id)}>
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

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-900">
                {modal.mode === 'edit' ? 'Edit Chapter' : 'Add New Chapter'}
              </h3>
              <button onClick={() => { setModal(null); setSelectedCourseId(''); }} className="p-2 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {modal.mode === 'create' && (
              <div className="px-6 pt-4">
                <div className="flex bg-gray-100 p-1 rounded-xl w-full">
                  <button
                    type="button"
                    onClick={() => setCreateTab('single')}
                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${createTab === 'single' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
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
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none appearance-none bg-white font-medium text-gray-800"
                  >
                    <option value="" disabled>Select a Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Target Subject</label>
                  <select 
                    name="subject_id" 
                    required
                    defaultValue=""
                    disabled={!selectedCourseId}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-600 outline-none appearance-none bg-white font-medium text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="" disabled>Select a Subject</option>
                    {visibleSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.title}</option>
                    ))}
                  </select>
                </div>

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
                    Format: <b>name, description, order</b> (Header row required)
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
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none appearance-none bg-white font-medium text-gray-800"
                  >
                    <option value="" disabled>Select a Course</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Subject</label>
                  <select 
                    name="subject_id" 
                    defaultValue={modal.data?.subject_id || ''} 
                    required
                    disabled={!selectedCourseId}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none appearance-none bg-white font-medium text-gray-800 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="" disabled>Select a Subject</option>
                    {visibleSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Chapter Name</label>
                  <input 
                    name="name"
                    defaultValue={modal.data?.name}
                    placeholder="e.g. Data Structures"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none font-medium text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Description (Optional)</label>
                  <textarea 
                    name="description"
                    defaultValue={modal.data?.description}
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none font-medium text-gray-800"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Display Order</label>
                    <input 
                      name="order"
                      type="number"
                      defaultValue={modal.data?.order || 0}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none font-medium text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Status</label>
                    <select 
                      name="status"
                      defaultValue={modal.data?.status || 'active'}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none font-medium text-gray-800"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-purple-600 text-white font-bold py-3.5 rounded-xl hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl">
                    {modal.mode === 'edit' ? 'Save Changes' : 'Create Chapter'}
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
