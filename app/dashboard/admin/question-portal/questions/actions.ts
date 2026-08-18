'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { parse } from 'csv-parse/sync'

export async function createQuestionAction(formData: FormData) {
  try {
    const text = formData.get('text') as string
    const option_a = formData.get('option_a') as string
    const option_b = formData.get('option_b') as string
    const option_c = formData.get('option_c') as string
    const option_d = formData.get('option_d') as string
    const correct_option = formData.get('correct_option') as string
    const explanation = formData.get('explanation') as string | null
    const difficulty = formData.get('difficulty') as string | null || 'Medium'
    const subject_id = formData.get('subject_id') as string | null
    const chapter_id = formData.get('chapter_id') as string | null
    const topic_id = formData.get('topic_id') as string | null
    const marks = parseInt(formData.get('marks') as string || '1')

    if (!text || !correct_option) {
      return { error: 'Text and correct option are required' }
    }

    const question = await prisma.questions.create({
      data: {
        text,
        explanation,
        difficulty,
        subject_id: subject_id || null,
        chapter_id: chapter_id || null,
        topic_id: topic_id || null,
        marks,
        question_options: {
          create: [
            { text: option_a, is_correct: correct_option.toUpperCase() === 'A' },
            { text: option_b, is_correct: correct_option.toUpperCase() === 'B' },
            ...(option_c ? [{ text: option_c, is_correct: correct_option.toUpperCase() === 'C' }] : []),
            ...(option_d ? [{ text: option_d, is_correct: correct_option.toUpperCase() === 'D' }] : []),
          ]
        }
      }
    })
    
    revalidatePath('/dashboard/admin/question-portal/questions')
    return { success: true, data: question }
  } catch (error: any) {
    console.error('Error creating question:', error)
    return { error: error.message || 'Failed to create question' }
  }
}

export async function bulkUploadQuestionsAction(formData: FormData) {
  try {
    const file = formData.get('file') as File
    const subject_id = formData.get('subject_id') as string
    const chapter_id = (formData.get('chapter_id') as string) || null
    const topic_id = (formData.get('topic_id') as string) || null
    const defaultMarks = parseInt((formData.get('marks') as string) || '1')
    const defaultDifficulty = (formData.get('difficulty') as string) || 'Medium'

    if (!file || file.size === 0) {
      return { error: 'Please select a valid CSV file to upload.' }
    }

    if (!subject_id) {
      return { error: 'Please select a Subject for the uploaded questions.' }
    }

    const fileContent = await file.text()
    if (!fileContent.trim()) {
      return { error: 'The uploaded CSV file is empty.' }
    }

    // Parse CSV with robust header normalization
    const records = parse(fileContent, {
      columns: (headers: string[]) => 
        headers.map(h => 
          h.trim()
           .toLowerCase()
           .replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')
           .replace(/\s+/g, '_')
        ),
      skip_empty_lines: true,
      trim: true,
      relax_quotes: true,
      bom: true
    }) as Record<string, string>[]

    if (!records || records.length === 0) {
      return { error: 'No question records found in CSV.' }
    }

    let insertedCount = 0
    let skippedCount = 0

    for (const [index, row] of records.entries()) {
      try {
        const qText = row.question || row.text || row.question_text || row.q || row.question_name
        const qExp = row.explanation || row.solution || row.rationale || row.exp || ''
        const qDiff = row.difficulty || row.level || defaultDifficulty
        const qMarks = parseInt(row.marks || row.mark || row.score || row.points || `${defaultMarks}`) || defaultMarks
        
        const optA = row.option_a || row.a || row.opt_a || row.option1 || row.opt1 || ''
        const optB = row.option_b || row.b || row.opt_b || row.option2 || row.opt2 || ''
        const optC = row.option_c || row.c || row.opt_c || row.option3 || row.opt3 || ''
        const optD = row.option_d || row.d || row.opt_d || row.option4 || row.opt4 || ''
        
        const correctVal = (row.correct_option || row.answer || row.correct || row.ans || row.correct_answer || row.right_answer || row.answer_key || '').toString().trim()

        if (!qText || !optA || !optB || !correctVal) {
          console.warn(`[Bulk Upload] Skipping Row ${index + 1}: Missing question text, options, or correct answer.`)
          skippedCount++
          continue
        }

        const cleanCorrect = correctVal.replace(/^Option\s+/i, '').trim().toUpperCase()

        const rawOptions = [
          { text: optA, label: 'A' },
          { text: optB, label: 'B' },
          { text: optC, label: 'C' },
          { text: optD, label: 'D' },
        ].filter(o => o.text && o.text.trim() !== '')

        const optionsToCreate = rawOptions.map(opt => {
          const isCorrect = Boolean(
            cleanCorrect === opt.label || 
            (opt.text && cleanCorrect.toLowerCase() === opt.text.trim().toLowerCase())
          )
          return {
            text: opt.text,
            is_correct: isCorrect
          }
        })

        // If none matched label, check if correctVal matches option text directly
        const hasCorrect = optionsToCreate.some(o => o.is_correct)
        if (!hasCorrect && optionsToCreate.length > 0) {
          // Default to first option or fallback if specified by index
          if (cleanCorrect === '1') optionsToCreate[0].is_correct = true
          else if (cleanCorrect === '2' && optionsToCreate.length > 1) optionsToCreate[1].is_correct = true
          else if (cleanCorrect === '3' && optionsToCreate.length > 2) optionsToCreate[2].is_correct = true
          else if (cleanCorrect === '4' && optionsToCreate.length > 3) optionsToCreate[3].is_correct = true
          else optionsToCreate[0].is_correct = true
        }

        await prisma.questions.create({
          data: {
            text: qText,
            explanation: qExp,
            difficulty: qDiff,
            marks: qMarks,
            subject_id: subject_id,
            chapter_id: chapter_id || null,
            topic_id: topic_id || null,
            question_options: {
              create: optionsToCreate
            }
          }
        })

        insertedCount++
      } catch (rowErr) {
        console.error(`[Bulk Upload] Error processing row ${index + 1}:`, rowErr)
        skippedCount++
      }
    }

    revalidatePath('/dashboard/admin/question-portal/questions')
    revalidatePath('/dashboard/admin/blueprints')

    return {
      success: true,
      count: insertedCount,
      skipped: skippedCount,
      total: records.length
    }
  } catch (error: any) {
    console.error('Error during bulk question upload:', error)
    return { error: error.message || 'Failed to bulk upload questions' }
  }
}

export async function updateQuestionAction(formData: FormData) {
  return { success: true }
}

export async function deleteQuestionAction(formData: FormData) {
  try {
    const id = formData.get('id') as string
    if (!id) return { error: 'ID is required' }
    
    await prisma.questions.delete({ where: { id } })
    revalidatePath('/dashboard/admin/question-portal/questions')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting question:', error)
    return { error: error.message || 'Failed to delete question' }
  }
}
