'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function submitExamAction(
  examId: string, 
  courseId: string,
  subjectId: string,
  answers: Record<string, string>, 
  timeTaken: number,
  testType: string
) {
  // 1. Check User Session
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) throw new Error('Unauthorized')

  // 2. Fetch Exam & Questions
  let questions: any = []
  let examRecord: any = null
  let isMockTest = false
  let isExam = false
  
  if (testType === 'practice') {
    examRecord = await prisma.practice_tests.findUnique({ where: { id: examId } })
    questions = await prisma.questions.findMany({
      where: { practice_test_id: examId },
      select: { id: true, question_options: { select: { id: true, is_correct: true } } }
    })
  } else {
    // Check mock_tests first, then exams table
    examRecord = await prisma.mock_tests.findUnique({ where: { id: examId } })
    if (examRecord) {
      isMockTest = true
    } else {
      examRecord = await prisma.exams.findUnique({ where: { id: examId } })
      if (examRecord) {
        isExam = true
      }
    }

    const mockQs = await prisma.mock_test_questions.findMany({
      where: { mock_test_id: examId },
      select: {
        questions: { select: { id: true, question_options: { select: { id: true, is_correct: true } } } }
      }
    })
    questions = mockQs.map(m => m.questions)

    // Fallback if questions are linked via exam_id
    if (!questions || questions.length === 0) {
      questions = await prisma.questions.findMany({
        where: { exam_id: examId },
        select: { id: true, question_options: { select: { id: true, is_correct: true } } }
      })
    }
  }

  if (!questions || questions.length === 0) {
    throw new Error('Failed to load exam data for grading.')
  }

  // 3. Calculate Score & Counts (+4 for correct, -1 for incorrect in Mock Tests)
  let correctCount = 0
  let incorrectCount = 0
  const totalQuestions = questions.length

  const marksCorrect = testType === 'mock' ? (Number(examRecord?.marks_correct) || 4) : 1
  const marksIncorrect = testType === 'mock' ? (Math.abs(Number(examRecord?.marks_incorrect)) || 1) : 0

  questions.forEach((q: { id: string; question_options: { id: string; is_correct: boolean | null }[] }) => {
    const correctOption = q.question_options.find((o: { id: string; is_correct: boolean | null }) => o.is_correct)
    const userSelectedOptionId = answers[q.id]
    
    // Check if user attempted the question
    if (userSelectedOptionId) {
      if (correctOption && userSelectedOptionId === correctOption.id) {
        correctCount += 1
      } else {
        incorrectCount += 1
      }
    }
  })

  const attemptedCount = correctCount + incorrectCount
  const unattemptedCount = Math.max(0, totalQuestions - attemptedCount)
  const score = (correctCount * marksCorrect) - (incorrectCount * marksIncorrect)
  const totalMarks = examRecord?.total_marks || (totalQuestions * marksCorrect) || 120

  // 4. Save Attempt
  try {
    // True Accuracy = (correct / attempted) * 100
    const accuracyCalc = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0
    const scorePercentage = totalMarks > 0 ? Math.max(0, Math.round((score / totalMarks) * 100)) : 0

    // Compute approximate rank / percentile
    let approxRank = null
    let approxPercentile = null
    try {
      const rankPred = await prisma.exam_rank_predictions.findFirst({
        where: {
          exam_id: examId,
          min_score: { lte: score },
          max_score: { gte: score }
        }
      })
      if (rankPred) {
        approxRank = rankPred.approx_rank
        approxPercentile = rankPred.approx_percentile
      } else {
        const ratio = totalMarks > 0 ? Math.max(0, Math.min(1, score / totalMarks)) : 0
        const p = Math.min(99.9, Math.max(10, Math.round((ratio * 80 + 19) * 10) / 10))
        approxPercentile = `${p}%`
        approxRank = `~${Math.max(100, Math.round((1 - p / 100) * 1200000)).toLocaleString('en-IN')}`
      }
    } catch (e) {
      console.error('Rank prediction lookup failed:', e)
    }

    const attempt = await prisma.exam_attempts.create({
      data: {
        user_id: user.id,
        score: score,
        total_marks: totalMarks,
        percentage: accuracyCalc,
        time_taken_seconds: timeTaken,
        answers: JSON.stringify(answers),
        mock_test_id: isMockTest ? examId : undefined,
        practice_test_id: testType === 'practice' ? examId : undefined,
        exam_id: isExam ? examId : undefined,
        status: 'completed',
        completed_at: new Date()
      }
    })

    // 5. RETURN Data with Complete Stats
    return { 
      success: true, 
      redirectUrl: `/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}/result/${attempt.id}`,
      attemptId: attempt.id,
      examTitle: examRecord?.title || 'Mock Test Result',
      score: score,
      totalMarks: totalMarks,
      correct: correctCount,
      incorrect: incorrectCount,
      unattempted: unattemptedCount,
      percentage: scorePercentage,
      accuracy: accuracyCalc,
      predictedRank: approxRank,
      predictedPercentile: approxPercentile
    }
  } catch (error: any) {
    console.error('Submission Error:', error)
    throw new Error('Failed to save attempt')
  }
}