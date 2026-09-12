'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { parseQuestionsFile } from '@/lib/excel-parser'

// --- HELPER: Parse Excel/CSV and Insert ---
async function parseAndInsertQuestions(file: File, parentId: string, type: 'prep' | 'mock' | 'practice') {
  const arrayBuffer = await file.arrayBuffer()
  const fileBuffer = Buffer.from(arrayBuffer)
  
  const records = await parseQuestionsFile(fileBuffer, file.name)
  if (!records || records.length === 0) return

  // Iterate over parsed records
  for (const [index, row] of records.entries()) {
    const qText = (row.question || row.text || '').toString().trim()
    const optA = (row.option_a || '').toString().trim()
    const optB = (row.option_b || '').toString().trim()
    const optC = (row.option_c || '').toString().trim()
    const optD = (row.option_d || '').toString().trim()
    const correctVal = (row.correct_option || 'A').toString().trim()

    if (!qText || !optA || !optB) continue

    // Prepare Question Data
    const qData: any = {
      text: qText,
      explanation: row.explanation || '',
      direction: row.direction || null,
      difficulty: row.difficulty || 'Medium',
      marks: typeof row.marks === 'number' ? row.marks : (parseInt(String(row.marks || '1')) || 1),
      order_index: index + 1
    }

    if (type === 'prep') qData.module_id = parentId
    else if (type === 'mock') qData.exam_id = parentId
    else if (type === 'practice') qData.practice_test_id = parentId

    try {
      // Insert Question
      const question = await prisma.questions.create({
        data: qData
      })

      // Prepare Options Data
      const cleanCorrect = correctVal.replace(/^Option\s+/i, '').trim().toUpperCase()
      
      const rawOptions = [
        { text: optA, label: 'A' },
        { text: optB, label: 'B' },
        { text: optC, label: 'C' },
        { text: optD, label: 'D' },
      ].filter(o => o.text && o.text.trim() !== '')

      const optionsData = rawOptions.map(opt => ({
        question_id: question.id,
        text: opt.text,
        is_correct: Boolean(cleanCorrect === opt.label || (opt.text && cleanCorrect.toLowerCase() === opt.text.toLowerCase()))
      }))

      // If no option marked correct by label, check fallback
      const hasCorrect = optionsData.some(o => o.is_correct)
      if (!hasCorrect && optionsData.length > 0) {
        if (cleanCorrect === '1') optionsData[0].is_correct = true
        else if (cleanCorrect === '2' && optionsData.length > 1) optionsData[1].is_correct = true
        else if (cleanCorrect === '3' && optionsData.length > 2) optionsData[2].is_correct = true
        else if (cleanCorrect === '4' && optionsData.length > 3) optionsData[3].is_correct = true
        else optionsData[0].is_correct = true
      }

      await prisma.question_options.createMany({
        data: optionsData
      })
    } catch (error: any) {
      console.error(`Error for Row ${index + 1}:`, error.message)
    }
  }
}

export async function createExamAction(formData: FormData): Promise<any> {
  const type = formData.get('type') as 'prep' | 'mock' | 'practice'
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const subject_id = formData.get('subject_id') as string
  const duration = parseInt(formData.get('duration') as string) || 0
  const is_published = formData.get('is_published') === 'on'
  const file = (formData.get('file') || formData.get('csv_file')) as File

  let newRecordId = null

  try {
    // 1. Insert into correct table
    if (type === 'prep') {
      const data = await prisma.prep_modules.create({
        data: { title, description, subject_id, is_published }
      })
      newRecordId = data.id
    } 
    else if (type === 'mock') {
      const data = await prisma.exams.create({
        data: { title, description, subject_id, duration_minutes: duration, is_published, category: 'mock' }
      })
      newRecordId = data.id
    } 
    else if (type === 'practice') {
      const data = await prisma.practice_tests.create({
        data: { title, description, subject_id, duration_minutes: duration, is_published }
      })
      newRecordId = data.id
    }
  } catch (error: any) {
    return { error: error.message }
  }

  // 2. Process File if uploaded
  if (newRecordId && file && file.size > 0) {
    await parseAndInsertQuestions(file, newRecordId, type)
  }

  revalidatePath('/dashboard/admin/exams')
  redirect('/dashboard/admin/exams')
}

export async function deleteExamAction(formData: FormData): Promise<any> {
  const id = formData.get('id') as string
  const type = formData.get('type') as string

  try {
    if (type === 'prep') {
      await prisma.prep_modules.delete({ where: { id } })
    } else if (type === 'mock') {
      await prisma.exams.delete({ where: { id } })
    } else if (type === 'practice') {
      await prisma.practice_tests.delete({ where: { id } })
    }
  } catch (error: any) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/admin/exams')
  return { success: true }
}

export async function updateExamAction(formData: FormData): Promise<any> {
  const id = formData.get('id') as string
  const type = formData.get('type') as 'prep' | 'mock' | 'practice'
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const subject_id = formData.get('subject_id') as string
  const duration = parseInt(formData.get('duration') as string) || 0
  const is_published = formData.get('is_published') === 'on'
  const file = (formData.get('file') || formData.get('csv_file')) as File

  const updatePayload: any = { title, description, subject_id, is_published }
  if (type !== 'prep') {
    updatePayload.duration_minutes = duration
  }

  try {
    if (type === 'prep') {
      await prisma.prep_modules.update({ where: { id }, data: updatePayload })
    } else if (type === 'mock') {
      await prisma.exams.update({ where: { id }, data: updatePayload })
    } else if (type === 'practice') {
      await prisma.practice_tests.update({ where: { id }, data: updatePayload })
    }
  } catch (error: any) {
    return { error: error.message }
  }

  if (file && file.size > 0) {
    await parseAndInsertQuestions(file, id, type)
  }

  revalidatePath('/dashboard/admin/exams')
  redirect('/dashboard/admin/exams')
}

export async function deleteQuestionAction(formData: FormData): Promise<any> {
  const questionId = formData.get('question_id') as string
  const examId = formData.get('exam_id') as string
  
  try {
    await prisma.questions.delete({ where: { id: questionId } })
  } catch (error: any) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/admin/exams/${examId}/edit`)
  return { success: true }
}

export async function deleteAllQuestionsAction(formData: FormData): Promise<any> {
  const examId = formData.get('exam_id') as string
  const type = formData.get('exam_type') as string

  let questionFK = 'module_id' 
  if (type === 'mock') questionFK = 'exam_id'
  else if (type === 'practice') questionFK = 'practice_test_id'

  try {
    await prisma.questions.deleteMany({
      where: { [questionFK]: examId }
    })
  } catch (error: any) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/admin/exams/${examId}/edit`)
  return { success: true }
}