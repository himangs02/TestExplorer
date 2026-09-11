import { useState } from 'react'
import Image from 'next/image'
import { Info, Calculator, ChevronRight, ChevronLeft } from 'lucide-react'
import { Question, ExamData, UserData } from '../types'
import { FormattedContent } from '@/components/ui/formatted-content'
import { ExamCalculator } from '../modals/ExamCalculator'
import { QuestionPaperModal } from '../modals/QuestionPaperModal'
import { InstructionModal } from '../modals/InstructionModal'
import { SubmitConfirmationModal } from '../modals/SubmitConfirmationModal'

interface Props {
  exam: ExamData
  questions: Question[]
  user: UserData
  currentQIndex: number
  answers: Record<string, string>
  questionStatus: Record<string, string>
  timeLeft: number
  // Handlers
  onNavigate: (index: number) => void
  onAnswer: (qId: string, optId: string) => void
  onSaveNext: () => void
  onClear: () => void
  onReviewNext: () => void
  onSubmit: () => void
}

export const TestStage = ({
  exam, questions, user, currentQIndex, answers, questionStatus, timeLeft,
  onNavigate, onAnswer, onSaveNext, onClear, onReviewNext, onSubmit
}: Props) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [showCalculator, setShowCalculator] = useState(false)
  const [showQuestionPaper, setShowQuestionPaper] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  const currentQ = questions[currentQIndex]
  const notVisitedCount = questions.length - Object.keys(questionStatus).length
  const getCount = (status: string) => Object.values(questionStatus).filter(s => s === status).length

  // --- DYNAMIC DATA CALCULATIONS ---
  const marksPerQuestion = exam.marks_correct
    
  // Assuming negative marking is usually 1/4th of positive or specific value. 
  // If you have a specific column for 'negative_marks' in DB, use that instead.
  // For now, based on your boolean 'negative_marking', we display logic:
  const negativeMarks = exam.marks_incorrect

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'answered':
        return { 
          className: "bg-[#2ECC71] text-white border-none",
          style: { clipPath: 'polygon(30% 0%, 70% 0%, 100% 45%, 100% 100%, 0% 100%, 0% 45%)' } 
        }
      case 'not_answered':
        return { 
          className: "bg-[#E74C3C] text-white border-none",
          style: { clipPath: 'polygon(0% 0%, 100% 0%, 100% 45%, 70% 100%, 30% 100%, 0% 45%)' } 
        }
      case 'review':
        return { className: "bg-[#8E44AD] text-white rounded-full", style: {} }
      case 'ans_and_review':
        return { className: "bg-[#8E44AD] text-white rounded-full relative", style: {} }
      case 'not_visited':
      default:
        return { className: "bg-[#E0E0E0] border border-[#BDBDBD] text-black rounded-[2px]", style: {} }
    }
  }

  const handleSubmitClick = () => {
    setShowSubmitConfirm(true)
  }

  const handleConfirmSubmit = () => {
    setShowSubmitConfirm(false)
    onSubmit()
  }

  return (
    <div className='min-h-screen bg-slate-100 flex flex-col font-sans'>
      {/* Outer Card Container */}
      <div className='flex-1 flex flex-col bg-white border-y md:border-2 md:border-[#336699] max-w-[1600px] w-full mx-auto shadow-sm'>
        
        {/* ================= HEADER ================= */}
        <header className='border-b border-gray-200 bg-white'>
          {/* Top Bar: Brand & Quick Action Buttons */}
          <div className='flex flex-wrap items-center justify-between px-3 sm:px-6 py-2.5 bg-slate-50 border-b border-gray-200 gap-2'>
            <div className='flex items-center gap-2'>
              <div className='w-7 h-7 bg-[#336699] text-white rounded font-black flex items-center justify-center text-xs'>
                TE
              </div>
              <h1 className='text-sm sm:text-base font-bold text-gray-900 tracking-tight'>
                Test Explorer <span className='hidden sm:inline text-gray-500 font-normal'>| Exam Portal</span>
              </h1>
            </div>

            <div className='flex items-center gap-2'>
              <button 
                onClick={() => setShowCalculator(true)} 
                className="p-1.5 rounded-md hover:bg-gray-200 text-gray-700 transition-colors"
                title="Calculator"
              >
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button 
                className="bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold px-2.5 sm:px-3 py-1.5 border border-gray-300 rounded shadow-xs transition-colors" 
                onClick={() => setShowQuestionPaper(true)}
              >
                Paper
              </button>
              <button 
                className="bg-white hover:bg-gray-100 text-gray-800 text-xs font-bold px-2.5 sm:px-3 py-1.5 border border-gray-300 rounded shadow-xs transition-colors"
                onClick={() => setShowInstructions(true)}
              >
                Instructions
              </button>
              {/* Mobile Palette Toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden bg-[#336699] text-white text-xs font-bold px-2.5 py-1.5 rounded shadow-xs"
              >
                {isSidebarOpen ? 'Hide Grid' : 'Question Grid'}
              </button>
            </div>
          </div>

          {/* Sub Header: Exam Title, Marks Info & Time Left */}
          <div className='flex flex-wrap items-center justify-between px-3 sm:px-6 py-2 bg-gray-100 gap-2 text-xs sm:text-sm'>
            <div className='flex items-center gap-2'>
              <span className='bg-[#336699] text-white font-bold px-2 py-0.5 rounded text-xs uppercase'>
                {exam.title || "Mock Test"}
              </span>
              <div className='hidden md:flex items-center gap-2 text-gray-700 font-medium pl-2 border-l border-gray-300'>
                <span>Candidate: <strong className='text-gray-900'>{user?.full_name || "Candidate"}</strong></span>
              </div>
            </div>

            <div className='flex items-center gap-4 ml-auto'>
              <div className='text-xs text-gray-600 hidden sm:block'>
                Correct: <span className="text-green-700 font-bold">+{marksPerQuestion}</span> | 
                Incorrect: <span className="text-red-600 font-bold">-{negativeMarks}</span>
              </div>
              <div className='bg-white px-3 py-1 rounded border border-gray-300 font-mono font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-1.5 shadow-2xs'>
                <span className='text-gray-500 font-sans font-medium text-xs'>Time Left:</span>
                <span className={`${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-blue-700'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ================= MAIN QUESTION AREA & PALETTE ================= */}
        <div className='flex-1 flex flex-col lg:flex-row min-h-[480px] relative overflow-hidden'>
          
          {/* Question & Options Area */}
          <main className='flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto max-w-full'>
            <div className='flex items-center justify-between border-b border-gray-200 pb-3 mb-4'>
              <div className='font-extrabold text-base sm:text-lg text-gray-900'>
                Question No. {currentQIndex + 1}
              </div>
              <div className='sm:hidden text-xs text-gray-600'>
                <span className="text-green-700 font-bold">+{marksPerQuestion}</span> / <span className="text-red-600 font-bold">-{negativeMarks}</span>
              </div>
            </div>

            {/* Split directions and question text */}
            <div className='flex-1 flex flex-col md:flex-row gap-6'>
              {currentQ.direction && (
                <div className='md:w-1/2 p-4 bg-slate-50 border border-gray-200 rounded-xl max-h-[300px] md:max-h-[500px] overflow-y-auto'>
                  <div className='font-bold text-gray-900 text-xs sm:text-sm uppercase tracking-wider mb-2 text-blue-700'>
                    Direction:
                  </div>
                  <div className='text-gray-800 text-sm leading-relaxed whitespace-pre-wrap font-medium'>
                    {currentQ.direction}
                  </div>
                </div>
              )}

              <div className={`space-y-6 ${currentQ.direction ? 'md:w-1/2' : 'w-full'}`}>
                <div className="text-gray-900 font-semibold text-base sm:text-lg leading-relaxed">
                  <FormattedContent content={currentQ.text} />
                </div>

                <div className="space-y-3 pt-2">
                  {currentQ.options.map((option, optIdx) => {
                    const isChecked = answers[currentQ.id] === option.id;
                    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
                    return (
                      <label 
                        key={option.id} 
                        className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-blue-50/70 border-[#336699] text-gray-900 shadow-xs' 
                            : 'bg-white border-gray-200 hover:border-gray-300 text-gray-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question_${currentQ.id}`}
                          value={option.id}
                          checked={isChecked}
                          onChange={() => onAnswer(currentQ.id, option.id)}
                          className="w-4 h-4 mt-1 accent-[#336699] shrink-0"
                        />
                        <span className='font-bold text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200 shrink-0'>
                          {labels[optIdx] || optIdx + 1}
                        </span>
                        <div className='text-sm sm:text-base font-medium flex-1'>
                          <FormattedContent content={option.text} />
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </main>

          {/* Question Palette Sidebar */}
          <aside 
            className={`transition-all duration-300 ease-in-out bg-[#F4F9FD] border-t lg:border-t-0 lg:border-l border-gray-300 flex flex-col shrink-0 ${
              isSidebarOpen 
                ? 'w-full lg:w-80 max-h-[360px] lg:max-h-none' 
                : 'hidden'
            }`}
          >
            {/* Status Summary Pill Box */}
            <div className="bg-white p-3 border-b border-gray-200 grid grid-cols-2 gap-2 text-[11px] text-gray-700 font-semibold shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center bg-[#2ECC71] text-white font-bold text-xs rounded-xs">
                  {getCount('answered')}
                </div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center bg-[#E74C3C] text-white font-bold text-xs rounded-xs">
                  {getCount('not_answered')}
                </div>
                <span>Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center bg-[#E0E0E0] border border-gray-300 text-black font-bold text-xs rounded-xs">
                  {notVisitedCount}
                </div>
                <span>Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 flex items-center justify-center bg-[#8E44AD] text-white font-bold text-xs rounded-full">
                  {getCount('review')}
                </div>
                <span>Review</span>
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-gray-100 text-[10px]">
                <div className="relative w-5 h-5 flex items-center justify-center bg-[#8E44AD] text-white font-bold text-xs rounded-full shrink-0">
                  {getCount('ans_and_review')}
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#2ECC71] border border-white rounded-full" />
                </div>
                <span>Answered & Marked for Review</span>
              </div>
            </div>

            <div className="bg-[#336699] text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wider shrink-0 flex items-center justify-between">
              <span>Question Palette</span>
              <span className="text-[10px] text-blue-200 font-normal">Total: {questions.length}</span>
            </div>

            {/* Questions Grid */}
            <div className="flex-1 bg-white overflow-y-auto p-3 max-h-[220px] lg:max-h-[380px]">
              <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 content-start">
                {questions.map((q, idx) => {
                  let status = 'not_visited'
                  const ans = answers[q.id]
                  const stat = questionStatus[q.id]
                  
                  if (stat === 'review') status = 'review'
                  else if (stat === 'ans_and_review') status = 'ans_and_review'
                  else if (ans) status = 'answered'
                  else if (stat === 'not_answered') status = 'not_answered'
                  else if (idx === currentQIndex) status = 'not_answered'

                  const styleProps = getStatusStyle(status)

                  return (
                    <button 
                      key={q.id} 
                      onClick={() => {
                        onNavigate(idx)
                        // On small mobile screens, auto minimize palette
                        if (window.innerWidth < 640) setIsSidebarOpen(false)
                      }}
                      className={`h-9 flex items-center justify-center text-xs font-bold transition-all shadow-2xs relative cursor-pointer ${styleProps.className} ${
                        idx === currentQIndex ? 'ring-2 ring-blue-900 font-black z-10' : ''
                      }`}
                      style={styleProps.style}
                    >
                      {idx + 1}
                      {status === 'ans_and_review' && (
                        <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-[#2ECC71] border border-white rounded-full" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </aside>
        </div>

        {/* ================= STICKY BOTTOM ACTIONS ================= */}
        <footer className='border-t border-gray-200 bg-white p-3 sm:p-4 sticky bottom-0 z-30 shadow-md'>
          <div className='flex flex-wrap items-center justify-between gap-2.5'>
            <div className='flex flex-wrap items-center gap-2'>
              <button
                onClick={onReviewNext}
                className='bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-bold shadow-xs transition-colors'
              >
                Mark for Review & Next
              </button>
              <button
                onClick={onClear}
                className='bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-bold shadow-xs transition-colors'
              >
                Clear Response
              </button>
            </div>

            <div className='flex items-center gap-2 ml-auto'>
              <button
                onClick={onSaveNext}
                className='bg-[#336699] hover:bg-[#28537d] text-white px-4 sm:px-6 py-2 rounded text-xs sm:text-sm font-bold shadow-sm transition-colors'
              >
                Save & Next
              </button>
              <button
                onClick={handleSubmitClick}
                className='bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded text-xs sm:text-sm font-bold shadow-sm transition-colors'
              >
                Submit Test
              </button>
            </div>
          </div>
        </footer>

        {/* Modals */}
        {showCalculator && <ExamCalculator onClose={() => setShowCalculator(false)} />}
        {showQuestionPaper && <QuestionPaperModal questions={questions} onClose={() => setShowQuestionPaper(false)} />}
        {showInstructions && <InstructionModal exam={exam} onClose={() => setShowInstructions(false)} />}
        {showSubmitConfirm && (
          <SubmitConfirmationModal 
            timeLeft={timeLeft} 
            onConfirm={handleConfirmSubmit} 
            onCancel={() => setShowSubmitConfirm(false)} 
          />
        )}
      </div>
    </div>
  )
}