import { prisma } from '@/lib/prisma'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ExportStudentsBtn from '@/components/admin/export-students-btn' // Import Export Btn
import StudentSearch from '@/components/admin/student-search' // Import Search Component
import StudentSort from '@/components/admin/student-sort'
import StudentInteractiveList from '@/components/admin/StudentInteractiveList'

export const dynamic = 'force-dynamic'

export default async function SchoolStudentsPage({
  params,
  searchParams,
}: {
  params: Promise<{ schoolId: string }>;
  searchParams: Promise<{ search?: string; sort?: string }>;
}) {
  const { schoolId } = await params
  const { search, sort } = await searchParams
  
  const query = search || ''

  // 1. Determine Filter Logic
  let whereClause: any = { role: 'student' }

  if (schoolId === 'public') {
    whereClause.OR = [
      { organization_id: null },
      { organization_id: '' }
    ]
  } else {
    whereClause.organization_id = schoolId
  }

  // 2. Apply Search (Server Side Filtering)
  if (query) {
    whereClause.full_name = { contains: query }
  }

  // 3. Fetch Data
  const allSubjects = await prisma.subjects.findMany({
    orderBy: { title: 'asc' },
    include: {
      courses: {
        include: {
          categories: true
        }
      }
    }
  })

  let rawStudents = await prisma.profiles.findMany({
    where: whereClause,
    include: { organizations: { select: { name: true } } }
  })
  let students = rawStudents || []

  if (sort === 'name_asc') {
    students.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
  } else if (sort === 'name_desc') {
    students.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || ''))
  } else {
    // Default: Newest
    students.sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
  }

  // Get School Name for Header
  // @ts-ignore
  const currentSchoolName = schoolId === 'public' 
    ? 'Individual Students' 
    // @ts-ignore
    : students[0]?.organizations?.name || 'School Students'

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/users" className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{currentSchoolName}</h1>
            <p className="text-gray-500 font-medium text-sm sm:text-base">Total Students: {students.length}</p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Export */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3">
        {/* Search Component */}
        <StudentSearch placeholder="Search students by name..." />

        <div className="flex items-center gap-2 shrink-0">
           {/* Sort Button */}
           <StudentSort />
           
           {/* Export Button */}
           <ExportStudentsBtn data={students} />
        </div>
      </div>

      {/* Responsive Table & Collapsible Dropdown Card View */}
      <StudentInteractiveList
        students={students}
        allSubjects={allSubjects || []}
        showEnrollment={true}
      />
    </div>
  )
}