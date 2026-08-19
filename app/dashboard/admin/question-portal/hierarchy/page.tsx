import { prisma } from '@/lib/prisma'
import TreeView from '@/components/admin/tree-view'

export default async function HierarchyPage() {
  const rawSubjects = await prisma.subjects.findMany({
    include: {
      _count: { select: { chapters: true, questions: true } },
      chapters: {
        include: {
          _count: { select: { topics: true, questions: true } },
          topics: {
            include: {
              _count: { select: { questions: true } }
            },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { title: 'asc' }
  })

  const subjects = rawSubjects.map(subject => ({
    ...subject,
    _count: {
      ...subject._count,
      topics: subject.chapters.reduce((sum, ch) => sum + (ch._count?.topics || ch.topics?.length || 0), 0)
    }
  }))

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hierarchy View</h1>
        <p className="text-gray-500 font-medium">Visual representation of Subjects, Chapters, and Topics.</p>
      </div>
      
      <TreeView subjects={subjects} />
    </div>
  )
}
