'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Bookmark, 
  X,
  AlertCircle,
  CheckCircle2,
  ListTodo
} from 'lucide-react'
import { toast } from 'sonner'
import { FormattedContent } from '@/components/ui/formatted-content'

type Option = { id: string; text: string }
type Question = { id: string; text: string; options: Option[] }

interface TestInterfaceProps {
  exam: any
  questions: Question[]
  courseId: string
  subjectId: string
  testType: string
  // We pass the action as a prop to avoid import path issues
  submitAction: (answers: Record<string, string>, timeTaken: number) => Promise<{ error?: string; success?: boolean; redirectUrl?: string }>
}

export default function TestInterface({ 
  exam, 
  questions, 
  submitAction 
}: TestInterfaceProps) {
  const router = useRouter()
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [markedForReview, setMarkedForReview] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState((exam.duration_minutes || 60) * 60) 
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false)

  // --- SAFEGUARDS ---
  if (!questions || questions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F3F4F6] p-4">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border-2 border-dashed border-gray-300 text-center max-w-sm w-full">
          <p className="text-lg sm:text-xl font-bold text-gray-400">No questions available.</p>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQIndex]

  // --- TIMER ---
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // --- HANDLERS ---
  const handleOptionSelect = (optionId: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: optionId }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    const timeTaken = ((exam.duration_minutes || 60) * 60) - timeLeft
    
    try {
      // 1. Call Action
      const result = await submitAction(answers, timeTaken)
      
      if (result && 'error' in result && result.error) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      if (result?.success) {
        toast.success("Test submitted successfully!")
        if (result.redirectUrl) {
          router.push(result.redirectUrl)
        }
      } else {
        toast.error("Invalid response from server")
        setIsSubmitting(false)
      }

    } catch (err) {
      console.error(err)
      toast.error("Submission failed. Please try again.")
      setIsSubmitting(false)
    }
  }

  // --- STATS CALC ---
  const attemptedCount = Object.keys(answers).length
  const markedCount = markedForReview.length
  const notVisitedCount = questions.length - attemptedCount

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] font-sans text-gray-900">
      
      {/* 1. HEADER: Timer & Title */}
      <header className="h-16 sm:h-20 bg-white border-b-2 border-gray-100 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="h-8 sm:h-10 px-2.5 sm:px-4 bg-black text-white rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm sm:text-lg shadow-sm">
             Q{currentQIndex + 1}
          </div>
          <div>
            <h1 className="font-black text-sm sm:text-base md:text-lg tracking-tight leading-tight line-clamp-1 max-w-[140px] sm:max-w-xs md:max-w-md">
              {exam.title}
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Practice Mode</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className={`flex items-center gap-1.5 sm:gap-3 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl border-2 font-mono font-bold text-sm sm:text-xl transition-colors ${
            timeLeft < 300 ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-gray-50 border-gray-100 text-gray-800'
          }`}>
            <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            {formatTime(timeLeft)}
          </div>

          {/* Mobile Question Palette Toggle */}
          <button
            onClick={() => setIsMobilePaletteOpen(true)}
            className="xl:hidden p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg sm:rounded-xl transition-colors"
            title="Open Question Palette"
          >
            <ListTodo className="w-5 h-5" />
          </button>

          <button 
            onClick={() => setIsSubmitModalOpen(true)}
            className="bg-[#CEFF1A] text-black border-2 border-black px-4 sm:px-8 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl font-black text-xs sm:text-base hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
          >
            Finish
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. MAIN AREA */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 flex flex-col">
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            
            {/* Stats Bar (Between Timer & Question) */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 flex items-center justify-between shadow-2xs">
                 <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Attempted</span>
                 <span className="text-lg sm:text-2xl font-black text-blue-600">{attemptedCount}</span>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 flex items-center justify-between shadow-2xs">
                 <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Marked</span>
                 <span className="text-lg sm:text-2xl font-black text-purple-600">{markedCount}</span>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-gray-100 flex items-center justify-between shadow-2xs">
                 <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">Remaining</span>
                 <span className="text-lg sm:text-2xl font-black text-gray-400">{questions.length - attemptedCount}</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] p-4 sm:p-8 md:p-10 border-2 border-gray-100 shadow-xs flex-1 relative min-h-[360px]">
              
              {/* Bookmark Toggle */}
              <button 
                onClick={() => setMarkedForReview(prev => prev.includes(currentQ.id) ? prev.filter(id => id !== currentQ.id) : [...prev, currentQ.id])}
                className={`absolute top-4 sm:top-8 right-4 sm:right-8 p-2.5 sm:p-3 rounded-full transition-all border-2 ${
                  markedForReview.includes(currentQ.id) 
                    ? 'bg-purple-100 border-purple-200 text-purple-700' 
                    : 'bg-white border-gray-100 text-gray-300 hover:border-gray-300'
                }`}
                title="Mark for Review"
              >
                <Bookmark className={`w-5 h-5 sm:w-6 sm:h-6 ${markedForReview.includes(currentQ.id) ? 'fill-current' : ''}`} />
              </button>

              <div className="mb-6 sm:mb-10 pr-12 sm:pr-16">
                <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
                  <FormattedContent content={currentQ.text} />
                </div>
              </div>

              {/* Options */}
              <div className="grid gap-3 sm:gap-4">
                {currentQ.options?.map((opt: any, idx: number) => {
                  const isSelected = answers[currentQ.id] === opt.id
                  const labels = ['A', 'B', 'C', 'D']
                  
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleOptionSelect(opt.id)}
                      className={`
                        w-full text-left p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 flex items-center gap-3.5 sm:gap-5 group cursor-pointer ${
                          isSelected 
                            ? 'border-black bg-black text-white shadow-md' 
                            : 'border-gray-100 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className={`
                        w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 flex items-center justify-center font-black text-xs sm:text-sm shrink-0 transition-colors ${
                          isSelected 
                            ? 'bg-[#CEFF1A] border-[#CEFF1A] text-black' 
                            : 'bg-gray-50 border-gray-200 text-gray-400 group-hover:border-gray-400'
                        }
                      `}>
                        {labels[idx] || idx + 1}
                      </div>
                      <span className="text-sm sm:text-base md:text-lg font-medium flex-1">
                        <FormattedContent content={opt.text} />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation Footer */}
            <div className="flex justify-between items-center mt-6 pb-6 gap-3">
              <button 
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="px-5 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-xs sm:text-base text-gray-500 bg-white border-2 border-gray-100 hover:border-gray-300 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              
              <button 
                onClick={() => {
                  if (currentQIndex < questions.length - 1) setCurrentQIndex(prev => prev + 1)
                  else setIsSubmitModalOpen(true)
                }}
                className="group flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-4 bg-black text-white rounded-xl font-bold text-xs sm:text-lg hover:bg-gray-900 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <span>{currentQIndex === questions.length - 1 ? 'Finish' : 'Next Question'}</span>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </main>

        {/* 3. RIGHT PANEL (Desktop Question Palette) */}
        <aside className="w-80 bg-white border-l-2 border-gray-100 p-6 hidden xl:flex flex-col z-10 shrink-0">
          <div className="flex items-center gap-2 mb-6 text-gray-400 font-bold text-xs uppercase tracking-widest">
            <ListTodo className="w-4 h-4" /> Question Palette
          </div>

          <div className="grid grid-cols-4 gap-2.5 content-start overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id]
              const isReview = markedForReview.includes(q.id)
              const isCurrent = idx === currentQIndex
              
              let style = "bg-gray-50 text-gray-500 border-gray-100 hover:border-gray-300"
              
              if (isCurrent) style = "bg-black text-white border-black ring-4 ring-gray-100"
              else if (isReview) style = "bg-purple-100 text-purple-700 border-purple-200 font-bold"
              else if (isAnswered) style = "bg-blue-50 text-blue-600 border-blue-200 font-bold"

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all cursor-pointer ${style}`}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
             <div className="grid grid-cols-2 gap-2.5 text-[10px] font-bold text-gray-500 uppercase">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded-full shrink-0"/> Answered</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded-full shrink-0"/> Review</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-black rounded-full shrink-0"/> Current</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-full shrink-0"/> Skipped</div>
             </div>
          </div>
        </aside>

        {/* 4. MOBILE QUESTION PALETTE DRAWER */}
        {isMobilePaletteOpen && (
          <div className="fixed inset-0 z-50 xl:hidden flex animate-in fade-in duration-200">
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsMobilePaletteOpen(false)}
            />
            <div className="relative ml-auto w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col p-6 z-10 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-800 font-bold text-sm uppercase tracking-wider">
                  <ListTodo className="w-4 h-4 text-blue-600" /> Question Palette
                </div>
                <button 
                  onClick={() => setIsMobilePaletteOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2.5 content-start overflow-y-auto flex-1 pr-1">
                {questions.map((q, idx) => {
                  const isAnswered = !!answers[q.id]
                  const isReview = markedForReview.includes(q.id)
                  const isCurrent = idx === currentQIndex
                  
                  let style = "bg-gray-50 text-gray-500 border-gray-100"
                  if (isCurrent) style = "bg-black text-white border-black ring-4 ring-gray-100"
                  else if (isReview) style = "bg-purple-100 text-purple-700 border-purple-200 font-bold"
                  else if (isAnswered) style = "bg-blue-50 text-blue-600 border-blue-200 font-bold"

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQIndex(idx)
                        setIsMobilePaletteOpen(false)
                      }}
                      className={`w-full aspect-square rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all ${style}`}
                    >
                      {idx + 1}
                    </button>
                  )
                })}
              </div>

              <div className="pt-4 mt-auto border-t border-gray-100">
                 <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500 uppercase">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-blue-100 border border-blue-300 rounded-full"/> Answered</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-purple-100 border border-purple-300 rounded-full"/> Review</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-black rounded-full"/> Current</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-gray-100 border border-gray-300 rounded-full"/> Skipped</div>
                 </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. SUBMIT CONFIRMATION MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl sm:rounded-4xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">Finish Test?</h2>
              <button onClick={() => setIsSubmitModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 sm:p-5 mb-6 sm:mb-8 flex gap-3.5 items-start">
              <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                 <p className="font-bold text-orange-900 text-sm mb-1">Confirm Submission</p>
                 <p className="text-orange-700/80 text-xs leading-relaxed">
                   You have <span className="font-bold text-orange-900">{formatTime(timeLeft)}</span> remaining. 
                   Once submitted, you cannot change your answers.
                 </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
               <div className="p-3.5 sm:p-4 bg-blue-50 rounded-2xl text-center border border-blue-100">
                 <div className="text-2xl sm:text-3xl font-black text-blue-600">{Object.keys(answers).length}</div>
                 <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Answered</div>
               </div>
               <div className="p-3.5 sm:p-4 bg-gray-50 rounded-2xl text-center border border-gray-100">
                 <div className="text-2xl sm:text-3xl font-black text-gray-400">{questions.length - Object.keys(answers).length}</div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Skipped</div>
               </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setIsSubmitModalOpen(false)}
                className="flex-1 py-3 sm:py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl text-xs sm:text-sm hover:bg-gray-50 hover:text-black hover:border-gray-300 transition-all"
              >
                Go Back
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 py-3 sm:py-4 bg-black text-white font-bold rounded-xl text-xs sm:text-sm hover:bg-gray-800 transition-all shadow-md disabled:opacity-70"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}