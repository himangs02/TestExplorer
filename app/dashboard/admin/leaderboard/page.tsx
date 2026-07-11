import { prisma } from '@/lib/prisma'
import LeaderboardClient from '@/components/dashboard/leaderboard-client'

export default async function AdminLeaderboardPage() {
  // Fetch Courses for the first dropdown
  const courses = await prisma.courses.findMany({
    select: { id: true, title: true },
    orderBy: { title: 'asc' }
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Global Leaderboard</h1>
        <p className="text-gray-500 mt-2">View top performers by Course and Subject.</p>
      </div>

      <LeaderboardClient courses={courses || []} />
    </div>
  )
}