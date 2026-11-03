// components/dashboard/student-overview.tsx
import Link from 'next/link'
import { TrendingUp, Clock, Target, Calendar, ArrowRight, PlayCircle, Trophy, Timer, Award } from 'lucide-react'

interface StudentOverviewProps {
  profile: any
  attempts: any[]
}

export default function StudentOverview({ profile, attempts = [] }: StudentOverviewProps) {
  const safeAttempts = Array.isArray(attempts) ? attempts : []
  
  // FILTER: Only calculate stats for COMPLETED tests
  const completedAttempts = safeAttempts.filter(a => a.status === 'completed' || a.score != null)
  const totalTests = completedAttempts.length

  // 1. AVG ACCURACY (True accuracy from tests)
  const avgAccuracy = totalTests > 0 
    ? Math.round(
        completedAttempts.reduce((acc, curr) => {
          return acc + (Number(curr.percentage) || 0)
        }, 0) / totalTests
      )
    : 0

  // 2. PROJECTED PERCENTILE (Based on latest completed test to match test result)
  const latestAttempt = completedAttempts.length > 0 ? completedAttempts[0] : null
  const latestRatio = latestAttempt && (latestAttempt.total_marks || 120) > 0
    ? Math.max(0, Math.min(1, (latestAttempt.score ?? 0) / (latestAttempt.total_marks || 120)))
    : 0
  const projectedPercentile = totalTests > 0
    ? `${Math.min(99.9, Math.max(10, Math.round((latestRatio * 80 + 19) * 10) / 10))}%`
    : 'N/A'

  // 3. TIME SPENT (Only from completed tests)
  const totalSeconds = completedAttempts.reduce((acc, curr) => {
    const seconds = Number(curr.time_taken_seconds) || 0
    if (seconds > 0) return acc + seconds
    const durationMins = Number(curr.duration_minutes) || 0
    return acc + (durationMins * 60)
  }, 0)
  
  const hoursSpent = (totalSeconds / 3600).toFixed(1)
  
  // Show all attempts in recent activity (even in-progress ones)
  const recentActivity = safeAttempts.slice(0, 3)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </h2>
          <p className="text-gray-500 mt-1">Here is your preparation summary.</p>
        </div>
        <Link href="/categories" className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
          Browse Courses
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{totalTests}</div>
            <div className="text-xs text-gray-500 font-medium">Completed Tests</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{avgAccuracy}%</div>
            <div className="text-xs text-gray-500 font-medium">Avg. Accuracy</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-indigo-50 text-indigo-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{projectedPercentile}</div>
            <div className="text-xs text-gray-500 font-medium">Estimated %ile</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-orange-50 text-orange-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{hoursSpent}h</div>
            <div className="text-xs text-gray-500 font-medium">Hours Spent</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
           <Link href="/dashboard/exams" className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
             View All <ArrowRight className="w-4 h-4" />
           </Link>
        </div>

        {recentActivity.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">You haven't taken any tests yet.</p>
            <Link href="/categories" className="text-black font-bold hover:underline">Start a Test</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivity.map((attempt) => {
              // Priority: Exam -> Practice -> Mock -> Unknown
              const title = attempt.exams?.title || attempt.practice_tests?.title || attempt.mock_tests?.title || 'Unknown Test'
              const isMock = !!attempt.mock_test_id
              const isCompleted = attempt.status === 'completed' || attempt.score != null
              const date = new Date(attempt.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              const score = attempt.score ?? 0
              const total = attempt.total_marks ?? 0

              return (
                <div key={attempt.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isMock ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                         {isMock ? <Trophy className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mt-0.5">
                           <span className="uppercase tracking-wider">{isMock ? 'Mock Test' : 'Practice'}</span>
                           <span>•</span>
                           <span>{date}</span>
                        </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-6">
                      <div className="text-right">
                        {isCompleted ? (
                          <>
                            <div className="text-sm font-bold text-gray-900">{score}/{total}</div>
                            <div className="text-xs font-bold text-gray-400">Score</div>
                          </>
                        ) : (
                          <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                            <Timer className="w-3 h-3" />
                            <span className="text-xs font-bold">In Progress</span>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
