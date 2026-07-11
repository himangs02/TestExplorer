import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

// Components
import SchoolAdminOverview from '@/components/dashboard/school-overview'
import StudentOverview from '@/components/dashboard/student-overview'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user
  
  if (!user) return redirect('/login')

  // 1. Fetch Profile & Role
  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      full_name: true,
      role: true,
      organization_id: true,
    }
  })

  // 2. Redirect Super Admin
  if (profile?.role === 'super_admin') {
    return redirect('/dashboard/admin')
  }

  // 3. SCHOOL ADMIN VIEW
  if (profile?.role === 'school_admin') {
    return <SchoolAdminOverview profile={profile} />
  }

  // 4. STUDENT VIEW
  const attempts = await prisma.exam_attempts.findMany({
    where: { user_id: user.id },
    include: {
      exams: { select: { title: true } },
      practice_tests: { select: { title: true } },
      mock_tests: { select: { title: true } }
    },
    orderBy: { completed_at: 'desc' }
  })

  return <StudentOverview profile={profile} attempts={attempts || []} />
}
