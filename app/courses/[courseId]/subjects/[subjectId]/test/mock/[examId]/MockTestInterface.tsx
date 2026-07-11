'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Info, Loader2 } from 'lucide-react' 
import { submitExamAction } from '../../[testType]/[examId]/actions'
import { InstructionStage } from '@/components/exam/stages/InstructionStage'
import { ConsentStage } from '@/components/exam/stages/ConsentStage'
import { ResultReportModal } from '@/components/exam/modals/ResultReportModal'
import { TestStage } from '@/components/exam/stages/TestStage'
import { Question } from '@/components/exam/types'
import { toast } from 'sonner' 

interface MockInterfaceProps {
  exam: any
  questions: Question[]
  examId: string
  courseId: string
  subjectId: string
  user: any
}

export default function MockTestInterface({
  exam,
  questions,
  examId,
  courseId,
  subjectId,
  user
}: MockInterfaceProps) {
  const router = useRouter()
  const [stage, setStage] = useState<'instructions' | 'consent' | 'test' | 'report'>('instructions')
  
  const [timeLeft, setTimeLeft] = useState((exam.duration_minutes || 180) * 60)
  const [currentQIndex, setCurrentQIndex] = useState(0)
  
  const [answers, setAnswers] = useState<Record<string, string>>({}) 
  const [questionStatus, setQuestionStatus] = useState<Record<string, string>>({}) 
  const [reportData, setReportData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [reviewUrl, setReviewUrl] = useState<string | undefined>(undefined)

  // -- Empty State --
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-gray-200">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Info className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Questions Found</h2>
          <button onClick={() => router.back()} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold">Go Back</button>
        </div>
      </div>
    )
  }

  // -- Timer --
  useEffect(() => {
    if (stage !== 'test') return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit() 
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
    const isAnswered = !!answers[questions[currentQIndex].id]
    setQuestionStatus(prev => ({ ...prev, [questions[currentQIndex].id]: isAnswered ? 'answered' : 'not_answered' }))
    if (currentQIndex < questions.length - 1) setCurrentQIndex(prev => prev + 1)
  }

  const handleReviewNext = () => {
    const isAnswered = !!answers[questions[currentQIndex].id]
    setQuestionStatus(prev => ({ ...prev, [questions[currentQIndex].id]: isAnswered ? 'ans_and_review' : 'review' }))
    if (currentQIndex < questions.length - 1) setCurrentQIndex(prev => prev + 1)
  }

  const handleClear = () => {
    const newAnswers = { ...answers }
    delete newAnswers[questions[currentQIndex].id]
    setAnswers(newAnswers)
    setQuestionStatus(prev => ({ ...prev, [questions[currentQIndex].id]: 'not_answered' }))
  }

  // -- Submission Logic --
  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    const timeTaken = ((exam.duration_minutes || 180) * 60) - timeLeft
    
    try {
      const result = await submitExamAction(examId, courseId, subjectId, answers, timeTaken, 'mock')
      
      if (!result.success) {
        toast.error("Submission failed.")
        setIsSubmitting(false)
        return
      }

      const returnPath = encodeURIComponent('/dashboard')
      const url = result.redirectUrl || '/dashboard'
      setReviewUrl(url)

      setReportData({
        examTitle: exam.title || 'Test Result',
        sections: [],
        score: result.score ?? 0,            
        totalMarks: questions.length,
        correctCount: result.correct ?? 0,
        incorrectCount: result.incorrect ?? 0,
        unattemptedCount: questions.length - ((result.correct ?? 0) + (result.incorrect ?? 0)),
        timeTaken: timeTaken,
        predictedRank: null,
        predictedPercentile: null
      })
  
      setStage('report')
    } catch (error: any) {
      console.error("Submission failed", error)
      toast.error(error.message || "Failed to submit exam.")
    } finally {
      setIsSubmitting(false)
    }
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
        <ConsentStage onNext={() => setStage('test')} />
      )}

      {stage === 'test' && (
        <TestStage 
          questions={questions}
          currentQIndex={currentQIndex}
          setCurrentQIndex={setCurrentQIndex}
          timeLeft={timeLeft}
          answers={answers}
          questionStatus={questionStatus}
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
          predictedRank={reportData.predictedRank}
          predictedPercentile={reportData.predictedPercentile}
          onClose={() => router.push('/dashboard')} 
        />
      )}
    </>
  )
}
