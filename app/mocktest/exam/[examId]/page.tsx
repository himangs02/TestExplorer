import MockTestInterface from '@/components/exam/MockTestInterface'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
// FIX 1: Ensure this imports from the correct components folder

export default async function MockExamPage({ 
  params 
}: { 
  params: Promise<{ examId: string }> 
}) {
  const { examId } = await params
  
  const session = await getServerSession(authOptions)
  if (!session?.user) return redirect('/login')

  // 2. FETCH USER PROFILE (For Role Check & Mock Interface)
  const userData = await prisma.users.findUnique({
    where: { id: session.user.id }
  })

  if (!userData) return notFound()
    

  // 2. Fetch Mock Test Details (check exams or mock_tests)
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

  // 3. Fetch Questions linked to this Mock Test
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

  // 4. Transform Data
  const questions = questionsData?.map((q: any) => ({
    id: q.id,
    text: q.text, 
    question_text: q.text, 
    options: q.question_options,
    marks: marksCorrect
  })) || []

  // 5. Get or Create Attempt (Session)
  let attempt = await prisma.exam_attempts.findFirst({
    where: {
      user_id: session.user.id,
      mock_test_id: examId,
      status: 'in_progress'
    },
    orderBy: { started_at: 'desc' }
  })

  if (!attempt) {
    try {
      const newAttempt = await prisma.exam_attempts.create({
        data: {
          user_id: session.user.id,
          mock_test_id: examId,
          status: 'in_progress',
          score: 0,
          duration_minutes: mockTest.duration_minutes || 0,
          answers: '{}',
          started_at: new Date()
        }
      })
      attempt = newAttempt
    } catch (attemptError) {
      console.error("Attempt creation failed:", attemptError)
      return redirect('/dashboard?error=Failed to start test session')
    }
  }
  
  return (
    <MockTestInterface
      examId={examId}
      courseId="standalone" 
      subjectId="standalone"
      questions={questions}
      exam={examWithStats as any}
      user={userData as any}
    />
  )
}