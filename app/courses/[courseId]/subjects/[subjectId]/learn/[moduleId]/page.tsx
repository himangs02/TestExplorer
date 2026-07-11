import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, BookOpen, ChevronRight, List, Lock } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import QuizInterface from '@/components/Courses/QuizInterface' 
import AccessDenied from '@/components/ui/access-denied'

export default async function PrepModulePage({ 
  params 
}: { 
  params: Promise<{ courseId: string; subjectId: string; moduleId: string }> 
}) {
  const { courseId, subjectId, moduleId } = await params

  // 1. Authenticate User
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) return redirect('/login')
  
  // 2. Fetch Current Module Details (Needed for Title & 404 check)
  const moduleData = await prisma.prep_modules.findUnique({
    where: { id: moduleId },
    select: { title: true, description: true }
  })

  if (!moduleData) return notFound()

  // 3. CHECK ACCESS (Freemium Logic)
  const enrollment = await prisma.student_enrollments.findFirst({
    where: { user_id: user.id, subject_id: subjectId },
    select: { id: true }
  })

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { role: true }
  })

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'school_admin'
  const hasFullAccess = !!enrollment || isAdmin

  // 🔒 GATEKEEPING: If no full access, check if this module is in the "Free" tier (Top 2)
  if (!hasFullAccess) {
    const allowedModules = await prisma.prep_modules.findMany({
      where: { subject_id: subjectId, is_published: true },
      orderBy: { created_at: 'asc' }, // Must match Subject Page sort
      select: { id: true },
      take: 2
    })

    const isAllowed = allowedModules?.some(m => m.id === moduleId)

    if (!isAllowed) {
       return <AccessDenied subjectTitle={moduleData.title} /> 
    }
  }

  // 4. Fetch Questions
  const questions = await prisma.questions.findMany({
    where: { module_id: moduleId },
    orderBy: { order_index: 'asc' },
    select: {
      id: true,
      text: true,
      explanation: true,
      question_options: {
        select: { id: true, text: true, is_correct: true }
      }
    }
  })

  // Normalize `question_options` to `options` for QuizInterface
  const formattedQuestions = questions.map(q => ({
    id: q.id,
    text: q.text,
    explanation: q.explanation,
    options: q.question_options.map(opt => ({
      id: opt.id,
      text: opt.text,
      is_correct: opt.is_correct ?? false,
    })),
  }))

  // 5. Fetch All Modules for Sidebar
  const allModules = await prisma.prep_modules.findMany({
    where: { subject_id: subjectId, is_published: true },
    orderBy: { created_at: 'asc' },
    select: { id: true, title: true }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <Link 
                href={`/courses/${courseId}/subjects/${subjectId}`} 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black"
                title="Back to Subject"
             >
                <ArrowLeft className="w-5 h-5" />
             </Link>
             <div className="flex items-center gap-2">
                 <div className="bg-orange-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                 </div>
                 <h1 className="text-lg font-bold text-gray-900 truncate max-w-[200px] md:max-w-md">
                   {moduleData.title}
                 </h1>
             </div>
          </div>
          
          {/* Freemium Badge */}
          {!hasFullAccess && (
            <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full border border-gray-200">
               <Lock className="w-3 h-3" /> Preview Mode
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-8 flex items-start gap-8">
        
        {/* --- LEFT SIDEBAR (Module List) --- */}
        <aside className="hidden lg:block w-80 sticky top-24 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
               <List className="w-4 h-4 text-gray-500" />
               <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Module List</h3>
            </div>

            <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-2 space-y-1">
              {allModules?.map((mod, index) => {
                const isActive = mod.id === moduleId
                // Determine lock status for sidebar items
                const isLocked = !hasFullAccess && index >= 2

                if (isLocked) {
                   return (
                    <div 
                      key={mod.id} 
                      className="group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-gray-400 cursor-not-allowed opacity-70"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-gray-100">
                          <Lock className="w-3 h-3" />
                        </span>
                        <span className="line-clamp-1">{mod.title}</span>
                      </div>
                    </div>
                   )
                }

                return (
                  <Link 
                    key={mod.id} 
                    href={`/courses/${courseId}/subjects/${subjectId}/learn/${mod.id}`}
                    className={`group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                         isActive ? 'bg-blue-200 text-blue-700' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="line-clamp-1">{mod.title}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-blue-500" />}
                  </Link>
                )
              })}
            </div>

          </div>
        </aside>

        {/* --- MAIN CONTENT (Quiz) --- */}
        <main className="flex-1 min-w-0">
          {(!formattedQuestions || formattedQuestions.length === 0) ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                 <span className="text-4xl">🚧</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Questions Yet</h2>
              <p className="text-gray-500">This module is currently being updated. Please check the sidebar for other modules.</p>
            </div>
          ) : (
            <QuizInterface questions={formattedQuestions} />
          )}
        </main>

      </div>
    </div>
  )
}