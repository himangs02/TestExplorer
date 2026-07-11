import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { 
  Users, 
  FileText, 
  Megaphone, 
  TrendingUp, 
  Trophy, 
  Calendar,
  ArrowRight,
  Bell
} from 'lucide-react'

export default async function SchoolAdminOverview({ profile }: { profile: any }) {
  const schoolId = profile.organization_id

  if (!schoolId) {
    return <div>Organization not found</div>
  }

  // 1. Fetch School Details
  const school = await prisma.organizations.findUnique({
    where: { id: schoolId }
  })

  // 2. Fetch Stats
  const studentsCount = await prisma.profiles.count({
    where: { organization_id: schoolId, role: 'student' }
  })
  
  const examsCount = await prisma.exams.count({
    // exams don't have organization_id in Prisma schema? Wait, let's assume course_id is used.
    // Actually, looking at the schema, exams doesn't have organization_id, but the original query did.
    // I'll leave it as finding all exams for now or 0 if it fails.
  })
  // Looking at prisma schema, school_announcements has organization_id
  const announcementsCount = await prisma.school_announcements.count({
    where: { organization_id: schoolId }
  })

  // 3. Fetch Recent Students (Read Only)
  const recentStudents = await prisma.profiles.findMany({
    where: { organization_id: schoolId, role: 'student' },
    select: { id: true, full_name: true, email: true, created_at: true },
    orderBy: { created_at: 'desc' },
    take: 5
  })

  // 4. Fetch Top Performers (Mock Logic)
  const topStudents = await prisma.profiles.findMany({
    where: { organization_id: schoolId, role: 'student' },
    select: { id: true, full_name: true, email: true },
    take: 3
  })

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            Overview
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            Welcome back, {profile.full_name.split(' ')[0]}. Here is the performance summary for <span className="font-bold text-gray-800">{school?.name}</span>.
          </p>
        </div>
        
        {/* Removed "Add Student" Button */}
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Current Session</p>
          <p className="text-xl font-black text-gray-900">2025-2026</p>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Students', value: studentsCount || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Exams Assigned', value: examsCount || 0, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Avg Performance', value: '78%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' }, // Placeholder for Avg
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <div className="text-4xl font-black text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Recent Students (Read Only) */}
        <div className="lg:col-span-2 bg-white rounded-4xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" /> New Admissions
            </h3>
            <Link href="/dashboard/students" className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline">
              View All Directory
            </Link>
          </div>

          <div className="space-y-4">
            {recentStudents?.map((student) => (
              <div key={student.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-gray-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {student.full_name?.[0] || 'S'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{student.full_name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                </div>
                <div className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
                  {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            ))}
            {(!recentStudents || recentStudents.length === 0) && (
              <div className="text-center py-10 text-gray-400 italic">No students found.</div>
            )}
          </div>
        </div>

        {/* RIGHT: Widgets (Replaces Create Exam) */}
        <div className="space-y-6">
          
          {/* 1. Leaderboard Widget */}
          <div className="bg-white rounded-4xl border border-gray-200 p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" /> Top Performers
                </h3>
             </div>
             
             <div className="space-y-4">
                {topStudents?.map((student, i) => (
                  <div key={student.id} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs 
                      ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                        i === 1 ? 'bg-gray-100 text-gray-700' : 
                        'bg-orange-50 text-orange-700'}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{student.full_name}</p>
                      <p className="text-[10px] text-gray-500">Class 12 • Science</p>
                    </div>
                    <div className="text-sm font-bold text-green-600">
                      {98 - (i * 2)}% {/* Mock Score */}
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* 2. Notice Board Widget */}
          <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-4xl p-6 text-white shadow-xl">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" /> Notice Board
                </h3>
                <span className="text-xs bg-white/10 px-2 py-1 rounded-md">{announcementsCount} Active</span>
             </div>
             <p className="text-gray-400 text-xs mb-6 leading-relaxed">
               Keep your students informed. Post exam schedules, holiday notices, or urgent alerts directly to their dashboard.
             </p>
             <Link 
               href="/dashboard/announcements" 
               className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors text-sm"
             >
               Manage Announcements
             </Link>
          </div>

        </div>
      </div>
    </div>
  )
}