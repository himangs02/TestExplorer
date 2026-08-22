import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, Hash } from 'lucide-react'
import { notFound } from 'next/navigation'
import { CourseContentTabs } from '@/components/Courses/CourseContentTabs'

export default async function CourseSubjectsPage({ 
  params 
}: { 
  params: Promise<{ courseId: string }> 
}) {
  const { courseId } = await params

  // 1. Fetch Course Details
  const course = await prisma.courses.findUnique({
    where: { id: courseId },
    include: { categories: true }
  })

  if (!course) return notFound()

  // Ensure JEE courses do not contain Biology
  if (course.title.toLowerCase().includes('jee')) {
    const bioSubjects = await prisma.subjects.findMany({
      where: {
        course_id: courseId,
        title: { contains: 'Biology' }
      },
      select: { id: true }
    })

    if (bioSubjects.length > 0) {
      const bioIds = bioSubjects.map(b => b.id)
      await prisma.questions.deleteMany({ where: { subject_id: { in: bioIds } } })
      await prisma.chapters.deleteMany({ where: { subject_id: { in: bioIds } } })
      await prisma.mock_tests.deleteMany({ where: { subject_id: { in: bioIds } } })
      await prisma.practice_tests.deleteMany({ where: { subject_id: { in: bioIds } } })
      await prisma.prep_modules.deleteMany({ where: { subject_id: { in: bioIds } } })
      await prisma.subjects.deleteMany({ where: { id: { in: bioIds } } })
    }
  }

  // 2. Fetch Subjects for this Course (Excluding any Biology for JEE)
  const subjects = await prisma.subjects.findMany({
    where: { 
      course_id: courseId,
      ...(course.title.toLowerCase().includes('jee') ? { NOT: { title: { contains: 'Biology' } } } : {})
    },
    orderBy: { title: 'asc' }
  })

  // 3. Fetch Mock Tests for this Course
  const mockTests = await prisma.mock_tests.findMany({
    where: { course_id: courseId, is_active: true },
    orderBy: { created_at: 'desc' }
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Stub (Keep consistent with layout) */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link 
            href={course.categories ? `/categories/${course.categories.id}` : "/categories"} 
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Streams
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        
        {/* --- Header Section --- */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold tracking-wider mb-6">
            <Hash className="w-3 h-3 text-yellow-400" />
            COURSE OVERVIEW
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-4 leading-[0.9]">
            {course.title}
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl">
            {course.description || "Select a subject to dive deep, or take a full-length mock test."}
          </p>
        </div>

        {/* --- Tabs & Content --- */}
        <CourseContentTabs 
          subjects={subjects} 
          mockTests={JSON.parse(JSON.stringify(mockTests))} 
          courseId={courseId} 
        />

      </main>
    </div>
  )
}