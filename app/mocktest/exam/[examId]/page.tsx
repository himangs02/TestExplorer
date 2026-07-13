import MockTestInterface from '@/app/courses/[courseId]/subjects/[subjectId]/test/mock/[examId]/MockTestInterface'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
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
    

  // 2. Fetch Mock Test Details
  const mockTest = await prisma.exams.findUnique({
    where: { id: examId, category: 'mock' }
  })

  if (!mockTest) {
    console.error("Mock Test fetch error")
    return notFound()
  }

  // 3. Fetch Questions linked to this Mock Test
  const questionsData = await prisma.questions.findMany({
    where: { exam_id: examId },
    include: {
      question_options: true
    }
  })

  // 4. Transform Data (FIXED TYPE ERROR HERE)
  const questions = questionsData?.map((q: any) => ({
    id: q.id,
    // FIX 2: Map DB column 'text' to BOTH 'text' and 'question_text'
    // This satisfies the TypeScript error requiring 'text'
    text: q.text, 
    question_text: q.text, 
    options: q.question_options,
    marks: 4 // Default marks
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
      exam={mockTest as any}
      user={userData as any}
    />
  )
}