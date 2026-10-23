import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
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

  const hasFullAccess = true // !!enrollment || isAdmin

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
     let mockExam = await prisma.mock_tests.findUnique({ where: { id: examId } })
     if (mockExam) {
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

        // Fallback if questions are assigned directly via questions table
        if (!questionsData || questionsData.length === 0) {
          const directQs = await prisma.questions.findMany({
            where: { exam_id: examId },
            orderBy: { order_index: 'asc' },
            select: {
              id: true,
              text: true,
              direction: true,
              question_options: { select: { id: true, text: true } }
            }
          })
          questionsData = directQs.map(dq => ({
            ...dq,
            options: dq.question_options
          }))
        }

        const totalQs = questionsData?.length || 30
        const marksCorrect = Number(mockExam.marks_correct) || 4
        const marksIncorrect = Math.abs(Number(mockExam.marks_incorrect)) || 1
        const maxMarks = mockExam.total_marks || (totalQs * marksCorrect)

        examData = {
          id: mockExam.id,
          title: mockExam.title,
          description: mockExam.description,
          duration_minutes: mockExam.duration_minutes || 60,
          total_marks: maxMarks,
          total_questions: totalQs,
          marks_correct: marksCorrect,
          marks_incorrect: marksIncorrect,
          negative_marking: true
        }
     } else {
        // Fallback to exams table
        const altExam = await prisma.exams.findUnique({ where: { id: examId } })
        if (altExam) {
          const directQs = await prisma.questions.findMany({
            where: { exam_id: examId },
            orderBy: { order_index: 'asc' },
            select: {
              id: true,
              text: true,
              direction: true,
              question_options: { select: { id: true, text: true } }
            }
          })
          questionsData = directQs.map(dq => ({
            ...dq,
            options: dq.question_options
          }))

          const totalQs = questionsData?.length || 30
          const marksCorrect = Number(altExam.marks_correct) || 4
          const marksIncorrect = Math.abs(Number(altExam.marks_incorrect)) || 1
          const maxMarks = altExam.total_marks || (totalQs * marksCorrect)

          examData = {
            id: altExam.id,
            title: altExam.title,
            description: altExam.description,
            duration_minutes: altExam.duration_minutes || 60,
            total_marks: maxMarks,
            total_questions: totalQs,
            marks_correct: marksCorrect,
            marks_incorrect: marksIncorrect,
            negative_marking: true
          }
        }
     }
  }

  if (!examData) return notFound()

  // 5. RENDER MOCK INTERFACE
  if (testType === 'mock') {
    return (
      <MockTestInterface 
         exam={examData} 
         questions={JSON.parse(JSON.stringify(questionsData || []))} 
         courseId={courseId}
         subjectId={subjectId}
         examId={examId}
         user={JSON.parse(JSON.stringify(userData))} 
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
      questions={JSON.parse(JSON.stringify(questionsData || []))} 
      courseId={courseId}
      subjectId={subjectId}
      testType={testType}
      submitAction={bindedSubmitAction}
    />
  )
}