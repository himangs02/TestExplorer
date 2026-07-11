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
              title: true
            }
          }
        }
      }
    },
    orderBy: { order_index: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      {/* @ts-ignore */}
      <ContentManager streams={streams || []} />
    </div>
  )
}