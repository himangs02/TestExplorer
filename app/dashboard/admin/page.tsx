import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { 
  Building2, 
  Users, 
  Layers,
  BookOpen, 
  Plus, 
  ArrowUpRight,
  TrendingUp,
  Activity,
  Mail,
  FileText
} from 'lucide-react'

export default async function SuperAdminDashboard() {
  // Fetch Stats (Parallel)
  const [
    schoolsCount, 
    studentsCount, 
    streamsCount, 
    mockTestsCount, 
    blogsCount,
    unreadMessagesCount,
    recentMessages,
    recentAttempts,
    subjectsCount,
    chaptersCount,
    topicsCount,
    questionsCount
  ] = await Promise.all([
    prisma.organizations.count(),
    prisma.profiles.count({ where: { role: 'student' } }),
    prisma.categories.count(),
    prisma.mock_tests.count(),
    prisma.blogs.count(),
    prisma.contact_messages.count({ where: { status: 'unread' } }),
    prisma.contact_messages.findMany({
      orderBy: { created_at: 'desc' },
      take: 2
    }),
    prisma.exam_attempts.findMany({
      orderBy: { started_at: 'desc' },
      take: 3,
      include: {
        users: true,
        exams: true,
        mock_tests: true,
        practice_tests: true
      }
    }),
    prisma.subjects.count(),
    prisma.chapters.count(),
    prisma.topics.count(),
    prisma.questions.count()
  ])

  const stats = [
    { label: 'SUBJECTS', value: subjectsCount || 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50', link: '/dashboard/admin/manage-content' },
    { label: 'CHAPTERS', value: chaptersCount || 0, icon: Layers, color: 'text-purple-600', bg: 'bg-purple-50', link: '/dashboard/admin/question-portal/chapters' },
    { label: 'TOPICS', value: topicsCount || 0, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50', link: '/dashboard/admin/question-portal/topics' },
    { label: 'QUESTIONS', value: questionsCount || 0, icon: FileText, color: 'text-green-600', bg: 'bg-green-50', link: '/dashboard/admin/question-uploads' },
    { label: 'TOTAL SCHOOLS', value: schoolsCount || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50', link: '/dashboard/admin/schools' },
    { label: 'TOTAL STUDENTS', value: studentsCount || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', link: '/dashboard/admin/users' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Platform Dashboard</h1>
          <p className="text-gray-500 font-medium">Monitor your content, users, and incoming requests.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/dashboard/admin/schools/new" 
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> School
          </Link>
          <Link 
            href="/dashboard/admin/streams/new" 
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Stream
          </Link>
          <Link 
            href="/dashboard/admin/blogs/create" 
            className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg text-sm"
          >
            <Plus className="w-4 h-4" /> Write Blog
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <Link key={i} href={stat.link} className="group block">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-black transition-all relative overflow-hidden h-full flex flex-col justify-between">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-4.5 h-4.5" />
                </div>
                <div className="w-7 h-7 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-colors">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <div className="text-2xl xl:text-3xl font-black text-gray-900 mb-0.5 tracking-tight">{stat.value}</div>
                <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase truncate">{stat.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Graphs & Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Simple Growth Graph (CSS Only) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Exam Activity</h3>
              <p className="text-sm text-gray-500">Total mock tests submitted over time</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-100 px-3.5 py-1.5 rounded-xl font-bold transition-colors">
              Last 6 Months
            </button>
          </div>
          
          {/* CSS Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
            {[40, 65, 45, 80, 55, 90].map((h, i) => (
              <div key={i} className="w-full bg-blue-50 rounded-t-xl relative group transition-all hover:bg-blue-100">
                <div 
                  style={{ height: `${h}%` }} 
                  className="absolute bottom-0 w-full bg-blue-600 rounded-t-xl transition-all duration-500 group-hover:bg-blue-700"
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity">
                    {h * 10}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest px-2">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>

        {/* Inbox & Live Activity */}
        <div className="space-y-6">
          {/* Inbox */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-bold text-gray-900">Inbox</h3>
              </div>
              {unreadMessagesCount > 0 && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {unreadMessagesCount} New
                </span>
              )}
            </div>
            
            <div className="space-y-3">
              {recentMessages.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-2 text-center">No messages found.</p>
              ) : (
                recentMessages.map((msg) => (
                  <Link href={`/dashboard/admin/messages`} key={msg.id} className="block p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-bold text-gray-900">{msg.name}</span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {msg.created_at ? new Date(msg.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {msg.message}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Live Activity */}
          <div className="bg-[#0f172a] text-white p-6 rounded-3xl border border-transparent shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-bold text-white">Live Activity</h3>
            </div>
            <div className="space-y-3">
              {recentAttempts.length === 0 ? (
                <p className="text-sm text-gray-400 font-medium py-4 text-center">No recent tests taken.</p>
              ) : (
                recentAttempts.map((attempt) => {
                  const testTitle = attempt.mock_tests?.title || attempt.exams?.title || attempt.practice_tests?.title || 'Test';
                  return (
                    <div key={attempt.id} className="p-3.5 bg-slate-800 rounded-2xl border border-transparent">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-200">{attempt.users?.name || attempt.users?.email || 'Student'}</span>
                        <span className="text-[9px] font-bold text-slate-400">
                          {attempt.completed_at ? new Date(attempt.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In Progress'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-semibold truncate">
                        Completed: {testTitle}
                      </p>
                      {attempt.status === 'completed' && (
                        <div className="text-[10px] text-green-400 font-bold mt-1">
                          Score: {attempt.score}/{attempt.total_marks} ({attempt.percentage?.toString() || '0'}%)
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}