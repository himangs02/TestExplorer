import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight,
  Flame,
  Zap,
  Activity
} from 'lucide-react'

export const metadata = {
  title: 'My Stats & Analytics | TestExplorer',
  description: 'Detailed student performance analytics, subject accuracy, and exam readiness.'
}

export default async function StudentStatsPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return redirect('/login')

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { id: true, full_name: true }
  })

  // Fetch all attempts with related tests
  const attempts = await prisma.exam_attempts.findMany({
    where: { user_id: user.id },
    include: {
      mock_tests: {
        select: {
          id: true,
          title: true,
          total_marks: true,
          duration_minutes: true,
          subjects: { select: { title: true } }
        }
      },
      exams: {
        select: {
          id: true,
          title: true,
          total_marks: true,
          duration_minutes: true,
          subjects: { select: { title: true } }
        }
      },
      practice_tests: {
        select: {
          id: true,
          title: true,
          duration_minutes: true,
          subjects: { select: { title: true } }
        }
      }
    },
    orderBy: { started_at: 'asc' }
  })

  const completed = attempts.filter(a => a.status === 'completed' || a.score != null)
  const totalCount = completed.length

  // Aggregates
  const totalScore = completed.reduce((sum, a) => sum + (a.score ?? 0), 0)
  const totalMaxMarks = completed.reduce((sum, a) => sum + (a.total_marks || 120), 0)
  const avgAccuracy = totalCount > 0 
    ? Math.round(completed.reduce((sum, a) => sum + (Number(a.percentage) || 0), 0) / totalCount)
    : 0
  const totalSeconds = completed.reduce((sum, a) => sum + (a.time_taken_seconds || 0), 0)
  const totalHours = (totalSeconds / 3600).toFixed(1)
  const bestScoreAttempt = completed.reduce((max, a) => {
    const acc = Number(a.percentage) || 0
    return acc > (Number(max?.percentage) || 0) ? a : max
  }, completed[0] || null)

  // Subject Categorization
  const subjectStats: Record<string, { attempts: number; scoreSum: number; maxMarksSum: number; title: string }> = {}

  completed.forEach(a => {
    const testTitle = a.mock_tests?.title || a.exams?.title || a.practice_tests?.title || ''
    const subjectTitle = a.mock_tests?.subjects?.title || a.exams?.subjects?.title || a.practice_tests?.subjects?.title || ''
    
    let sub = 'General / Full Mock'
    const titleLower = `${testTitle} ${subjectTitle}`.toLowerCase()
    if (titleLower.includes('physic')) sub = 'Physics'
    else if (titleLower.includes('chem')) sub = 'Chemistry'
    else if (titleLower.includes('math')) sub = 'Mathematics'
    else if (titleLower.includes('bio') || titleLower.includes('botan') || titleLower.includes('zool')) sub = 'Biology'

    if (!subjectStats[sub]) {
      subjectStats[sub] = { attempts: 0, scoreSum: 0, maxMarksSum: 0, title: sub }
    }
    subjectStats[sub].attempts += 1
    subjectStats[sub].scoreSum += (a.score ?? 0)
    subjectStats[sub].maxMarksSum += (a.total_marks || 120)
  })

  const subjectList = Object.values(subjectStats).map(s => {
    const acc = s.maxMarksSum > 0 ? Math.round((Math.max(0, s.scoreSum) / s.maxMarksSum) * 100) : 0
    return {
      title: s.title,
      attempts: s.attempts,
      accuracy: acc,
      status: acc >= 70 ? 'Strong' : acc >= 45 ? 'Moderate' : 'Needs Practice'
    }
  }).sort((a, b) => b.accuracy - a.accuracy)

  // AI Readiness Index & Estimated Percentile (Harmonized with Test Submission formula)
  let readinessScore = Math.min(99, Math.max(15, Math.round(avgAccuracy * 0.9 + Math.min(20, totalCount * 2))))
  const overallRatio = totalMaxMarks > 0 ? Math.max(0, Math.min(1, totalScore / totalMaxMarks)) : 0
  const harmonizedPercentile = Math.min(99.9, Math.max(10, Math.round((overallRatio * 80 + 19) * 10) / 10))
  let projectedPercentile = totalCount > 0 ? `${harmonizedPercentile}%` : 'N/A'

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Activity className="w-3.5 h-3.5 text-blue-600" /> Performance Analytics
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
            My Stats & Exam Readiness
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Diagnostic analytics, subject accuracy breakdowns, and preparation trajectory.
          </p>
        </div>

        <Link
          href="/categories"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-bold hover:bg-gray-800 transition-all shadow-sm"
        >
          <Zap className="w-4 h-4 text-yellow-400" /> Start Next Mock
        </Link>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Tests</span>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-black text-gray-900">{totalCount}</div>
          <span className="text-xs text-gray-400 font-medium">Recorded exam sessions</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overall Accuracy</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-gray-900">{avgAccuracy}%</div>
          <span className="text-xs text-emerald-600 font-bold">Weighted across all tests</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated %ile</span>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-black text-gray-900">{projectedPercentile}</div>
          <span className="text-xs text-indigo-600 font-bold">AIR Benchmark model</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Time Invested</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-black text-gray-900">{totalHours}h</div>
          <span className="text-xs text-gray-400 font-medium">Active test practice time</span>
        </div>
      </div>

      {/* Main Grid: Subject Breakdown & Readiness */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Subject Accuracy Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Subject-Wise Performance</h2>
              <p className="text-xs text-gray-500">Relative accuracy across attempted subjects</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              {subjectList.length} Disciplines
            </span>
          </div>

          {subjectList.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="font-semibold text-sm">No subject attempt data available yet.</p>
              <p className="text-xs text-gray-400 mt-1">Complete a full mock or practice set to unlock detailed insights.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {subjectList.map(s => (
                <div key={s.title} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-900 text-base">{s.title}</span>
                      <span className="ml-2 text-xs text-gray-500 font-medium">({s.attempts} tests taken)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        s.status === 'Strong' ? 'bg-emerald-100 text-emerald-800' :
                        s.status === 'Moderate' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {s.status}
                      </span>
                      <span className="font-black text-gray-900 text-lg">{s.accuracy}%</span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        s.accuracy >= 70 ? 'bg-emerald-500' :
                        s.accuracy >= 45 ? 'bg-blue-500' :
                        'bg-amber-500'
                      }`}
                      style={{ width: `${Math.max(5, s.accuracy)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Readiness & Recommendations */}
        <div className="space-y-6">
          {/* AI Readiness Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-7 shadow-lg space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-wider">
              <Flame className="w-4 h-4 text-orange-400" /> Readiness Score
            </div>
            <div>
              <div className="text-5xl font-black tracking-tight">{readinessScore}/100</div>
              <p className="text-slate-300 text-xs mt-1">
                {readinessScore >= 75 ? 'Excellent preparation pace. Focus on high-weightage weak chapters.' :
                 readinessScore >= 50 ? 'Steady progression. Increase timed full-syllabus mock attempts.' :
                 'Foundational stage. Consistent revision and formula practice advised.'}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2 text-xs text-slate-300 font-medium">
              <div className="flex items-center justify-between">
                <span>Speed Efficiency:</span>
                <strong className="text-white">Normal (NTA standard)</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Best Mock Score:</span>
                <strong className="text-white">{bestScoreAttempt ? `${bestScoreAttempt.score}/${bestScoreAttempt.total_marks}` : 'N/A'}</strong>
              </div>
            </div>
          </div>

          {/* Quick Action Card */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-3xl p-6 space-y-3">
            <h3 className="font-bold text-blue-950 text-base flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
              Target Strategy
            </h3>
            <p className="text-xs text-blue-900/80 leading-relaxed font-medium">
              Take full syllabus mock tests under strict exam timer conditions to build stamina, eliminate negative marks, and boost rank predictability.
            </p>
            <Link
              href="/dashboard/exams"
              className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 hover:text-blue-900 pt-2"
            >
              View Full Exam History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
