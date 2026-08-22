import { prisma } from '@/lib/prisma'
import QuestionPortalHub from '@/components/admin/question-portal-hub'

export default async function QuestionPortalPage() {
  const [subjectsCount, chaptersCount, questionsCount] = await Promise.all([
    prisma.subjects.count(),
    prisma.chapters.count(),
    prisma.questions.count({
      where: { chapter_id: { not: null } }
    })
  ])

  return (
    <QuestionPortalHub
      subjectsCount={subjectsCount}
      chaptersCount={chaptersCount}
      questionsCount={questionsCount}
    />
  )
}


