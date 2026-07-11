import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Lock } from 'lucide-react'
import { notFound, redirect } from 'next/navigation'
import SubjectContent from '@/components/Courses/SubjectContent'

export default async function SubjectDetailsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ courseId: string; subjectId: string }> 
  searchParams: Promise<{ from?: string }>
}) {
  // 1. Resolve Params & Authenticate User
  const { courseId, subjectId } = await params
  const { from } = await searchParams

  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) return redirect('/login')

  // 2. Fetch Subject & Course Info
  const subject = await prisma.subjects.findUnique({
    where: { id: subjectId },
    include: { courses: { select: { title: true } } }
  })

  if (!subject) return notFound()

  // 3. CHECK ENROLLMENT STATUS
  const enrollment = await prisma.student_enrollments.findFirst({
    where: { user_id: user.id, subject_id: subjectId }
  })

  // 4. CHECK USER ROLE
  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { role: true }
  })

  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'school_admin'

  // 5. DETERMINE ACCESS LEVEL (FREEMIUM LOGIC)
  const hasFullAccess = !!enrollment || isAdmin

  const courseTitle = subject.courses?.title

  // 6. Fetch Page Content (Fetching ALL content + Question Counts)
  
  // A. Prep Modules
  const modulesRes = await prisma.prep_modules.findMany({
    where: { subject_id: subjectId, is_published: true },
    orderBy: { created_at: 'asc' },
    include: { _count: { select: { questions: true } } }
  })
  
  // B. Practice Tests
  const practiceRes = await prisma.practice_tests.findMany({
    where: { subject_id: subjectId, is_published: true },
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { questions: true } } }
  })
  
  // C. Mock Tests
  const mockRes = await prisma.mock_tests.findMany({
    where: { subject_id: subjectId, is_active: true },
    orderBy: { created_at: 'desc' },
    include: { _count: { select: { mock_test_questions: true } } }
  })

  // Helper to extract count safely and strip non-serializable objects (like Decimals)
  const formatData = (data: any[]) => {
    return data.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description || null,
      difficulty: item.difficulty || null,
      duration_minutes: item.duration_minutes || null,
      question_count: item._count?.questions || item._count?.mock_test_questions || 0
    }))
  }

  const backLink = from === 'dashboard' 
    ? '/dashboard/my-courses' 
    : `/courses/${courseId}`
    
  const backLabel = from === 'dashboard'
    ? 'Back to Dashboard'
    : `Back to ${courseTitle || 'Course'}`

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar Stub */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 h-16 flex items-center gap-4">
          <Link 
            href={backLink} 
            className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-bold text-blue-600 uppercase tracking-widest">Subject View</span>
            
            {!hasFullAccess && (
              <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                <Lock className="w-3 h-3" />
                Free Preview Mode
              </div>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight">
            {subject.title}
          </h1>
        </div>

        <SubjectContent 
          modules={formatData(modulesRes)}
          practiceTests={formatData(practiceRes)}
          mockTests={formatData(mockRes)}
          courseId={courseId}
          subjectId={subjectId}
          hasFullAccess={hasFullAccess} 
        />
      </main>
    </div>
  )
}