'use server'

import { prisma } from '@/lib/prisma'

export async function submitMockTestAction(
  examId: string,
  attemptId: string,
  answers: Record<string, string>,
  timeTaken: number
) {
  try {
    const mockData = await prisma.mock_tests.findUnique({
      where: { id: examId },
      select: { marks_correct: true, marks_incorrect: true }
    })

    if (!mockData) {
      return { error: "Failed to load exam settings" }
    }

    const MARKS_CORRECT = mockData.marks_correct ?? 4
    const MARKS_INCORRECT = mockData.marks_incorrect ?? -1

    const questions = await prisma.questions.findMany({
      where: { 
        mock_test_questions: { some: { mock_test_id: examId } } 
      },
      select: { 
        id: true, 
        question_options: { select: { id: true, is_correct: true } }
      }
    })

    if (!questions) return { error: "Exam questions not found" }

    let correct = 0
    let incorrect = 0
    let score = 0

    questions.forEach(q => {
      const userAnswerId = answers[q.id]
      if (userAnswerId) {
        const correctOption = q.question_options.find(o => o.is_correct)
        
        if (correctOption && correctOption.id === userAnswerId) {
          correct++
          score += Number(MARKS_CORRECT)
        } else {
          incorrect++
          score += Number(MARKS_INCORRECT)
        }
      }
    })

    await prisma.exam_attempts.update({
      where: { id: attemptId },
      data: {
        score,
        time_taken_seconds: timeTaken,
        status: 'COMPLETED'
      }
    })

    return { 
      success: true, 
      score,
      totalMarks: questions.length * Number(MARKS_CORRECT),
      correct,
      incorrect
    }
  } catch (error: any) {
    console.error("Submission error:", error)
    return { error: "Failed to submit exam" }
  }
}
