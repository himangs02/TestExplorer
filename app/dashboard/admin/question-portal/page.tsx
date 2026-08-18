import Link from 'next/link'
import { BookOpen, Layers, FileText, HelpCircle, ArrowUpRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function QuestionPortalPage() {
  const [subjectsCount, chaptersCount, topicsCount, questionsCount] = await Promise.all([
    prisma.subjects.count(),
    prisma.chapters.count(),
    prisma.topics.count(),
    prisma.questions.count({
      where: { chapter_id: { not: null } }
    })
  ])

  const sections = [
    {
      title: 'Subjects',
      description: 'Manage root-level subjects and view assigned chapters.',
      icon: BookOpen,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      count: subjectsCount,
      link: '/dashboard/admin/subjects'
    },
    {
      title: 'Chapters',
      description: 'Manage chapters assigned to subjects.',
      icon: Layers,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      count: chaptersCount,
      link: '/dashboard/admin/question-portal/chapters'
    },
    {
      title: 'Topics',
      description: 'Manage topics assigned to chapters.',
      icon: FileText,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      count: topicsCount,
      link: '/dashboard/admin/question-portal/topics'
    },
    {
      title: 'Questions',
      description: 'Manage all questions in the portal.',
      icon: HelpCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      count: questionsCount,
      link: '/dashboard/admin/question-portal/questions'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Question Portal</h1>
        <p className="text-gray-500 font-medium">Manage Subjects, Chapters, Topics, and Questions.</p>
      </div>

      {/* Main Action Cards as requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/dashboard/admin/question-portal/chapters" className="group block">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:border-purple-500 hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">Add Chapters</h2>
                <p className="text-sm text-gray-500 font-medium">Create and manage chapters for subjects</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-purple-600 group-hover:border-purple-600 group-hover:text-white transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/admin/question-portal/topics" className="group block">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm hover:border-orange-500 hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-1">Add Topics</h2>
                <p className="text-sm text-gray-500 font-medium">Create and manage topics within chapters</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-orange-600 group-hover:border-orange-600 group-hover:text-white transition-colors">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </Link>
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">Content Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section, idx) => (
          <Link key={idx} href={section.link} className="group block">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-black transition-all relative overflow-hidden h-full flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${section.bg} ${section.color}`}>
                    <section.icon className="w-6 h-6" />
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-1">{section.title}</h3>
                <p className="text-xs text-gray-500 font-medium mb-4">{section.description}</p>
              </div>
              <div>
                <div className="text-3xl font-black text-gray-900">{section.count.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-1">Total {section.title}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
