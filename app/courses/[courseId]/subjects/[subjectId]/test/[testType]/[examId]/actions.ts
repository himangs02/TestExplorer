'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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

  // 2. Fetch Questions
  let questions: any = []
  
  if (testType === 'practice') {
    questions = await prisma.questions.findMany({
      where: { practice_test_id: examId },
      select: { id: true, question_options: { select: { id: true, is_correct: true } } }
    })
  } else {
    const mockQs = await prisma.mock_test_questions.findMany({
      where: { mock_test_id: examId },
      select: {
        questions: { select: { id: true, question_options: { select: { id: true, is_correct: true } } } }
      }
    })
    questions = mockQs.map(m => m.questions)
  }

  if (!questions) {
    throw new Error('Failed to load exam data for grading.')
  }

  // 3. Calculate Score & Counts
  let correctCount = 0
  let incorrectCount = 0
  const totalQuestions = questions.length

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

  // Basic scoring: 1 mark per question (Update logic here if you implement negative marking)
  const score = correctCount 

  // 4. Save Attempt
  try {
    const percentageCalc = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    
    const attempt = await prisma.exam_attempts.create({
      data: {
        user_id: user.id,
        score: score,
        total_marks: totalQuestions,
        percentage: percentageCalc,
        time_taken_seconds: timeTaken,
        answers: JSON.stringify(answers),
        mock_test_id: testType === 'mock' ? examId : undefined,
        practice_test_id: testType === 'practice' ? examId : undefined 
      }
    })

    // 5. RETURN Data with Stats
    return { 
      success: true, 
      redirectUrl: `/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}/result/${attempt.id}`,
      score: score,
      correct: correctCount,
      incorrect: incorrectCount
    }
  } catch (error: any) {
    console.error('Submission Error:', error)
    throw new Error('Failed to save attempt')
  }
}