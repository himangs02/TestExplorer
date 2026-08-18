import { prisma } from '@/lib/prisma'
import ContentManager from '@/components/admin/content-manager'

export default async function ManageContentPage() {
  // --- CRITICAL: We must request 'subjects' nested inside 'courses' ---
  const streams = await prisma.categories.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      icon_key: true,
      bg_color: true,
      order_index: true,
      courses: {
        select: {
          id: true,
          title: true,
          description: true,
          is_published: true,
          subjects: {
            select: {
              id: true,
              title: true,
              status: true,
              chapters: {
                select: {
                  _count: { select: { topics: true } }
                }
              },
              _count: {
                select: {
                  chapters: true,
                  questions: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { order_index: 'asc' }
  })

  // We need to map over streams to calculate topics count from chapters
  const processedStreams = streams.map(stream => ({
    ...stream,
    courses: stream.courses.map(course => ({
      ...course,
      subjects: course.subjects.map(subject => {
        const topicsCount = subject.chapters.reduce((sum, ch) => sum + (ch._count?.topics || 0), 0)
        return {
          ...subject,
          _count: {
            ...subject._count,
            topics: topicsCount
          }
        }
      })
    }))
  }))

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      {/* @ts-ignore */}
      <ContentManager streams={processedStreams || []} />
    </div>
  )
}