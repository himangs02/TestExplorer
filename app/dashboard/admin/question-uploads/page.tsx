import { prisma } from '@/lib/prisma'
import { UploadCloud } from 'lucide-react'
import SubjectUploader from '@/components/admin/subject-uploader'

export default async function QuestionUploadsPage() {
  const rawStreams = await prisma.categories.findMany({
    select: {
      id: true,
      title: true,
      courses: {
        select: {
          id: true,
          title: true,
          subjects: {
            select: {
              id: true,
              title: true,
              question_banks: {
                select: {
                  id: true,
                  _count: {
                    select: { questions: true }
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { title: 'asc' }
  })

  const streams = rawStreams?.map((stream: any) => ({
    ...stream,
    courses: stream.courses.map((course: any) => ({
      ...course,
      subjects: course.subjects.map((subject: any) => {
        const totalQuestions = subject.question_banks.reduce((sum: number, bank: any) => {
          const bankQuestionCount = bank._count?.questions || 0
          return sum + bankQuestionCount
        }, 0)

        return {
          ...subject,
          banks_count: subject.question_banks.length, 
          total_questions: totalQuestions 
        }
      })
    }))
  })) || []

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Question Uploads</h1>
          <p className="text-gray-500 font-medium">Select a subject to bulk upload questions into the Pool.</p>
        </div>
      </div>

      <SubjectUploader streams={streams} />
    </div>
  )
}