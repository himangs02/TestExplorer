import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import {
  Trophy,
  Clock,
  Target,
  BarChart2,
  X,
  RotateCcw,
  ListTodo,
  Crown
} from 'lucide-react'

export default async function ResultPage({
  params,
  searchParams
}: {
  params: Promise<{ courseId: string; subjectId: string; testType: string; examId: string; attemptId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { examId, attemptId, courseId, subjectId, testType } = await params
  const { returnTo } = await searchParams

  const closeLink = returnTo ? decodeURIComponent(returnTo as string) : `/courses/${courseId}/subjects/${subjectId}`

  // 1. Fetch Attempt Data
  const attempt = await prisma.exam_attempts.findUnique({
    where: { id: attemptId }
  })

  if (!attempt) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
        <h2 className="text-xl font-bold text-gray-800">Result not found</h2>
        <Link href={closeLink} className="mt-4 inline-block text-blue-600 font-semibold hover:underline">
          Return to Subject
        </Link>
      </div>
    </div>
  )

  // 2. Fetch Exam Title & Questions to calculate stats
  let examTitle = 'Test Result'
  let questions: any = []

  if (testType === 'practice') {
    const examData = await prisma.practice_tests.findUnique({
      where: { id: examId },
      select: { title: true }
    })
    if (examData) examTitle = examData.title

    questions = await prisma.questions.findMany({
      where: { practice_test_id: examId },
      select: { id: true, question_options: { select: { id: true, is_correct: true } } }
    })
  } else if (testType === 'chapter-practice') {
    const chapter = await prisma.chapters.findUnique({
      where: { id: examId },
      select: { name: true }
    })
    if (chapter) {
      examTitle = chapter.name
      questions = await prisma.questions.findMany({
        where: { chapter_id: examId, status: 'active' },
        select: { id: true, question_options: { select: { id: true, is_correct: true } } }
      })
    } else {
      const subject = await prisma.subjects.findUnique({
        where: { id: examId },
        select: { title: true }
      })
      if (subject) examTitle = `${subject.title} Practice`
      questions = await prisma.questions.findMany({
        where: { subject_id: examId, status: 'active' },
        select: { id: true, question_options: { select: { id: true, is_correct: true } } }
      })
    }
  } else {
    // Mock
    let examData = await prisma.mock_tests.findUnique({
      where: { id: examId },
      select: { title: true, total_marks: true }
    })
    if (examData) examTitle = examData.title

    const mockQs = await prisma.mock_test_questions.findMany({
      where: { mock_test_id: examId },
      select: {
        questions: { select: { id: true, question_options: { select: { id: true, is_correct: true } } } }
      }
    })
    questions = mockQs.map(m => m.questions)

    // Fallback if questions are linked via exam_id
    if (!questions || questions.length === 0) {
      const altExam = await prisma.exams.findUnique({
        where: { id: examId },
        select: { title: true, total_marks: true }
      })
      if (altExam) examTitle = altExam.title

      questions = await prisma.questions.findMany({
        where: { exam_id: examId },
        select: { id: true, question_options: { select: { id: true, is_correct: true } } }
      })
    }
  }

  // 3. Calculate Detailed Stats
  const totalQuestions = questions.length || 30
  const parsedAnswers = typeof attempt.answers === 'string' ? JSON.parse(attempt.answers) : attempt.answers
  const userAnswers = (parsedAnswers as Record<string, string>) || {}

  let correctCount = 0
  let incorrectCount = 0
  let skippedCount = 0

  questions.forEach((q: any) => {
    const selectedOptionId = userAnswers[q.id]
    const correctOption = q.question_options?.find((o: any) => o.is_correct)

    if (!selectedOptionId) {
      skippedCount++
    } else if (correctOption && selectedOptionId === correctOption.id) {
      correctCount++
    } else {
      incorrectCount++
    }
  })

  // Calculate Percentages for Donut Chart
  const correctPercent = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
  const incorrectPercent = totalQuestions > 0 ? (incorrectCount / totalQuestions) * 100 : 0
  const skippedPercent = totalQuestions > 0 ? (skippedCount / totalQuestions) * 100 : 0

  // Conic Gradient String for Donut Chart
  const chartGradient = totalQuestions > 0
    ? `conic-gradient(
        #22C55E 0% ${correctPercent}%, 
        #EF4444 ${correctPercent}% ${correctPercent + incorrectPercent}%, 
        #F59E0B ${correctPercent + incorrectPercent}% 100%
      )`
    : '#E5E7EB'

  // Basic Stats (Shared rounding with ResultReportModal)
  const maxMarks = Number(attempt.total_marks || (totalQuestions * 4) || 120)
  const score = Number(attempt.score ?? ((correctCount * 4) - incorrectCount))
  const percentage = maxMarks > 0 ? Math.round((Math.max(0, score) / maxMarks) * 100) : 0
  const timeTaken = attempt.time_taken_seconds ?? 0
  const timeUsed = `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`

  // Approx Rank & Percentile (Align with actions.ts and ResultReportModal)
  let approxRank: string | null = null
  let approxPercentile: string | null = null
  try {
    const rankPred = await prisma.exam_rank_predictions.findFirst({
      where: {
        exam_id: examId,
        min_score: { lte: score },
        max_score: { gte: score }
      }
    })
    if (rankPred) {
      approxRank = rankPred.approx_rank
      approxPercentile = rankPred.approx_percentile
    } else {
      const ratio = maxMarks > 0 ? Math.max(0, Math.min(1, score / maxMarks)) : 0
      const p = Math.min(99.9, Math.max(10, Math.round((ratio * 80 + 19) * 10) / 10))
      approxPercentile = `${p}%`
      approxRank = `~${Math.max(100, Math.round((1 - p / 100) * 1200000)).toLocaleString('en-IN')}`
    }
  } catch (e) {
    console.error('Rank prediction lookup failed:', e)
  }

  // Realistic Benchmark Data from Database
  let topperScore = score
  let topperTime = timeUsed
  let topperAccuracy = `${Number(attempt.percentage || 0)}%`

  try {
    const realTopper = await prisma.exam_attempts.findFirst({
      where: {
        OR: [
          { mock_test_id: examId },
          { exam_id: examId },
          { practice_test_id: examId }
        ],
        status: 'completed'
      },
      orderBy: { score: 'desc' }
    })

    if (realTopper && realTopper.score !== null) {
      topperScore = Math.max(score, Number(realTopper.score))
      const topSecs = realTopper.time_taken_seconds ?? 0
      topperTime = `${Math.floor(topSecs / 60)}m ${topSecs % 60}s`
      topperAccuracy = `${realTopper.percentage ?? 0}%`
    }
  } catch (e) {
    console.error('Topper benchmark lookup failed:', e)
  }

  const retakeUrl = testType === 'chapter-practice'
    ? `/subject-practice/${courseId}/${courseId}/${subjectId}/practice?chapterId=${examId}&retake=true`
    : `/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}?retake=true`

  return (
    <div className="min-h-screen bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs fixed inset-0 z-50 overflow-y-auto">
      <div className="bg-[#FFFDF9] w-full max-w-4xl max-h-[92vh] rounded-[2.5rem] overflow-y-auto relative shadow-2xl border border-orange-100/60 my-auto animate-in fade-in zoom-in-95 duration-200">

        {/* Close Button */}
        <Link
          href={closeLink}
          className="absolute top-6 right-6 p-2.5 bg-[#FF6B35] rounded-full text-white hover:bg-[#E85D2E] transition-all shadow-md shadow-orange-500/30 z-20"
        >
          <X className="w-5 h-5" />
        </Link>

        <div className="p-6 md:p-10 space-y-8">

          {/* Header Title Badge */}
          <div className="text-center pt-2">
            <span className="inline-block bg-[#FF6B35] text-white px-8 py-3 rounded-2xl font-black text-base md:text-lg shadow-lg shadow-orange-500/20 tracking-tight">
              {examTitle} Report
            </span>
          </div>

          {/* Gamified AI Performance Insight Card (Consistent with Post-Submit Modal) */}
          {(approxRank || approxPercentile) && (
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-8 opacity-10 rotate-12">
                <Crown size={140} />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 text-indigo-200 font-bold uppercase tracking-wider text-xs">
                    AI Performance Insight
                  </div>
                  <h3 className="text-2xl font-black leading-tight">Great Effort! Here is your standing.</h3>
                  <p className="text-indigo-100 text-sm opacity-90 mt-1">Projected based on historical cut-offs for this score range.</p>
                </div>

                <div className="flex gap-4">
                  {approxRank && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[130px] border border-white/20 text-center shadow-lg">
                      <div className="text-[10px] text-indigo-200 font-bold uppercase mb-1 tracking-wider">Approx Rank</div>
                      <div className="text-2xl md:text-3xl font-black text-white">{approxRank}</div>
                    </div>
                  )}
                  {approxPercentile && (
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[130px] border border-white/20 text-center shadow-lg">
                      <div className="text-[10px] text-indigo-200 font-bold uppercase mb-1 tracking-wider">Percentile</div>
                      <div className="text-2xl md:text-3xl font-black text-white">{approxPercentile}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4 Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* MARKS */}
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Target className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">MARKS</span>
              </div>
              <div className="text-2xl font-black text-gray-900 tracking-tight">{score}/{maxMarks}</div>
            </div>

            {/* QUESTIONS */}
            <div className="p-5 rounded-2xl bg-orange-50/70 border border-orange-100 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-orange-600">
                <Trophy className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">ATTEMPTED</span>
              </div>
              <div className="text-2xl font-black text-gray-900 tracking-tight">{correctCount + incorrectCount}/{totalQuestions}</div>
            </div>

            {/* TIME */}
            <div className="p-5 rounded-2xl bg-purple-50/70 border border-purple-100 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-purple-600">
                <Clock className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">TIME</span>
              </div>
              <div className="text-2xl font-black text-gray-900 tracking-tight">{timeUsed}</div>
            </div>

            {/* PERCENTAGE */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-100 shadow-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-600">
                <BarChart2 className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-wider text-gray-500">PERCENTAGE</span>
              </div>
              <div className="text-2xl font-black text-gray-900 tracking-tight">{percentage}%</div>
            </div>
          </div>

          {/* Detailed Distribution Card */}
          <div className="bg-[#EAF4FF] rounded-[2.2rem] p-6 md:p-10 flex flex-col md:flex-row gap-8 lg:gap-12 items-center border border-blue-100/80 shadow-xs">

            {/* Left: Donut Chart */}
            <div className="flex flex-col items-center shrink-0">
              <h4 className="font-extrabold text-sm md:text-base text-gray-900 mb-5">Answer Distribution</h4>

              <div
                className="relative w-44 h-44 rounded-full flex items-center justify-center bg-white shadow-md transition-all"
                style={{ background: chartGradient }}
              >
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center flex-col z-10 shadow-xs">
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">TOTAL QUESTIONS</span>
                  <span className="text-2xl md:text-3xl font-black text-gray-900">{totalQuestions}</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 md:gap-4 mt-5 text-xs font-bold text-gray-600">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  <span>{correctCount} Correct</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                  <span>{incorrectCount} Wrong</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span>{skippedCount} Skipped</span>
                </div>
              </div>
            </div>

            {/* Right: Comparative Table (Realistic Platform Benchmarks) */}
            <div className="flex-1 w-full bg-white rounded-2xl overflow-hidden shadow-xs border border-orange-100">
              <table className="w-full text-left text-xs md:text-sm">
                <thead className="bg-[#FFE8CC] text-amber-950">
                  <tr>
                    <th className="p-3.5 font-bold">Metric</th>
                    <th className="p-3.5 font-bold">You</th>
                    <th className="p-3.5 font-bold">Top Benchmark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  <tr>
                    <td className="p-3.5 text-gray-600">Marks Scored</td>
                    <td className="p-3.5 font-bold text-gray-900">{score} / {maxMarks}</td>
                    <td className="p-3.5 text-gray-500">{topperScore} / {maxMarks}</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 text-gray-600">Time Taken</td>
                    <td className="p-3.5 font-bold text-gray-900">{timeUsed}</td>
                    <td className="p-3.5 text-gray-500">{topperTime}</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 text-gray-600">Accuracy</td>
                    <td className="p-3.5 font-bold text-gray-900">{Number(attempt.percentage || 0)}%</td>
                    <td className="p-3.5 text-gray-500">{topperAccuracy}</td>
                  </tr>
                  <tr className="bg-[#FFF4E5]">
                    <td className="p-3.5 font-bold text-amber-950">Percentile</td>
                    <td className="p-3.5 font-black text-amber-950">{approxPercentile || 'N/A'}</td>
                    <td className="p-3.5 font-bold text-amber-950">99.9%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href={retakeUrl}
              className="w-full sm:w-auto px-7 py-3 bg-[#2F80ED] hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Retake Test
            </Link>

            <Link
              href={`/courses/${courseId}/subjects/${subjectId}/test/${testType}/${examId}/review/${attemptId}?returnTo=${encodeURIComponent(closeLink)}`}
              className="w-full sm:w-auto px-7 py-3 bg-[#00C853] hover:bg-emerald-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <ListTodo className="w-4 h-4" /> Review Solutions
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
