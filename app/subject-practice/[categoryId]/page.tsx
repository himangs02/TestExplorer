import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, BookOpen } from 'lucide-react'

export default async function SubjectPracticeCoursePage({ 
  params 
}: { 
  params: Promise<{ categoryId: string }> 
}) {
  const { categoryId } = await params

  // 1. Fetch Category Info
  const category = await prisma.categories.findUnique({
    where: { id: categoryId }
  })

  if (!category) return notFound()

  // 2. Fetch Courses in this Category
  const courses = await prisma.courses.findMany({
    where: { category_id: categoryId, is_published: true },
    include: {
      _count: {
        select: {
          subjects: {
            where: { status: 'active' }
          }
        }
      }
    }
  })

  // --- LIST VIEW ---
  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 h-20 flex items-center gap-4 border-b border-gray-100">
        <Link href="/subject-practice" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Streams
        </Link>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-12">
          <span className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2 block">
            {category.title}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            Select a Course
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(!courses || courses.length === 0) ? (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 font-medium">
              No courses found in this stream yet.
            </div>
          ) : (
            courses.map((course) => (
              <Link 
                key={course.id}
                href={`/subject-practice/${categoryId}/${course.id}`} 
                className="group block relative"
              >
                <div className="relative z-10 p-8 rounded-4xl border-2 border-black bg-white transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-green-50 text-green-700 p-3 rounded-xl">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <ArrowUpRight className="w-6 h-6 text-gray-300 group-hover:text-black transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  {course.description && (
                    <p className="text-gray-500 font-medium text-sm line-clamp-2">{course.description}</p>
                  )}
                  <div className="mt-4 flex gap-4">
                    <span className="text-black font-bold text-xs bg-gray-100 px-3 py-1 rounded-full border border-black/10">
                      {course._count.subjects} Subjects
                    </span>
                  </div>
                  <div className="mt-6 flex items-center text-sm font-bold text-green-600 group-hover:text-green-700 transition-colors">
                    View Subjects <span className="ml-1">→</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
