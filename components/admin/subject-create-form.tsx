'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createSubjectAction, bulkCreateSubjectsAction } from '@/app/dashboard/admin/subjects/actions'
import { Save, Upload, FileText, Download } from 'lucide-react'
import { toast } from 'sonner'

interface Course {
  id: string
  title: string
}

export default function SubjectCreateForm({ courses }: { courses: Course[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<'single' | 'bulk'>('single')
  
  // Single Subject State
  const [singleCourseId, setSingleCourseId] = useState('')
  const [singleTitle, setSingleTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Bulk Upload State
  const [bulkCourseId, setBulkCourseId] = useState('')
  const [bulkFile, setBulkFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ---------------------------------------------------------------------------
  // SINGLE SUBJECT SUBMIT
  // ---------------------------------------------------------------------------
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!singleTitle.trim()) {
      toast.error('Please enter a subject title')
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading('Creating subject...')

    try {
      const formData = new FormData()
      formData.append('title', singleTitle.trim())
      if (singleCourseId) formData.append('course_id', singleCourseId)

      const res = await createSubjectAction(formData)
      if (res && 'error' in res) {
        toast.dismiss(toastId)
        toast.error(res.error)
        setIsSubmitting(false)
      } else {
        toast.dismiss(toastId)
        toast.success('Subject created successfully')
        router.push('/dashboard/admin/subjects')
      }
    } catch (err: any) {
      toast.dismiss(toastId)
      if (err?.message && !err.message.includes('NEXT_REDIRECT')) {
        toast.error(err.message || 'Failed to create subject')
        setIsSubmitting(false)
      }
    }
  }

  // ---------------------------------------------------------------------------
  // BULK SUBJECT SUBMIT
  // ---------------------------------------------------------------------------
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bulkCourseId) {
      toast.error('Please select a target course')
      return
    }

    if (!bulkFile) {
      toast.error('Please select a CSV file')
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading('Processing CSV file...')

    try {
      const text = await bulkFile.text()
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)

      if (lines.length === 0) {
        toast.dismiss(toastId)
        toast.error('CSV file is empty')
        setIsSubmitting(false)
        return
      }

      // Check if line 1 has header
      const firstLine = lines[0].toLowerCase()
      const hasHeader = firstLine.includes('title') || firstLine.includes('subject') || firstLine.includes('name')
      const dataLines = hasHeader ? lines.slice(1) : lines

      const subjectsToCreate = []

      for (const line of dataLines) {
        const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        const row = match ? match.map(v => v.replace(/^"|"$/g, '').trim()) : line.split(',').map(s => s.trim())

        const title = row[0]
        if (!title) continue

        const code = row[1] || undefined
        const description = row[2] || undefined

        subjectsToCreate.push({
          course_id: bulkCourseId,
          title,
          code,
          description,
          status: 'active'
        })
      }

      if (subjectsToCreate.length === 0) {
        toast.dismiss(toastId)
        toast.error('No valid subjects found in CSV file')
        setIsSubmitting(false)
        return
      }

      toast.loading(`Creating ${subjectsToCreate.length} subjects...`, { id: toastId })
      const res = await bulkCreateSubjectsAction(subjectsToCreate)

      toast.dismiss(toastId)
      if (res && 'error' in res) {
        toast.error(res.error)
        setIsSubmitting(false)
      } else {
        toast.success(`Successfully created ${subjectsToCreate.length} subjects`)
        router.push('/dashboard/admin/subjects')
      }
    } catch (err: any) {
      toast.dismiss(toastId)
      toast.error(err.message || 'Failed to bulk upload subjects')
      setIsSubmitting(false)
    }
  }

  // ---------------------------------------------------------------------------
  // DOWNLOAD SAMPLE CSV
  // ---------------------------------------------------------------------------
  const downloadSampleCsv = () => {
    const csvContent = "title,code,description\n\"Organic Chemistry\",\"CHEM101\",\"Core organic chemistry module\"\n\"Inorganic Chemistry\",\"CHEM102\",\"Basic chemical reactions\"\n\"Thermodynamics\",\"PHYS201\",\"Laws of heat and energy\""
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'subjects_sample.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900">Add New Subject</h1>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('single')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'single'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Single
          </button>
          <button
            type="button"
            onClick={() => setTab('bulk')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              tab === 'bulk'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Bulk Upload
          </button>
        </div>
      </div>

      {tab === 'single' ? (
        /* SINGLE SUBJECT FORM */
        <form key="single-form" onSubmit={handleSingleSubmit} className="space-y-6">
          {/* Course Dropdown */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Assign to Course</label>
            <div className="relative">
              <select 
                key="single-course-select"
                value={singleCourseId}
                onChange={(e) => setSingleCourseId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer"
              >
                <option value="">Select a Course</option>
                {courses?.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                ▼
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Subject Title</label>
            <input 
              key="single-title-input"
              type="text" 
              value={singleTitle}
              onChange={(e) => setSingleTitle(e.target.value)}
              placeholder="e.g. Organic Chemistry" 
              required 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black transition-all" 
            />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSubmitting ? 'Creating...' : 'Create Subject'}
          </button>
        </form>
      ) : (
        /* BULK UPLOAD FORM */
        <form key="bulk-form" onSubmit={handleBulkSubmit} className="space-y-6">
          {/* Course Dropdown */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Assign to Course</label>
            <div className="relative">
              <select 
                key="bulk-course-select"
                value={bulkCourseId}
                onChange={(e) => setBulkCourseId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black bg-white appearance-none cursor-pointer"
              >
                <option value="">Select a Course</option>
                {courses?.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                ▼
              </div>
            </div>
          </div>

          {/* CSV File Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-gray-900">Upload CSV File</label>
              <button
                type="button"
                onClick={downloadSampleCsv}
                className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Sample CSV
              </button>
            </div>

            <input
              key="bulk-file-input"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              required
              onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
              className="hidden"
              id="bulk_subject_file"
            />

            <label
              htmlFor="bulk_subject_file"
              className="border border-dashed border-gray-300 hover:border-black rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50 hover:bg-gray-100 text-center"
            >
              <FileText className="w-6 h-6 text-gray-400 mb-2" />
              {bulkFile ? (
                <div>
                  <p className="font-bold text-sm text-gray-900">{bulkFile.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{(bulkFile.size / 1024).toFixed(1)} KB • Click to change</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-gray-700">Choose a CSV file</p>
                  <p className="text-xs text-gray-400 mt-0.5">Format: <code>title, code, description</code></p>
                </div>
              )}
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !bulkFile || !bulkCourseId}
            className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> {isSubmitting ? 'Uploading...' : 'Upload Subjects'}
          </button>
        </form>
      )}
    </div>
  )
}
