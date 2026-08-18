import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight, BookOpen } from 'lucide-react'

export default async function SubjectPracticeSubjectsPage({ 
  params 
}: { 
  params: Promise<{ categoryId: string, courseId: string }> 
}) {
  const { categoryId, courseId } = await params

  // 1. Fetch Course Info
  const course = await prisma.courses.findUnique({
    where: { id: courseId },
    include: {
      categories: true
    }
  })

  if (!course) return notFound()

  // 2. Fetch Subjects in this Course
  const subjects = await prisma.subjects.findMany({
    where: { course_id: courseId, status: 'active' },
    orderBy: { title: 'asc' },
    include: {
      _count: {
        select: {
          chapters: true,
          questions: {
            where: { chapter_id: { not: null } }
          }
        }
      }
    }
  })

  const rawBg = course.categories?.bg_color || 'bg-gray-50'
  const isArbitrary = rawBg.startsWith('bg-[#') && rawBg.endsWith(']')
  const hexColor = isArbitrary ? rawBg.slice(4, -1) : null
  
  const finalClass = hexColor ? '' : rawBg
  const finalStyle = hexColor ? { backgroundColor: hexColor } : undefined

  // --- LIST VIEW ---
  return (
    <div className="min-h-screen bg-white">
      <header className="px-6 h-20 flex items-center gap-4 border-b border-gray-100">
        <Link href={`/subject-practice/${categoryId}`} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to {course.categories?.title || 'Courses'}
        </Link>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-12">
          <span className="text-sm font-bold text-green-600 uppercase tracking-widest mb-2 block">
            {course.title}
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            Select a Subject
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(!subjects || subjects.length === 0) ? (
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-400 font-medium md:col-span-2 lg:col-span-3">
              No subjects found in this course yet.
            </div>
          ) : (
            subjects.map((subject) => (
              <Link 
                key={subject.id} 
                href={`/subject-practice/${categoryId}/${courseId}/${subject.id}`}
                className="group relative block"
              >
                <div 
                  className={`
                    relative z-10 h-full p-8 rounded-[2.5rem] border-2 border-black 
                    transition-all duration-300 ease-out
                    group-hover:-translate-y-2 group-hover:translate-x-1 group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                    ${finalClass}
                  `}
                  style={finalStyle}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-white border-2 border-black rounded-2xl flex items-center justify-center">
                      <BookOpen className="w-7 h-7 text-black" />
                    </div>
                    <div className="bg-white rounded-full p-3 border-2 border-black transition-transform group-hover:rotate-45">
                      <ArrowUpRight className="w-5 h-5 text-black" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-3xl font-black text-black mb-2 tracking-tight line-clamp-1">
                      {subject.title}
                    </h4>
                    <div className="flex gap-4 mt-4">
                      <span className="text-black font-bold text-sm bg-white/50 px-3 py-1 rounded-full border border-black/20">
                        {subject._count.chapters} Chapters
                      </span>
                      <span className="text-black font-bold text-sm bg-white/50 px-3 py-1 rounded-full border border-black/20">
                        {subject._count.questions} Questions
                      </span>
                    </div>
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
