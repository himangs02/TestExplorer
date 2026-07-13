import { prisma } from '@/lib/prisma'
import ExamsClient from './exams-client'

export default async function ExamsAdminPage() {
  // Fetch Full Hierarchy: 
  // Streams -> Courses -> Subjects -> (Prep, Mock, Practice)
  const streams = await prisma.categories.findMany({
    select: {
      id: true,
      title: true,
      courses: {
        select: {
          id: true,
          title: true,
          subjects: {
            select: {
              id: true,
              title: true,
              prep_modules: {
                select: { id: true, title: true, is_published: true, created_at: true }
              },
              practice_tests: {
                select: { id: true, title: true, is_published: true, created_at: true }
              },
              mock_tests: {
                select: { id: true, title: true, is_active: true, created_at: true }
              }
            }
          }
        }
      }
    },
    orderBy: { order_index: 'asc' }
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Content Library</h1>
        <p className="text-gray-500">Manage Prep Modules, Practice Tests, and Mock Exams organized by stream.</p>
      </div>

      {/* @ts-ignore */}
      <ExamsClient streams={streams} />
    </div>
  )
}