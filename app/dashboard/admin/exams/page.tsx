import { prisma } from '@/lib/prisma'
import ExamsClient from './exams-client'

export default async function ExamsAdminPage() {
  // Parallel Fetching for all 3 types
  const [prepModules, mockTests, practiceTests] = await Promise.all([
    prisma.prep_modules.findMany({
      include: { subjects: { select: { title: true } } },
      orderBy: { created_at: 'desc' }
    }),
    prisma.exams.findMany({
      where: { category: 'mock' },
      include: { subjects: { select: { title: true } } },
      orderBy: { created_at: 'desc' }
    }),
    prisma.practice_tests.findMany({
      include: { subjects: { select: { title: true } } },
      orderBy: { created_at: 'desc' }
    })
  ])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Exam Management</h1>
        <p className="text-gray-500">Manage all testing content: Prep Modules, Mocks, and Practice Tests.</p>
      </div>

      <ExamsClient 
        prepModules={prepModules as any}
        mockTests={mockTests as any}
        practiceTests={practiceTests as any}
      />
    </div>
  )
}