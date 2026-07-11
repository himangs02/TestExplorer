import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import LeaderboardClient from '@/components/dashboard/leaderboard-client'

export default async function SchoolLeaderboardPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return redirect('/login')

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { organization_id: true }
  })

  const schoolId = profile?.organization_id

  if (!schoolId) {
    return <div className="p-8">Access Restricted: You are not linked to a school.</div>
  }

  // Fetch Courses
  const courses = await prisma.courses.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' }
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">School Leaderboard</h1>
        <p className="text-gray-500 mt-2">Top performers within your institute.</p>
      </div>

      <LeaderboardClient 
        courses={courses || []} 
        schoolId={schoolId} 
      />
    </div>
  )
}