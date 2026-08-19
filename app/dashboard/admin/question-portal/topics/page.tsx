import { prisma } from '@/lib/prisma'
import TopicManager from '@/components/admin/topic-manager'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function TopicsPage() {
  const courses = await prisma.courses.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' }
  })

  const rawSubjects = await prisma.subjects.findMany({
    select: { 
      id: true, 
      title: true,
      course_id: true,
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
    return { id: sub.id, title: `${sub.title}${suffix}`, course_id: sub.course_id }
  })

  const chapters = await prisma.chapters.findMany({
    select: { id: true, name: true, subject_id: true, subjects: { select: { title: true } } },
    orderBy: [
      { subjects: { title: 'asc' } },
      { order: 'asc' }
    ]
  })

  const topics = await prisma.topics.findMany({
    include: {
      chapters: {
        select: { id: true, name: true, subjects: { select: { title: true } } }
      },
      _count: {
        select: { questions: true }
      }
    },
    orderBy: [
      { chapters: { name: 'asc' } },
      { order: 'asc' }
    ]
  })

  // Format data for the client
  const formattedTopics = topics.map(t => ({
    id: t.id,
    chapter_id: t.chapter_id,
    chapter_name: t.chapters?.name || 'Unknown',
    subject_name: t.chapters?.subjects?.title || 'Unknown',
    name: t.name,
    description: t.description,
    order: t.order,
    status: t.status,
    questions_count: t._count.questions
  }))

  const formattedChapters = chapters.map(ch => ({
    id: ch.id,
    name: ch.name,
    subject_id: ch.subject_id,
    subject_name: ch.subjects?.title || 'Unknown'
  }))

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <Link 
          href="/dashboard/admin/question-portal" 
          className="inline-flex items-center gap-2 text-gray-500 font-bold hover:text-black transition-colors mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Question Portal
        </Link>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Topic Management</h1>
        <p className="text-gray-500 font-medium">Create, edit, and organize topics within chapters.</p>
      </div>

      <TopicManager 
        topics={formattedTopics} 
        chapters={formattedChapters} 
        subjects={subjects}
        courses={courses}
      />
    </div>
  )
}
