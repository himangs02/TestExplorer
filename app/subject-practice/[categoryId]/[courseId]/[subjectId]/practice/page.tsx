import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import TestInterface from '@/components/Courses/TestInterface'

export default async function ChapterPracticePage({
  params,
  searchParams
}: {
  params: Promise<{ categoryId: string; courseId: string; subjectId: string }>
  searchParams: Promise<{ chapterId?: string }>
}) {
  const { categoryId, courseId, subjectId } = await params
  const { chapterId } = await searchParams

  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return redirect('/login')

  // Fetch Subject
  const subject = await prisma.subjects.findUnique({
    where: { id: subjectId },
    include: {
      courses: {
        include: {
          categories: true
        }
      }
    }
  })

  if (!subject) return notFound()

  let practiceTitle = `${subject.title} Practice`
  let whereClause: any = { subject_id: subjectId, status: 'active' }

  if (chapterId) {
    const chapter = await prisma.chapters.findUnique({
      where: { id: chapterId }
    })
    if (chapter) {
      practiceTitle = chapter.name
      whereClause = { chapter_id: chapterId, status: 'active' }
    }
  }

  // Fetch questions for this chapter
  const questions = await prisma.questions.findMany({
    where: whereClause,
    orderBy: { order_index: 'asc' },
    select: {
      id: true,
      text: true,
      direction: true,
      question_options: {
        select: {
          id: true,
          text: true
        }
      }
    }
  })

  // Format questions for TestInterface
  const formattedQuestions = questions.map((q) => ({
    id: q.id,
    text: q.text,
    direction: q.direction,
    options: q.question_options.map((opt) => ({
      id: opt.id,
      text: opt.text
    }))
  }))

  const examData = {
    id: chapterId || subjectId,
    title: practiceTitle,
    duration_minutes: Math.max(15, Math.ceil(formattedQuestions.length * 1.5)) || 30,
    total_marks: formattedQuestions.length
  }

  const submitChapterPracticeAction = async (answers: Record<string, string>, timeTaken: number) => {
    'use server'
    const s = await getServerSession(authOptions)
    const u = s?.user
    if (!u) throw new Error('Unauthorized')

    // Fetch questions with correct answers to grade
    const fullQuestions = await prisma.questions.findMany({
      where: whereClause,
      select: {
        id: true,
        question_options: {
          select: { id: true, is_correct: true }
        }
      }
    })

    let correctCount = 0
    let incorrectCount = 0
    const totalQuestions = fullQuestions.length

    fullQuestions.forEach((q) => {
      const correctOption = q.question_options.find((o) => o.is_correct)
      const userSelectedOptionId = answers[q.id]
      if (userSelectedOptionId) {
        if (correctOption && userSelectedOptionId === correctOption.id) {
          correctCount += 1
        } else {
          incorrectCount += 1
        }
      }
    })

    const percentageCalc = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

    let attemptId = ''
    try {
      const attempt = await prisma.exam_attempts.create({
        data: {
          user_id: u.id,
          score: correctCount,
          total_marks: totalQuestions,
          percentage: percentageCalc,
          time_taken_seconds: timeTaken,
          answers: JSON.stringify(answers),
          status: 'completed'
        }
      })
      attemptId = attempt.id
    } catch (err) {
      console.error('Error saving chapter practice attempt:', err)
    }

    const testExamId = chapterId || subjectId
    const redirectUrl = attemptId 
      ? `/courses/${courseId}/subjects/${subjectId}/test/chapter-practice/${testExamId}/result/${attemptId}?returnTo=${encodeURIComponent(`/courses/${courseId}/subjects/${subjectId}`)}`
      : `/courses/${courseId}/subjects/${subjectId}`

    return {
      success: true,
      redirectUrl
    }
  }

  return (
    <TestInterface 
      exam={examData} 
      questions={JSON.parse(JSON.stringify(formattedQuestions))} 
      courseId={courseId}
      subjectId={subjectId}
      testType="chapter-practice"
      submitAction={submitChapterPracticeAction}
    />
  )
}
