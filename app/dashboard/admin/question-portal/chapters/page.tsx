import { prisma } from '@/lib/prisma'
import ChapterManager from '@/components/admin/chapter-manager'

export default async function ChaptersPage() {
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
    include: {
      subjects: {
        select: { id: true, title: true }
      },
      _count: {
        select: { topics: true, questions: true }
      }
    },
    orderBy: [
      { subjects: { title: 'asc' } },
      { order: 'asc' }
    ]
  })

  // Format data for the client
  const formattedChapters = chapters.map(ch => ({
    id: ch.id,
    subject_id: ch.subject_id,
    subject_name: ch.subjects?.title || 'Unknown',
    name: ch.name,
    description: ch.description,
    order: ch.order,
    status: ch.status,
    topics_count: ch._count.topics,
    questions_count: ch._count.questions
  }))

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Chapter Management</h1>
        <p className="text-gray-500 font-medium">Create, edit, and organize chapters under subjects.</p>
      </div>

      <ChapterManager chapters={formattedChapters} subjects={subjects} courses={courses} />
    </div>
  )
}
