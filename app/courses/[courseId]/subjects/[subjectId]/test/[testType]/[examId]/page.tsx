import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import AccessDenied from '@/components/ui/access-denied'
// Ensure these paths match your project structure
import MockTestInterface from '@/components/exam/MockTestInterface' 
import TestInterface from '@/components/Courses/TestInterface' 
import { submitExamAction } from './actions' 

export default async function TestPage({ 
  params 
}: { 
  params: Promise<{ courseId: string; subjectId: string; testType: string; examId: string }> 
}) {
  const { courseId, subjectId, testType, examId } = await params

  // 1. AUTHENTICATE USER
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return redirect('/login')

  // 2. FETCH USER PROFILE (For Role Check & Mock Interface)
  const userData = await prisma.profiles.findUnique({
    where: { id: user.id }
  })

  // 3. CHECK ACCESS (Freemium Logic)
  // A. Check Enrollment
  const enrollment = await prisma.student_enrollments.findFirst({
    where: { user_id: user.id, subject_id: subjectId },
    select: { id: true }
  })

  // B. Check Admin Role
  const isAdmin = userData?.role === 'super_admin' || userData?.role === 'school_admin'
  const hasFullAccess = !!enrollment || isAdmin

  // 🔒 GATEKEEPING: If no full access, check if this test is in the "Free" tier (Top 2)
  if (!hasFullAccess) {
     let isAllowed = false

     if (testType === 'practice') {
        // Fetch top 2 practice tests (Free Tier)
        const allowedTests = await prisma.practice_tests.findMany({
          where: { subject_id: subjectId, is_published: true },
          orderBy: { created_at: 'desc' }, // Must match Subject Page sort order
          select: { id: true },
          take: 2
        })
        
        isAllowed = allowedTests?.some(t => t.id === examId) || false
     } 
     else if (testType === 'mock') {
        // Fetch top 2 mock tests (Free Tier)
        const allowedTests = await prisma.mock_tests.findMany({
          where: { subject_id: subjectId, is_active: true },
          orderBy: { created_at: 'desc' }, // Must match Subject Page sort order
          select: { id: true },
          take: 2
        })
           
        isAllowed = allowedTests?.some(t => t.id === examId) || false
     }

     if (!isAllowed) {
        return <AccessDenied subjectTitle="Restricted Test" />
     }
  }

  // 4. FETCH EXAM DATA
  let examData: any = null
  let questionsData: any = null
  
  if (testType === 'practice') {
     examData = await prisma.practice_tests.findUnique({ where: { id: examId } })
     if(examData) {
        const q = await prisma.questions.findMany({
          where: { practice_test_id: examId },
          orderBy: { order_index: 'asc' },
          select: {
            id: true,
            text: true,
            direction: true,
            question_options: { select: { id: true, text: true } }
          }
        })
        questionsData = q.map(question => ({
          ...question,
          options: question.question_options
        }))
     }
  } else {
     // MOCK
     const mockExam = await prisma.mock_tests.findUnique({ where: { id: examId } })
     if(mockExam) {
        // Strip Decimals to avoid Client Component serialization errors
        examData = {
          id: mockExam.id,
          title: mockExam.title,
          description: mockExam.description,
          duration_minutes: mockExam.duration_minutes,
          total_marks: mockExam.total_marks
        }

        const q = await prisma.mock_test_questions.findMany({
          where: { mock_test_id: examId },
          orderBy: { created_at: 'asc' },
          select: {
            questions: {
              select: {
                id: true,
                text: true,
                direction: true,
                question_options: { select: { id: true, text: true } }
              }
            }
          }
        })
        questionsData = q.map(mockQ => ({
          ...mockQ.questions,
          options: mockQ.questions.question_options
        }))
     }
  }

  if (!examData) return notFound()

  // 5. RENDER MOCK INTERFACE
  if (testType === 'mock') {
    return (
      <MockTestInterface 
         exam={examData} 
         questions={questionsData || []} 
         courseId={courseId}
         subjectId={subjectId}
         examId={examId}
         user={userData} 
      />
    )
  }

  // 6. RENDER STANDARD PRACTICE INTERFACE
  const bindedSubmitAction = async (answers: Record<string, string>, timeTaken: number) => {
    'use server'
    return await submitExamAction(examId, courseId, subjectId, answers, timeTaken, testType)
  }

  return (
    <TestInterface 
      exam={examData} 
      questions={questionsData || []} 
      courseId={courseId}
      subjectId={subjectId}
      testType={testType}
      submitAction={bindedSubmitAction}
    />
  )
}