import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import SubjectCreateForm from '@/components/admin/subject-create-form'

export default async function NewSubjectPage() {
  // Fetch Courses for the dropdown
  const courses = await prisma.courses.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' }
  })

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard/admin/subjects" className="inline-flex items-center gap-2 text-gray-500 font-bold mb-6 hover:text-black transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Subjects
      </Link>
      
      <SubjectCreateForm courses={courses} />
    </div>
  )
}