import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ReviewInterface from '@/components/Courses/ReviewInterface'

export default async function ReviewPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ courseId: string; subjectId: string; testType: string; examId: string; attemptId: string }> 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { courseId, subjectId, testType, examId, attemptId } = await params
  const { returnTo } = await searchParams

  // 1. Fetch Attempt (User Answers)
  const attempt = await prisma.exam_attempts.findUnique({
    where: { id: attemptId },
    select: { answers: true }
  })

  if (!attempt) return notFound()

  // 2. Fetch Exam Title
  let examTitle = 'Unknown Test'
  let questions: any = []

  if (testType === 'practice') {
    const data = await prisma.practice_tests.findUnique({ where: { id: examId }, select: { title: true } })
    if (data) examTitle = data.title

    questions = await prisma.questions.findMany({
      where: { practice_test_id: examId },
      orderBy: { order_index: 'asc' },
      select: {
        id: true,
        text: true,
        explanation: true,
        question_options: { select: { id: true, text: true, is_correct: true } }
      }
    })
  } else if (testType === 'chapter-practice') {
    const chapter = await prisma.chapters.findUnique({
      where: { id: examId },
      select: { name: true }
    })
    if (chapter) {
      examTitle = chapter.name
      questions = await prisma.questions.findMany({
        where: { chapter_id: examId, status: 'active' },
        orderBy: { order_index: 'asc' },
        select: {
          id: true,
          text: true,
          explanation: true,
          question_options: { select: { id: true, text: true, is_correct: true } }
        }
      })
    } else {
      const subject = await prisma.subjects.findUnique({
        where: { id: examId },
        select: { title: true }
      })
      if (subject) examTitle = `${subject.title} Practice`
      questions = await prisma.questions.findMany({
        where: { subject_id: examId, status: 'active' },
        orderBy: { order_index: 'asc' },
        select: {
          id: true,
          text: true,
          explanation: true,
          question_options: { select: { id: true, text: true, is_correct: true } }
        }
      })
    }
  } else {
    const data = await prisma.mock_tests.findUnique({ where: { id: examId }, select: { title: true } })
    if (data) examTitle = data.title

    const mockQs = await prisma.mock_test_questions.findMany({
      where: { mock_test_id: examId },
      orderBy: { created_at: 'asc' },
      select: {
        questions: {
          select: {
            id: true,
            text: true,
            explanation: true,
            question_options: { select: { id: true, text: true, is_correct: true } }
          }
        }
      }
    })
    questions = mockQs.map(m => m.questions)
  }

  if (!questions) return <div>Failed to load questions.</div>

  // Normalize `question_options` to `options` for ReviewInterface
  const formattedQuestions = questions.map((q: any) => ({
    ...q,
    options: q.question_options
  }))

  // Link to go back to (Result Page)
  const defaultBack = `/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}/result/${attemptId}`
  const backLink = returnTo ? decodeURIComponent(returnTo as string) : defaultBack
  
  const parsedAnswers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers;

  return (
    <ReviewInterface 
      examTitle={examTitle}
      questions={formattedQuestions}
      userAnswers={(parsedAnswers as Record<string, string>) || {}} // Ensure defaults if null
      backLink={backLink}
    />
  )
}