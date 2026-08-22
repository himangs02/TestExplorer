'use client'

import { useState, useMemo, useRef } from 'react'
import { Plus, Search, Filter, Trash2, Upload, UploadCloud, FileText, Download, CheckCircle2, AlertCircle, Loader2, Layers, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { createQuestionAction, deleteQuestionAction, bulkUploadQuestionsAction } from '@/app/dashboard/admin/question-portal/questions/actions'
import UniversalBulkUploadModal from '@/components/admin/universal-bulk-upload-modal'
import { useRouter } from 'next/navigation'

export default function QuestionListClient({ 
  initialQuestions, 
  subjects, 
  chapters, 
  topics 
}: { 
  initialQuestions: any[],
  subjects: any[],
  chapters: any[],
  topics: any[]
}) {
  const router = useRouter()
  const [questions, setQuestions] = useState(initialQuestions)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [universalModalOpen, setUniversalModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single')

  // Filters
  const [filterSubject, setFilterSubject] = useState('')
  const [filterChapter, setFilterChapter] = useState('')
  const [filterTopic, setFilterTopic] = useState('')

  // Form states
  const [formSubject, setFormSubject] = useState('')
  const [formChapter, setFormChapter] = useState('')
  const [formTopic, setFormTopic] = useState('')

  // Bulk Upload states
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const [bulkLoading, setBulkLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      const matchSearch = q.text.toLowerCase().includes(search.toLowerCase())
      const matchSubject = filterSubject ? q.subject_id === filterSubject : true
      const matchChapter = filterChapter ? q.chapter_id === filterChapter : true
      const matchTopic = filterTopic ? q.topic_id === filterTopic : true
      return matchSearch && matchSubject && matchChapter && matchTopic
    })
  }, [questions, search, filterSubject, filterChapter, filterTopic])

  const openModal = (tab: 'single' | 'bulk') => {
    setActiveTab(tab)
    setBulkFile(null)
    setModalOpen(true)
  }

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const toastId = toast.loading('Creating question...')
    const result = await createQuestionAction(formData)
    toast.dismiss(toastId)
    
    if (result && 'error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Question added successfully')
      setModalOpen(false)
      window.location.reload()
    }
  }

  const handleBulkUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!bulkFile) {
      toast.error('Please select a CSV file to upload')
      return
    }

    if (!formSubject) {
      toast.error('Please select a Subject')
      return
    }

    setBulkLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set('file', bulkFile)
    formData.set('subject_id', formSubject)
    if (formChapter) formData.set('chapter_id', formChapter)
    if (formTopic) formData.set('topic_id', formTopic)

    try {
      const result = await bulkUploadQuestionsAction(formData)
      if (result && 'error' in result) {
        toast.error(result.error)
      } else if (result?.success) {
        if (result.count > 0) {
          toast.success(`Successfully uploaded ${result.count} question(s)!${result.skipped ? ` (${result.skipped} skipped)` : ''}`)
          setModalOpen(false)
          setBulkFile(null)
          window.location.reload()
        } else {
          toast.warning(`0 questions uploaded. Check CSV formatting (${result.skipped} invalid rows).`)
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Bulk upload failed')
    } finally {
      setBulkLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return
    
    const formData = new FormData()
    formData.append('id', id)
    
    const toastId = toast.loading('Deleting...')
    const result = await deleteQuestionAction(formData)
    toast.dismiss(toastId)
    
    if (result && 'error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Question deleted')
      setQuestions(q => q.filter(x => x.id !== id))
    }
  }

  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Question,Option A,Option B,Option C,Option D,Correct Option,Marks,Explanation,Difficulty\n" +
      '"What is the SI unit of electric charge?","Ampere","Coulomb","Volt","Ohm","B",1,"The SI unit of electric charge is Coulomb (C).","Easy"\n' +
      '"Which gas is released during photosynthesis?","Carbon Dioxide","Nitrogen","Oxygen","Hydrogen","C",1,"Oxygen is released by plants during photosynthesis.","Easy"\n' +
      '"Solve for x: 2x + 6 = 14","2","4","6","8","B",2,"2x = 14 - 6 => 2x = 8 => x = 4.","Medium"';
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "questions_bulk_sample.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Bar with Cascading Filters & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search questions..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => setUniversalModalOpen(true)}
              className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 hover:border-black px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-gray-600" /> Universal Bulk Upload
            </button>
            <button 
              onClick={() => openModal('bulk')}
              className="bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-100 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4" /> Single Subject Bulk
            </button>
            <button 
              onClick={() => openModal('single')}
              className="bg-black text-white hover:bg-gray-800 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm font-bold text-gray-500 shrink-0">Filters:</span>
          
          <select 
            value={filterSubject}
            onChange={e => {
              setFilterSubject(e.target.value)
              setFilterChapter('')
              setFilterTopic('')
            }}
            className="flex-1 w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg outline-none"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>

          <select 
            value={filterChapter}
            onChange={e => {
              setFilterChapter(e.target.value)
              setFilterTopic('')
            }}
            disabled={!filterSubject}
            className="flex-1 w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg outline-none disabled:opacity-50"
          >
            <option value="">All Chapters</option>
            {chapters.filter(c => c.subject_id === filterSubject).map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select 
            value={filterTopic}
            onChange={e => setFilterTopic(e.target.value)}
            disabled={!filterChapter}
            className="flex-1 w-full text-sm py-2 px-3 bg-white border border-gray-200 rounded-lg outline-none disabled:opacity-50"
          >
            <option value="">All Topics</option>
            {topics.filter(t => t.chapter_id === filterChapter).map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-100">
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              No questions found matching criteria.
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <div key={q.id} className="p-5 hover:bg-gray-50 transition-colors group">
                <div className="flex justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded">
                        {q.subjects?.title || 'No Subject'}
                      </span>
                      {q.chapters?.name && (
                        <span className="text-xs font-bold px-2 py-0.5 bg-purple-50 text-purple-600 rounded">
                          {q.chapters.name}
                        </span>
                      )}
                      {q.topics?.name && (
                        <span className="text-xs font-bold px-2 py-0.5 bg-orange-50 text-orange-600 rounded">
                          {q.topics.name}
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                        {q.marks ? `${q.marks} Mark${Number(q.marks) > 1 ? 's' : ''}` : '1 Mark'}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{q.text}</p>
                  </div>
                  <button onClick={() => handleDelete(q.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0 self-start cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CREATE & BULK UPLOAD MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header with Tabs */}
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black text-gray-900">
                  {activeTab === 'single' ? 'Add New Question' : 'Bulk Upload Questions'}
                </h3>
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Mode Tabs */}
              <div className="flex bg-gray-200/70 p-1 rounded-xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('single')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'single'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Single Question
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('bulk')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === 'bulk'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Bulk CSV Upload
                </button>
              </div>
            </div>

            {/* TAB 1: SINGLE QUESTION FORM */}
            {activeTab === 'single' && (
              <form onSubmit={handleCreate} className="p-6 space-y-6">
                
                <input type="hidden" name="question_type" value="subject-wise" />

                {/* Cascading Dropdowns */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject *</label>
                    <select 
                      name="subject_id" 
                      value={formSubject}
                      onChange={e => {
                        setFormSubject(e.target.value)
                        setFormChapter('')
                        setFormTopic('')
                      }}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chapter</label>
                    <select 
                      name="chapter_id" 
                      value={formChapter}
                      onChange={e => {
                        setFormChapter(e.target.value)
                        setFormTopic('')
                      }}
                      disabled={!formSubject}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50 bg-white"
                    >
                      <option value="">Select Chapter</option>
                      {chapters.filter(c => c.subject_id === formSubject).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Topic</label>
                    <select 
                      name="topic_id" 
                      value={formTopic}
                      onChange={e => setFormTopic(e.target.value)}
                      disabled={!formChapter}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none disabled:opacity-50 bg-white"
                    >
                      <option value="">Select Topic</option>
                      {topics.filter(t => t.chapter_id === formChapter).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Question Text *</label>
                  <textarea 
                    name="text" 
                    required 
                    rows={3} 
                    placeholder="Enter question text here..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Option A *</label>
                    <input name="option_a" required placeholder="Option A text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Option B *</label>
                    <input name="option_b" required placeholder="Option B text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Option C</label>
                    <input name="option_c" placeholder="Option C text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Option D</label>
                    <input name="option_d" placeholder="Option D text" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Correct Option *</label>
                    <select name="correct_option" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-white">
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Marks</label>
                    <input type="number" name="marks" defaultValue={1} min="1" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Difficulty</label>
                    <select name="difficulty" defaultValue="Medium" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none bg-white">
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Explanation (Optional)</label>
                  <textarea name="explanation" rows={2} placeholder="Explain the solution..." className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>

                <button type="submit" className="w-full bg-green-600 text-white font-bold py-3.5 rounded-xl hover:bg-green-700 transition-all shadow-lg cursor-pointer">
                  Save Question
                </button>
              </form>
            )}

            {/* TAB 2: BULK CSV UPLOAD FORM */}
            {activeTab === 'bulk' && (
              <form onSubmit={handleBulkUpload} className="p-6 space-y-6">
                
                {/* Target Subject, Chapter, Topic */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject *</label>
                    <select 
                      name="subject_id" 
                      value={formSubject}
                      onChange={e => {
                        setFormSubject(e.target.value)
                        setFormChapter('')
                        setFormTopic('')
                      }}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chapter (Optional)</label>
                    <select 
                      name="chapter_id" 
                      value={formChapter}
                      onChange={e => {
                        setFormChapter(e.target.value)
                        setFormTopic('')
                      }}
                      disabled={!formSubject}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 bg-white"
                    >
                      <option value="">Apply to all or specify</option>
                      {chapters.filter(c => c.subject_id === formSubject).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Topic (Optional)</label>
                    <select 
                      name="topic_id" 
                      value={formTopic}
                      onChange={e => setFormTopic(e.target.value)}
                      disabled={!formChapter}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 bg-white"
                    >
                      <option value="">Apply to all or specify</option>
                      {topics.filter(t => t.chapter_id === formChapter).map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CSV File Dropzone */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Upload CSV File *</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      bulkFile 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    }`}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept=".csv"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) setBulkFile(file)
                      }}
                      className="hidden" 
                    />
                    
                    {bulkFile ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-10 h-10 text-blue-600 mb-2" />
                        <span className="font-bold text-gray-900 text-sm">{bulkFile.name}</span>
                        <span className="text-xs text-gray-500 mt-0.5">{(bulkFile.size / 1024).toFixed(1)} KB</span>
                        <span className="text-xs text-blue-600 font-semibold mt-2 hover:underline">Click to replace file</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="font-bold text-gray-800 text-sm">Click to choose or drag CSV file here</span>
                        <span className="text-xs text-gray-400 mt-1">Supports UTF-8 encoded .csv files</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Template Download & Instructions */}
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider block flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Required Columns
                    </span>
                    <p className="text-xs text-blue-700">
                      <code>Question</code>, <code>Option A</code>, <code>Option B</code>, <code>Option C</code>, <code>Option D</code>, <code>Correct Option</code> (A/B/C/D), <code>Marks</code>, <code>Explanation</code>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={downloadSampleCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-blue-700 border border-blue-200 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors shrink-0 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Sample CSV
                  </button>
                </div>

                {/* Default Defaults */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Default Marks (Fallback)</label>
                    <input 
                      type="number" 
                      name="marks" 
                      defaultValue={1} 
                      min="1" 
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Default Difficulty</label>
                    <select 
                      name="difficulty" 
                      defaultValue="Medium" 
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={bulkLoading || !bulkFile}
                  className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {bulkLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Parsing & Uploading Questions...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Upload CSV Questions</span>
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Universal Bulk Upload Modal */}
      <UniversalBulkUploadModal
        isOpen={universalModalOpen}
        onClose={() => setUniversalModalOpen(false)}
        onSuccess={() => {
          router.refresh()
        }}
      />

    </div>
  )
}

