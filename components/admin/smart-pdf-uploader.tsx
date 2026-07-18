'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, Upload, FileText, CheckCircle, BrainCircuit, X, FileEdit } from 'lucide-react'
import { uploadPdfQuestionsAction } from '@/app/dashboard/admin/question-uploads/actions'
import { toast } from 'sonner'
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs'

export default function SmartPdfUploader({ subjectId, subjectTitle, onCancel }: { subjectId: string, subjectTitle: string, onCancel: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [extractedQuestions, setExtractedQuestions] = useState<any[]>([])
  
  const [title, setTitle] = useState(`${subjectTitle} Smart Pool - ${new Date().toLocaleDateString()}`)
  const [description, setDescription] = useState('Extracted via AI PDF OCR')

  useEffect(() => {
    // Dynamically set workerSrc to the CDN version that matches the installed pdfjs-dist
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const renderPdfToImages = async (pdfFile: File): Promise<string[]> => {
    const arrayBuffer = await pdfFile.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    
    const numPages = pdf.numPages
    const images: string[] = []
    
    // Process at most 10 pages to avoid timeouts on free tiers
    const maxPages = Math.min(numPages, 10)

    for (let i = 1; i <= maxPages; i++) {
      setProgress(`Rendering page ${i} of ${maxPages}...`)
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 1.5 }) // Higher scale for better OCR
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) continue
      
      canvas.width = viewport.width
      canvas.height = viewport.height
      
      await page.render({ canvasContext: ctx, viewport }).promise
      images.push(canvas.toDataURL('image/jpeg', 0.8))
    }
    
    return images
  }

  const extractWithAI = async () => {
    if (!file) return

    setLoading(true)
    try {
      // 1. Convert PDF to images
      setProgress('Converting PDF to images (this may take a moment)...')
      const images = await renderPdfToImages(file)

      // 2. Send to API for Gemini Extraction
      setProgress('Sending to AI for extraction (can take up to a minute)...')
      const res = await fetch('/api/admin/extract-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract from AI')
      }

      setExtractedQuestions(data.questions || [])
      toast.success(`Successfully extracted ${data.questions.length} questions!`)

    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "An error occurred during extraction")
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const handleSaveToDatabase = async () => {
    if (extractedQuestions.length === 0) return
    
    setLoading(true)
    setProgress('Saving questions to database...')
    
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('subject_id', subjectId)
      formData.append('questions', JSON.stringify(extractedQuestions))

      const result = await uploadPdfQuestionsAction(formData)

      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success(`Success! Saved ${result.inserted} questions.`)
        onCancel() // Close modal
      }
    } catch (error) {
      console.error(error)
      toast.error('Failed to save to database')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  const updateQuestion = (index: number, field: string, value: string) => {
    const updated = [...extractedQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setExtractedQuestions(updated)
  }

  return (
    <div className="space-y-4">
      {extractedQuestions.length === 0 ? (
        // UPLOAD STATE
        <div className="space-y-4">
          <div 
            className={`
              border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer relative
              ${file ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-purple-400'}
            `}
          >
            {file ? (
              <>
                <CheckCircle className="w-8 h-8 text-purple-500 mb-2 animate-in zoom-in" />
                <span className="text-sm font-bold text-gray-900 text-center break-all">{file.name}</span>
                <span className="text-xs text-purple-600 mt-1">Click to change PDF</span>
              </>
            ) : (
              <>
                <BrainCircuit className="w-8 h-8 text-purple-400 mb-2" />
                <span className="text-xs font-bold text-gray-400">Click to browse PDF</span>
              </>
            )}
            
            <input 
              type="file" 
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer" 
            />
          </div>

          <button 
            onClick={extractWithAI}
            disabled={loading || !file}
            className={`w-full py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 
              ${loading || !file ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {progress || 'Processing...'}
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" /> Run AI Extraction
              </>
            )}
          </button>
        </div>
      ) : (
        // PREVIEW AND EDIT STATE
        <div className="space-y-6">
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-purple-900">Extracted {extractedQuestions.length} Questions</h3>
              <p className="text-xs text-purple-600">Review and edit before saving to the database. LaTeX format is supported.</p>
            </div>
            <button onClick={() => setExtractedQuestions([])} className="text-sm text-purple-600 font-bold hover:underline">
              Start Over
            </button>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto p-2">
            {extractedQuestions.map((q, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
                <div className="flex gap-2">
                  <span className="font-black text-gray-300">Q{i+1}</span>
                  <textarea 
                    value={q.question}
                    onChange={(e) => updateQuestion(i, 'question', e.target.value)}
                    className="w-full text-sm font-medium outline-none resize-none"
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2 pl-7">
                  {q.options.map((opt: string, optIdx: number) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">{String.fromCharCode(65 + optIdx)}</span>
                      <input 
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...q.options]
                          newOpts[optIdx] = e.target.value
                          updateQuestion(i, 'options', newOpts as any)
                        }}
                        className="w-full text-xs p-1 border-b border-gray-100 outline-none focus:border-purple-300"
                      />
                    </div>
                  ))}
                </div>

                <div className="pl-7 flex items-center gap-2">
                  <span className="text-xs font-bold text-green-600">Correct:</span>
                  <input 
                    value={q.answer}
                    onChange={(e) => updateQuestion(i, 'answer', e.target.value)}
                    className="w-full text-xs font-bold p-1 border-b border-green-100 outline-none focus:border-green-300 text-green-700"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-3">
             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Batch Title</label>
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none text-sm" 
                />
              </div>

            <button 
              onClick={handleSaveToDatabase}
              disabled={loading}
              className={`w-full py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 
                ${loading ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {progress}</>
              ) : (
                <><CheckCircle className="w-4 h-4" /> Save to Database</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
