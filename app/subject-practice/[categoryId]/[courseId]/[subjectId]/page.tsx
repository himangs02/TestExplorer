import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, HelpCircle, ChevronRight, Sparkles, CheckCircle2, Award } from 'lucide-react'
import ChapterTopicList from '@/components/subject-practice/ChapterTopicList'

export default async function SubjectPracticeChaptersPage({
  params
}: {
  params: Promise<{ categoryId: string; courseId: string; subjectId: string }>
}) {
  const { categoryId, courseId, subjectId } = await params

  // 1. Fetch Subject, Course, and Chapters
  const subject = await prisma.subjects.findUnique({
    where: { id: subjectId },
    include: {
      courses: {
        include: {
          categories: true
        }
      },
      chapters: {
        where: { 
          status: 'active'
        },
        orderBy: { order: 'asc' },
        include: {
          _count: {
            select: { questions: true }
          }
        }
      }
    }
  })

  if (!subject) return notFound()

  const course = subject.courses
  const category = course?.categories

  // Calculate totals
  const totalChapters = subject.chapters.length
  const totalQuestions = subject.chapters.reduce(
    (sum, ch) => sum + (ch._count?.questions || 0),
    0
  )

  // Find first available chapter with questions for quick start
  const firstPracticableChapter = subject.chapters.find((ch) => (ch._count?.questions || 0) > 0)

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Header & Breadcrumbs */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto no-scrollbar py-2">
            <Link
              href={`/subject-practice/${categoryId}`}
              className="hover:text-gray-900 transition-colors shrink-0 font-medium"
            >
              {category?.title || 'Courses'}
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
            <Link
              href={`/subject-practice/${categoryId}/${courseId}`}
              className="hover:text-gray-900 transition-colors shrink-0 font-medium"
            >
              {course?.title || 'Subjects'}
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0 text-gray-400" />
            <span className="text-gray-900 font-semibold shrink-0">{subject.title}</span>
          </div>

          <Link
            href={`/subject-practice/${categoryId}/${courseId}`}
            className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Subjects</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8 max-w-5xl space-y-8">
        {/* Modern Subject Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white shadow-xl p-6 sm:p-8 md:p-10 border border-slate-800">
          {/* Subtle Ambient Decorative Circles */}
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                <span>{course?.title || 'Course'} • Chapter Wise Practice</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
                  {subject.title}
                </h1>
                <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed font-normal">
                  {subject.description ||
                    `Master ${subject.title} chapter-by-chapter with targeted practice questions. Test your understanding and review step-by-step solutions instantly.`}
                </p>
              </div>

              {/* Quick Actions */}
              {firstPracticableChapter && (
                <div className="pt-2 flex items-center gap-3">
                  <Link
                    href={`/subject-practice/${categoryId}/${courseId}/${subjectId}/practice?chapterId=${firstPracticableChapter.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    Start Practicing ({firstPracticableChapter.name})
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center lg:text-left flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto lg:mx-0">
                  <BookOpen className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <span className="block text-2xl font-black text-white">{totalChapters}</span>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-300">
                    Chapters
                  </span>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center lg:text-left flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mx-auto lg:mx-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <span className="block text-2xl font-black text-white">{totalQuestions}</span>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-slate-300">
                    Total Questions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters List Section */}
        <div className="space-y-4">
          <ChapterTopicList
            chapters={subject.chapters}
            categoryId={categoryId}
            courseId={courseId}
            subjectId={subjectId}
          />
        </div>
      </main>
    </div>
  )
}

