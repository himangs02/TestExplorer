'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Create Subject
export async function createSubjectAction(formData: FormData): Promise<any> {
  const title = formData.get('title') as string
  const course_id = formData.get('course_id') as string

  try {
    await prisma.subjects.create({
      data: { title, course_id }
    })
  } catch (error: any) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin/subjects')
  revalidatePath('/dashboard/admin/manage-content')
  redirect('/dashboard/admin/subjects')
}

// Bulk Create Subjects
export async function bulkCreateSubjectsAction(subjects: { course_id?: string | null; title: string; code?: string; description?: string; status?: string }[]) {
  try {
    if (!subjects || subjects.length === 0) {
      return { error: 'No subjects provided' }
    }

    const validSubjects = subjects.filter(s => s.title && s.title.trim() !== '')
    if (validSubjects.length === 0) {
      return { error: 'No valid subjects found. Every subject must have a title.' }
    }

    await prisma.subjects.createMany({
      data: validSubjects.map(s => ({
        title: s.title.trim(),
        course_id: s.course_id || null,
        code: s.code?.trim() || null,
        description: s.description?.trim() || null,
        status: s.status || 'active',
      })),
      skipDuplicates: true,
    })

    revalidatePath('/dashboard/admin/subjects')
    revalidatePath('/dashboard/admin/manage-content')
    revalidatePath('/dashboard/admin/question-portal')
    return { success: true, count: validSubjects.length }
  } catch (error: any) {
    console.error('Error bulk creating subjects:', error)
    return { error: error.message || 'Failed to bulk create subjects' }
  }
}

// Update Subject
export async function updateSubjectAction(formData: FormData): Promise<any> {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const course_id = formData.get('course_id') as string

  try {
    await prisma.subjects.update({
      where: { id },
      data: { title, course_id }
    })
  } catch (error: any) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin/subjects')
  revalidatePath('/dashboard/admin/manage-content')
  redirect('/dashboard/admin/subjects')
}

// Delete Subject
export async function deleteSubjectAction(formData: FormData): Promise<any> {
  const id = formData.get('id') as string

  try {
    // 1. CLEANUP: Delete Related Mock Tests
    const mocks = await prisma.mock_tests.findMany({ where: { subject_id: id }, select: { id: true } })
    if (mocks.length > 0) {
      const mockIds = mocks.map(m => m.id)
      await prisma.mock_test_questions.deleteMany({ where: { mock_test_id: { in: mockIds } } })
      await prisma.mock_tests.deleteMany({ where: { id: { in: mockIds } } })
    }

    // 2. CLEANUP: Delete Related Prep Modules
    const modules = await prisma.prep_modules.findMany({ where: { subject_id: id }, select: { id: true } })
    if (modules.length > 0) {
      const moduleIds = modules.map(m => m.id)
      await prisma.questions.updateMany({ where: { module_id: { in: moduleIds } }, data: { module_id: null } })
      await prisma.prep_modules.deleteMany({ where: { id: { in: moduleIds } } })
    }

    // 3. CLEANUP: Delete Related Practice Tests
    const practiceTests = await prisma.practice_tests.findMany({ where: { subject_id: id }, select: { id: true } })
    if (practiceTests.length > 0) {
      const testIds = practiceTests.map(t => t.id)
      await prisma.questions.updateMany({ where: { practice_test_id: { in: testIds } }, data: { practice_test_id: null } })
      await prisma.practice_tests.deleteMany({ where: { id: { in: testIds } } })
    }

    // 4. CLEANUP: Delete Related Question Banks
    const banks = await prisma.question_banks.findMany({ where: { subject_id: id }, select: { id: true } })
    if (banks.length > 0) {
      const bankIds = banks.map(b => b.id)
      await prisma.questions.deleteMany({ where: { question_bank_id: { in: bankIds } } })
      await prisma.question_banks.deleteMany({ where: { id: { in: bankIds } } })
    }

    // 5. DELETE SUBJECT
    await prisma.subjects.delete({ where: { id } })
  } catch (error: any) {
    return { error: error.message || 'Failed to delete subject' }
  }
  revalidatePath('/dashboard/admin/subjects')
  revalidatePath('/dashboard/admin/manage-content')
  return { success: true }
}

// -----------------------------------------------------------------------------
// HELPER: FETCH QUESTIONS
// -----------------------------------------------------------------------------
async function getSubjectQuestions(subjectId: string) {
  // 1. Get Banks for this Subject
  const banks = await prisma.question_banks.findMany({
    where: { subject_id: subjectId },
    select: { id: true }
  })
  
  const bankIds = banks.map(b => b.id)
  if (bankIds.length === 0) return []

  // 2. Get Questions
  const questions = await prisma.questions.findMany({
    where: { question_bank_id: { in: bankIds } },
    select: { id: true, practice_test_id: true, module_id: true }
  })

  return questions
}

// -----------------------------------------------------------------------------
// 1. GENERATE PREP MODULES (Incremental)
// -----------------------------------------------------------------------------
export async function generatePrepModulesAction(subjectId: string) {
  const CHUNK_SIZE = 10

  try {
    const allQuestions = await getSubjectQuestions(subjectId)
    const unusedQuestions = allQuestions.filter(q => !q.module_id)
    
    if (unusedQuestions.length === 0) {
      return { success: true, message: 'No new questions available for Prep Modules.' }
    }

    const count = await prisma.prep_modules.count({ where: { subject_id: subjectId } })
    let nextIndex = count + 1
    let createdCount = 0

    for (let i = 0; i < unusedQuestions.length; i += CHUNK_SIZE) {
      const chunk = unusedQuestions.slice(i, i + CHUNK_SIZE)
      
      const moduleData = await prisma.prep_modules.create({
        data: {
          subject_id: subjectId,
          title: `Prep Module ${nextIndex}`,
          description: `Auto-generated learning module with ${chunk.length} questions.`,
          difficulty: 'General',
          is_published: true
        },
        select: { id: true }
      })

      const qIds = chunk.map(q => q.id)
      await prisma.questions.updateMany({
        where: { id: { in: qIds } },
        data: { module_id: moduleData.id }
      })

      createdCount++
      nextIndex++
    }

    revalidatePath(`/courses`)
    return { success: true, message: `Added ${createdCount} new Prep Modules.` }
  } catch (error: any) {
    console.error("Prep Gen Error:", error)
    return { success: false, message: error.message }
  }
}

// -----------------------------------------------------------------------------
// 2. GENERATE PRACTICE TESTS (Incremental)
// -----------------------------------------------------------------------------
export async function generatePracticeTestsAction(subjectId: string) {
  const CHUNK_SIZE = 20

  try {
    const allQuestions = await getSubjectQuestions(subjectId)
    const unusedQuestions = allQuestions.filter(q => !q.practice_test_id)

    if (unusedQuestions.length === 0) {
      return { success: true, message: 'All questions are already in Practice Sets.' }
    }

    const count = await prisma.practice_tests.count({ where: { subject_id: subjectId } })
    let nextIndex = count + 1
    let createdCount = 0

    const shuffled = unusedQuestions.sort(() => 0.5 - Math.random())

    for (let i = 0; i < shuffled.length; i += CHUNK_SIZE) {
      const chunk = shuffled.slice(i, i + CHUNK_SIZE)
      
      const testData = await prisma.practice_tests.create({
        data: {
          subject_id: subjectId,
          title: `Practice Set ${nextIndex}`,
          description: `Practice set with ${chunk.length} questions.`,
          duration_minutes: chunk.length,
          is_published: true
        },
        select: { id: true }
      })

      const qIds = chunk.map(q => q.id)
      await prisma.questions.updateMany({
        where: { id: { in: qIds } },
        data: { practice_test_id: testData.id }
      })

      createdCount++
      nextIndex++
    }

    revalidatePath(`/courses`)
    return { success: true, message: `Created ${createdCount} new Practice Sets.` }
  } catch (error: any) {
    console.error("Practice Gen Error:", error)
    return { success: false, message: error.message }
  }
}

// -----------------------------------------------------------------------------
// 3. GENERATE SUBJECT MOCK EXAMS (Incremental & Active)
// -----------------------------------------------------------------------------
export async function generateSubjectMockAction(subjectId: string) {
  const MOCK_SIZE = 50 

  try {
    const allQuestions = await getSubjectQuestions(subjectId)
    if (allQuestions.length === 0) return { success: false, message: 'No questions found.' }

    const existingMocks = await prisma.mock_tests.findMany({
      where: { subject_id: subjectId },
      select: { id: true }
    })

    const usedQuestionIds = new Set<string>()
    
    if (existingMocks.length > 0) {
      const mockIds = existingMocks.map(m => m.id)
      const used = await prisma.mock_test_questions.findMany({
        where: { mock_test_id: { in: mockIds } },
        select: { question_id: true }
      })
      used.forEach(u => usedQuestionIds.add(u.question_id))
    }

    const unusedQuestions = allQuestions.filter(q => !usedQuestionIds.has(q.id))

    if (unusedQuestions.length === 0) {
      return { success: true, message: 'All questions already used in Subject Mocks.' }
    }

    const subject = await prisma.subjects.findUnique({
      where: { id: subjectId },
      select: { course_id: true, title: true }
    })
    
    const count = await prisma.mock_tests.count({ where: { subject_id: subjectId } })
    
    let nextIndex = count + 1
    let createdCount = 0

    const shuffled = unusedQuestions.sort(() => 0.5 - Math.random())

    for (let i = 0; i < shuffled.length; i += MOCK_SIZE) {
      const chunk = shuffled.slice(i, i + MOCK_SIZE)
      const duration = Math.ceil(chunk.length * 1.2)
      const totalMarks = chunk.length * 4

      const mockData = await prisma.mock_tests.create({
        data: {
          course_id: subject?.course_id || '',
          subject_id: subjectId,
          title: `${subject?.title || 'Subject'} Mock ${nextIndex}`,
          description: `Subject mock with ${chunk.length} questions.`,
          
          duration_minutes: duration,
          total_marks: totalMarks,
          marks_correct: 4,
          marks_incorrect: -1,
          marks_unattempted: 0,
          
          is_active: true 
        },
        select: { id: true }
      })

      const links = chunk.map(q => ({
        mock_test_id: mockData.id,
        question_id: q.id
      }))

      await prisma.mock_test_questions.createMany({ data: links })
      createdCount++
      nextIndex++
    }

    revalidatePath(`/courses`)
    return { success: true, message: `Generated ${createdCount} new Subject Mocks.` }
  } catch (error: any) {
    console.error("Subject Mock Gen Error:", error)
    return { success: false, message: error.message }
  }
}

export const generateMockTestsAction = generateSubjectMockAction;
