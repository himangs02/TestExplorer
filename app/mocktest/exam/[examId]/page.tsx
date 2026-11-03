import MockTestInterface from '@/components/exam/MockTestInterface'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function MockExamPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ examId: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { examId } = await params
  const resolvedSearchParams = searchParams ? await searchParams : {}
  const isRetake = resolvedSearchParams?.retake === 'true'
  
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect('/login')

  // 1. GUARD: If test is already submitted, redirect to result page (unless explicit retake)
  if (!isRetake) {
    const completedAttempt = await prisma.exam_attempts.findFirst({
      where: {
        user_id: session.user.id,
        status: 'completed',
        OR: [
          { mock_test_id: examId },
          { exam_id: examId }
        ]
      },
      orderBy: { completed_at: 'desc' },
      include: {
        mock_tests: {
          select: {
            subject_id: true,
            course_id: true,
            subjects: { select: { course_id: true } }
          }
        },
        exams: {
          select: {
            subject_id: true,
            course_id: true,
            subjects: { select: { course_id: true } }
          }
        }
      }
    })

    if (completedAttempt) {
      const mockData = completedAttempt.mock_tests || completedAttempt.exams
      const subjectId = mockData?.subject_id || 'general'
      const courseId = mockData?.course_id || (mockData as any)?.subjects?.course_id || 'standalone'
      return redirect(`/courses/${courseId}/subjects/${subjectId}/test/mock/${examId}/result/${completedAttempt.id}`)
    }
  }

  // 2. FETCH USER PROFILE (For Role Check & Mock Interface)
  const userData = await prisma.users.findUnique({
    where: { id: session.user.id }
  })

  if (!userData) return notFound()

  // 3. Fetch Mock Test Details (check exams or mock_tests)
  let mockTest: any = await prisma.exams.findUnique({
    where: { id: examId, category: 'mock' }
  })

  if (!mockTest) {
    mockTest = await prisma.mock_tests.findUnique({
      where: { id: examId }
    })
  }

  if (!mockTest) {
    console.error("Mock Test fetch error")
    return notFound()
  }

  // 4. Fetch Questions linked to this Mock Test
  let questionsData = await prisma.questions.findMany({
    where: { exam_id: examId },
    include: {
      question_options: true
    }
  })

  if (!questionsData || questionsData.length === 0) {
    const mockQs = await prisma.mock_test_questions.findMany({
      where: { mock_test_id: examId },
      include: {
        questions: {
          include: {
            question_options: true
          }
        }
      }
    })
    questionsData = mockQs.map(m => m.questions as any)
  }

  const marksCorrect = Number(mockTest.marks_correct) || 4
  const marksIncorrect = Math.abs(Number(mockTest.marks_incorrect)) || 1
  const totalQuestionsCount = questionsData?.length || 30
  const totalMarks = mockTest.total_marks || (totalQuestionsCount * marksCorrect)

  const examWithStats = {
    ...mockTest,
    total_questions: totalQuestionsCount,
    total_marks: totalMarks,
    marks_correct: marksCorrect,
    marks_incorrect: marksIncorrect,
    negative_marking: true
  }

  // 5. Transform Data
  const questions = questionsData?.map((q: any) => ({
    id: q.id,
    text: q.text, 
    question_text: q.text, 
    options: q.question_options,
    marks: marksCorrect
  })) || []

  const subjectId = mockTest.subject_id || 'standalone'
  const courseId = mockTest.course_id || 'standalone'

  return (
    <MockTestInterface
      examId={examId}
      courseId={courseId} 
      subjectId={subjectId}
      questions={questions}
      exam={examWithStats as any}
      user={userData as any}
      isRetake={isRetake}
    />
  )
}
