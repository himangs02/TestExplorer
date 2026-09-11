import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SchoolStudentsFilter from './school-students-filter'
import StudentInteractiveList from '@/components/admin/StudentInteractiveList'

export default async function SchoolStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: string }>
}) {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) return redirect('/login')

  // 1. Get Current User's Role & Org ID
  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { role: true, organization_id: true }
  })

  // ROUTING LOGIC:
  // If Super Admin, send them to the Super Admin View
  if (profile?.role === 'super_admin') {
    redirect('/dashboard/admin/users')
  }
  
  // If not school admin, kick them out
  if (profile?.role !== 'school_admin' || !profile.organization_id) {
    redirect('/dashboard')
  }

  // 2. Prepare Query for School Students
  const params = await searchParams
  const query = params.search || ''
  const sort = params.sort || 'newest'

  let whereClause: any = {
    organization_id: profile.organization_id, // SCOPE TO THEIR SCHOOL
    role: 'student'
  }

  if (query) {
    whereClause.full_name = { contains: query }
  }

  let studentsData = await prisma.profiles.findMany({
    where: whereClause
  })
  let students = studentsData || []

  // 3. Handle Sorting
  switch (sort) {
    case 'name_asc':
      students.sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
      break
    case 'name_desc':
      students.sort((a, b) => (b.full_name || '').localeCompare(a.full_name || ''))
      break
    case 'oldest':
      students.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
      break
    case 'newest':
    default:
      students.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      break
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Students</h1>
          <p className="text-gray-500 text-sm sm:text-base">Manage students registered under your school.</p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold border border-blue-100 w-fit">
          Total: {students.length}
        </div>
      </div>

      <SchoolStudentsFilter />

      <StudentInteractiveList
        students={students}
        showEnrollment={false}
      />
    </div>
  )
}