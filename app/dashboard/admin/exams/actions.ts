'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { parse } from 'csv-parse/sync'

// 1. Define the Shape of your CSV Row
interface CSVQuestionRow {
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation?: string;
  direction?: string;
}

// --- HELPER: Parse CSV and Insert ---
async function parseAndInsertQuestions(file: File, parentId: string, type: 'prep' | 'mock' | 'practice') {
  const fileContent = await file.text()

  // 2. Cast the result of parse to your Interface array
  const records = parse(fileContent, {
    columns: true, 
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true 
  }) as CSVQuestionRow[]

  // Iterate over parsed records
  for (const [index, row] of records.entries()) {
    
    // Prepare Question Data
    const qData: any = {
      text: row.text,
      explanation: row.explanation || '',
      direction: row.direction || null,
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
      const correctVal = row.correct_option ? row.correct_option.trim() : ''
      
      const options = [
        { text: row.option_a, label: 'A' },
        { text: row.option_b, label: 'B' },
        { text: row.option_c, label: 'C' },
        { text: row.option_d, label: 'D' },
      ]

      const optionsData = options.map(opt => ({
        question_id: question.id,
        text: opt.text,
        // Check if correct_option matches 'A'/'B' or the text itself
        is_correct: correctVal.toUpperCase() === opt.label || correctVal === opt.text
      }))

      await prisma.question_options.createMany({
        data: optionsData
      })
    } catch (error: any) {
      console.error(`Error for Row ${index + 1}:`, error.message)
    }
  }
}

export async function createExamAction(formData: FormData) {
  const type = formData.get('type') as 'prep' | 'mock' | 'practice'
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const subject_id = formData.get('subject_id') as string
  const duration = parseInt(formData.get('duration') as string) || 0
  const is_published = formData.get('is_published') === 'on'
  const csvFile = formData.get('csv_file') as File

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
    throw new Error(error.message)
  }

  // 2. Process CSV if uploaded
  if (newRecordId && csvFile && csvFile.size > 0) {
    await parseAndInsertQuestions(csvFile, newRecordId, type)
  }

  revalidatePath('/dashboard/admin/exams')
  redirect('/dashboard/admin/exams')
}

export async function deleteExamAction(formData: FormData) {
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
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin/exams')
}

export async function updateExamAction(formData: FormData) {
  const id = formData.get('id') as string
  const type = formData.get('type') as 'prep' | 'mock' | 'practice'
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const subject_id = formData.get('subject_id') as string
  const duration = parseInt(formData.get('duration') as string) || 0
  const is_published = formData.get('is_published') === 'on'
  const csvFile = formData.get('csv_file') as File

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
    throw new Error(error.message)
  }

  if (csvFile && csvFile.size > 0) {
    await parseAndInsertQuestions(csvFile, id, type)
  }

  revalidatePath('/dashboard/admin/exams')
  redirect('/dashboard/admin/exams')
}

export async function deleteQuestionAction(formData: FormData) {
  const questionId = formData.get('question_id') as string
  const examId = formData.get('exam_id') as string
  
  try {
    await prisma.questions.delete({ where: { id: questionId } })
  } catch (error: any) {
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/admin/exams/${examId}/edit`)
}

export async function deleteAllQuestionsAction(formData: FormData) {
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
    throw new Error(error.message)
  }

  revalidatePath(`/dashboard/admin/exams/${examId}/edit`)
}