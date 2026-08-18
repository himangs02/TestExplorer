import { prisma } from '@/lib/prisma'
import QuestionListClient from '@/components/admin/question-list-client'

export default async function QuestionsPage() {
  const rawSubjects = await prisma.subjects.findMany({
    select: { 
      id: true, 
      title: true,
      courses: {
        select: {
          title: true,
          categories: { select: { title: true } }
        }
      }
    },
    orderBy: { title: 'asc' }
  })

  const subjects = rawSubjects.map(sub => {
    let suffix = ''
    if (sub.courses) {
      suffix = ` (${sub.courses.title}`
      if (sub.courses.categories?.title) {
        suffix += ` - ${sub.courses.categories.title}`
      }
      suffix += `)`
    }
    return { id: sub.id, title: `${sub.title}${suffix}` }
  })

  const chapters = await prisma.chapters.findMany({
    select: { id: true, name: true, subject_id: true },
    orderBy: { order: 'asc' }
  })

  const topics = await prisma.topics.findMany({
    select: { id: true, name: true, chapter_id: true },
    orderBy: { order: 'asc' }
  })

  // Fetch initial questions
  const initialQuestions = await prisma.questions.findMany({
    where: { 
      OR: [
        { subject_id: { not: null } },
        { chapter_id: { not: null } }
      ]
    },
    take: 100,
    orderBy: { created_at: 'desc' },
    include: {
      subjects: { select: { title: true } },
      chapters: { select: { name: true } },
      topics: { select: { name: true } }
    }
  })

  const serializedQuestions = initialQuestions.map(q => ({
    ...q,
    marks: q.marks ? Number(q.marks) : null,
    negative_marks: q.negative_marks ? Number(q.negative_marks) : null
  }))

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Question Management</h1>
        <p className="text-gray-500 font-medium">Manage individual questions, assign subjects, chapters, and topics or bulk upload via CSV.</p>
      </div>

      <QuestionListClient 
        initialQuestions={serializedQuestions}
        subjects={subjects}
        chapters={chapters}
        topics={topics}
      />
    </div>
  )
}
