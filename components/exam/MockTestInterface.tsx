'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Info, Loader2 } from 'lucide-react' 
import { submitExamAction } from '@/app/courses/[courseId]/subjects/[subjectId]/test/[testType]/[examId]/actions' 
import { InstructionStage } from '@/components/exam/stages/InstructionStage'
import { ConsentStage } from '@/components/exam/stages/ConsentStage'
import { ResultReportModal } from '@/components/exam/modals/ResultReportModal'
import { TestStage } from '@/components/exam/stages/TestStage'
import { Question } from '@/components/exam/types'
import { toast } from 'sonner' 

interface MockInterfaceProps {
  exam: any
  questions: Question[]
  courseId: string
  subjectId: string
  examId: string
  user: any
}

export default function MockTestInterface({ 
  exam, questions, courseId, subjectId, examId, user
}: MockInterfaceProps) {
  const router = useRouter()
  const storageKey = `mock_progress_${examId}_${user?.id || 'guest'}`

  const totalDurationSeconds = (exam?.duration_minutes || 60) * 60
  const [stage, setStage] = useState<'instructions' | 'consent' | 'test' | 'report'>('instructions')
  const [timeLeft, setTimeLeft] = useState(totalDurationSeconds)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({}) 
  const [questionStatus, setQuestionStatus] = useState<Record<string, string>>({}) 
  const [reportData, setReportData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const [reviewUrl, setReviewUrl] = useState<string | undefined>(undefined)

  // 1. Hydrate state from localStorage on page refresh
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey) || localStorage.getItem(`mock_progress_${examId}`)
      if (raw) {
        const saved = JSON.parse(raw)
        if (saved && (saved.stage === 'test' || saved.stage === 'report')) {
          const now = Date.now()
          const elapsed = saved.lastUpdated ? Math.floor((now - saved.lastUpdated) / 1000) : 0
          const remainingSeconds = Math.max(0, (saved.timeLeft ?? totalDurationSeconds) - elapsed)

          if (saved.answers && typeof saved.answers === 'object') {
            setAnswers(saved.answers)
          }
          if (saved.questionStatus && typeof saved.questionStatus === 'object') {
            setQuestionStatus(saved.questionStatus)
          }
          if (typeof saved.currentQIndex === 'number' && saved.currentQIndex >= 0 && saved.currentQIndex < (questions?.length || 1)) {
            setCurrentQIndex(saved.currentQIndex)
          }

          setTimeLeft(remainingSeconds)
          setStage(saved.stage)

          if (remainingSeconds <= 0 && saved.stage === 'test') {
            toast.warning('Exam time expired while offline. Submitting responses...')
          } else {
            toast.info('Test session restored. Timer and answers resumed.')
          }
        }
      }
    } catch (e) {
      console.error('Failed to restore test session from localStorage:', e)
    } finally {
      setIsHydrated(true)
    }
  }, [storageKey, totalDurationSeconds, questions?.length, examId])

  // 2. Persist state to localStorage whenever in 'test' stage
  useEffect(() => {
    if (!isHydrated || stage !== 'test') return
    try {
      const stateToSave = {
        stage: 'test',
        answers,
        questionStatus,
        currentQIndex,
        timeLeft,
        lastUpdated: Date.now()
      }
      localStorage.setItem(storageKey, JSON.stringify(stateToSave))
      localStorage.setItem(`mock_progress_${examId}`, JSON.stringify(stateToSave))
    } catch (e) {
      console.error('Failed to save test session to localStorage:', e)
    }
  }, [isHydrated, stage, answers, questionStatus, currentQIndex, timeLeft, storageKey, examId])

  // Ref to hold handleSubmit function to avoid stale closure or hook order violation
  const handleSubmitRef = useRef<() => void>(() => {})

  // 3. Timer Hook - MUST BE CALLED UNCONDITIONALLY BEFORE ANY RETURNS
  useEffect(() => {
    if (stage !== 'test') return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitRef.current()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [stage])

  // -- Handlers --
  const handleAnswer = (qId: string, optId: string) => {
    setAnswers(prev => ({ ...prev, [qId]: optId }))
  }

  const handleSaveNext = () => {
    const isAnswered = !!answers[questions[currentQIndex]?.id]
    setQuestionStatus(prev => ({ ...prev, [questions[currentQIndex]?.id]: isAnswered ? 'answered' : 'not_answered' }))
    if (currentQIndex < questions.length - 1) setCurrentQIndex(prev => prev + 1)
  }

  const handleReviewNext = () => {
    const isAnswered = !!answers[questions[currentQIndex]?.id]
    setQuestionStatus(prev => ({ ...prev, [questions[currentQIndex]?.id]: isAnswered ? 'ans_and_review' : 'review' }))
    if (currentQIndex < questions.length - 1) setCurrentQIndex(prev => prev + 1)
  }

  const handleClear = () => {
    if (!questions[currentQIndex]) return
    const newAnswers = { ...answers }
    delete newAnswers[questions[currentQIndex].id]
    setAnswers(newAnswers)
    setQuestionStatus(prev => ({ ...prev, [questions[currentQIndex].id]: 'not_answered' }))
  }

  // -- Submission Logic --
  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    // Clear saved progress on submission
    try {
      localStorage.removeItem(storageKey)
      localStorage.removeItem(`mock_progress_${examId}`)
    } catch (e) {}

    const timeTaken = totalDurationSeconds - timeLeft
    
    try {
      const result: any = await submitExamAction(examId, courseId, subjectId, answers, timeTaken, 'mock')
      
      if (result && 'error' in result) {
        toast.error(result.error)
        setIsSubmitting(false)
        return
      }

      // 1. Construct the Review URL
      const attemptId = result.attemptId 
      
      if (attemptId) {
        const returnPath = encodeURIComponent('/dashboard/exams')
        const url = `/courses/${courseId}/subjects/${subjectId}/test/mock/${examId}/review/${attemptId}?returnTo=${returnPath}`
        setReviewUrl(url)
      }

      const computedTotalMarks = result.totalMarks || exam.total_marks || (questions.length * 4) || 120
      const computedUnattempted = result.unattempted ?? Math.max(0, questions.length - ((result.correct ?? 0) + (result.incorrect ?? 0)))

      // 2. Set Report Data (Including Rank Prediction and accurate score / marks)
      setReportData({
        examTitle: result.examTitle || exam.title || 'Test Result',
        sections: result.sections || [],
        score: result.score ?? 0,            
        totalMarks: computedTotalMarks,
        correctCount: result.correct ?? 0,
        incorrectCount: result.incorrect ?? 0,
        unattemptedCount: computedUnattempted,
        timeTaken: timeTaken,
        predictedRank: result.predictedRank,
        predictedPercentile: result.predictedPercentile
      })
  
      setStage('report')
    } catch (error) {
      console.error("Submission failed", error)
      toast.error("Failed to submit exam.")
    } finally {
      setIsSubmitting(false)
    }
  }

  handleSubmitRef.current = handleSubmit

  // -- Empty State & Hydration Guard (Strictly AFTER all hooks) --
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="bg-white p-8 rounded shadow-md text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Questions Found</h2>
          <button onClick={() => router.back()} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold">Go Back</button>
        </div>
      </div>
    )
  }

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-semibold text-gray-600">Loading Exam Portal...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {isSubmitting && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="font-bold text-lg">Submitting...</p>
          </div>
        </div>
      )}

      {stage === 'instructions' && (
        <InstructionStage onNext={() => setStage('consent')} user={user} />
      )}

      {stage === 'consent' && (
        <ConsentStage 
          exam={{
            ...exam,
            total_questions: questions?.length || exam?.total_questions || 30,
            total_marks: exam?.total_marks || ((questions?.length || 30) * (Number(exam?.marks_correct) || 4)),
            marks_correct: Number(exam?.marks_correct) || 4,
            marks_incorrect: Math.abs(Number(exam?.marks_incorrect)) || 1,
            negative_marking: true
          }} 
          user={user} 
          onPrev={() => setStage('instructions')} 
          onStart={() => setStage('test')} 
        />
      )}

      {stage === 'test' && (
        <TestStage 
          exam={{
            ...exam,
            total_questions: questions?.length || exam?.total_questions || 30,
            total_marks: exam?.total_marks || ((questions?.length || 30) * (Number(exam?.marks_correct) || 4)),
            marks_correct: Number(exam?.marks_correct) || 4,
            marks_incorrect: Math.abs(Number(exam?.marks_incorrect)) || 1,
            negative_marking: true
          }}
          questions={questions}
          user={user}
          currentQIndex={currentQIndex}
          answers={answers}
          questionStatus={questionStatus}
          timeLeft={timeLeft}
          onNavigate={setCurrentQIndex}
          onAnswer={handleAnswer}
          onSaveNext={handleSaveNext}
          onReviewNext={handleReviewNext}
          onClear={handleClear}
          onSubmit={handleSubmit}
        />
      )}

      {stage === 'report' && reportData && (
        <ResultReportModal 
          examTitle={reportData.examTitle}
          sections={reportData.sections}
          score={reportData.score}
          totalMarks={reportData.totalMarks}
          correctCount={reportData.correctCount}
          incorrectCount={reportData.incorrectCount}
          unattemptedCount={reportData.unattemptedCount}
          timeTaken={reportData.timeTaken}
          reviewUrl={reviewUrl} 
          // ✅ NEW: Pass Rank Data to Modal
          predictedRank={reportData.predictedRank}
          predictedPercentile={reportData.predictedPercentile}
          onClose={() => router.push('/dashboard')} 
        />
      )}
    </>
  )
}
