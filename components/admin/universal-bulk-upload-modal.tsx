'use client'

import React, { useState } from 'react'
import { 
  UploadCloud, 
  Download, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { universalBulkUploadQuestionsAction } from '@/app/dashboard/admin/question-portal/questions/actions'

interface UniversalBulkUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function UniversalBulkUploadModal({
  isOpen,
  onClose,
  onSuccess
}: UniversalBulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    count?: number
    duplicates?: number
    skipped?: number
    total?: number
    breakdown?: Record<string, number>
    errors?: { row: number; reason: string }[]
  } | null>(null)

  if (!isOpen) return null

  const handleDownloadSample = () => {
    const sampleHeaders = [
      'course',
      'subject',
      'chapter',
      'question',
      'option_a',
      'option_b',
      'option_c',
      'option_d',
      'correct_option',
      'explanation',
      'difficulty',
      'marks'
    ]

    const sampleRows = [
      [
        'JEE Main',
        'Physics',
        'Kinematics',
        'A particle moves along a straight line with constant acceleration of 2 m/s^2. If initial velocity is 3 m/s, find velocity after 4 seconds.',
        '11 m/s',
        '14 m/s',
        '8 m/s',
        '10 m/s',
        'A',
        'Using v = u + at: v = 3 + 2(4) = 11 m/s.',
        'Easy',
        '4'
      ],
      [
        'JEE Main',
        'Chemistry',
        'Atomic Structure',
        'What is the maximum number of electrons that can be accommodated in a principal quantum shell with n = 3?',
        '8',
        '18',
        '32',
        '2',
        'B',
        'Maximum electrons in nth shell = 2n^2 = 2*(3)^2 = 18.',
        'Medium',
        '4'
      ],
      [
        'CUET',
        'General Test',
        'Quantitative Reasoning',
        'If 15% of a number is 45, what is 40% of that number?',
        '120',
        '150',
        '100',
        '180',
        'A',
        'Number = 45 / 0.15 = 300. 40% of 300 = 120.',
        'Easy',
        '5'
      ],
      [
        'CUET',
        'Mathematics',
        'Matrices & Determinants',
        'If matrix A is orthogonal, then determinant of A is:',
        '0',
        '1 or -1',
        'Infinity',
        'Always 0',
        'B',
        'For an orthogonal matrix A * A^T = I, hence det(A)^2 = 1, so det(A) = ±1.',
        'Medium',
        '5'
      ]
    ]

    const csvContent = [
      sampleHeaders.join(','),
      ...sampleRows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'universal_questions_sample.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please select a CSV file first.')
      return
    }

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await universalBulkUploadQuestionsAction(formData)

      if (res.error) {
        toast.error(res.error)
      } else {
        setResult(res)
        toast.success(`Successfully uploaded ${res.count} new questions!`)
        if (onSuccess) onSuccess()
      }
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to upload questions')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-200 shadow-xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Minimal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Universal Bulk Upload
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload mixed questions across courses and subjects in one CSV.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Template Link Pill */}
          <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
            <span className="text-gray-500 font-medium">Need the format structure?</span>
            <button
              type="button"
              onClick={handleDownloadSample}
              className="font-bold text-gray-900 hover:text-black flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </button>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleUpload} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="universal_bulk_file"
                className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  file
                    ? 'border-gray-900 bg-gray-50/80'
                    : 'border-gray-300 hover:border-gray-500 bg-gray-50/40 hover:bg-gray-50'
                }`}
              >
                <UploadCloud className={`w-7 h-7 mb-2 ${file ? 'text-gray-900' : 'text-gray-400'}`} />
                {file ? (
                  <div className="text-center space-y-0.5">
                    <p className="font-bold text-xs text-gray-900">{file.name}</p>
                    <p className="text-[11px] text-gray-500">{(file.size / 1024).toFixed(1)} KB • Click to replace</p>
                  </div>
                ) : (
                  <div className="text-center space-y-0.5">
                    <p className="font-semibold text-xs text-gray-700">Choose CSV file or drag & drop</p>
                    <p className="text-[11px] text-gray-400">Supports .csv with auto-deduplication</p>
                  </div>
                )}
                <input
                  id="universal_bulk_file"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 rounded-lg text-gray-600 font-semibold text-xs hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!file || isUploading}
                className="px-4 py-2 rounded-xl bg-black hover:bg-gray-800 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing CSV...</span>
                  </>
                ) : (
                  <span>Upload & Process</span>
                )}
              </button>
            </div>
          </form>

          {/* Results Summary */}
          {result && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-gray-200/80 pb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Upload Complete</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                  <span className="text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                    {result.count} Added
                  </span>
                  {result.duplicates && result.duplicates > 0 ? (
                    <span className="text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md">
                      {result.duplicates} Duplicates Skipped
                    </span>
                  ) : null}
                  {result.skipped && result.skipped > 0 ? (
                    <span className="text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                      {result.skipped} Invalid
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Breakdown */}
              {result.breakdown && Object.keys(result.breakdown).length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                    Breakdown by Subject:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {Object.entries(result.breakdown).map(([key, count]) => (
                      <div
                        key={key}
                        className="p-2 rounded-lg bg-white border border-gray-200 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-gray-700 truncate mr-2">{key}</span>
                        <span className="font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded text-[11px] shrink-0">
                          {count} Qs
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.errors && result.errors.length > 0 && (
                <div className="space-y-1 pt-1.5 border-t border-gray-200/80">
                  <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" /> Skipped Rows:
                  </span>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-1 text-[11px] text-gray-600">
                    {result.errors.map((err, i) => (
                      <div key={i} className="p-1 rounded bg-amber-50/60 border border-amber-100 flex items-start gap-1.5">
                        <span className="font-bold text-amber-800 shrink-0">Row {err.row}:</span>
                        <span>{err.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
