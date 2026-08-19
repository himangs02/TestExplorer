import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import SubjectsList from '@/components/admin/subjects-list'

export default async function SubjectsAdminPage() {
  // Fetch subjects with their course info
  const subjects = await prisma.subjects.findMany({
    include: { courses: { select: { id: true, title: true } } },
    orderBy: { created_at: 'desc' }
  })

  // Fetch courses for the division tabs
  const courses = await prisma.courses.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' }
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Subjects</h1>
          <p className="text-gray-500">Manage subjects across all courses.</p>
        </div>
        <Link 
          href="/dashboard/admin/subjects/new" 
          className="bg-black text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Subject
        </Link>
      </div>

      <SubjectsList subjects={subjects} courses={courses} />
    </div>
  )
}