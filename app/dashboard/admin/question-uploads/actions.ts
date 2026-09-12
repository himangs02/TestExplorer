'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { generatePracticeTestsAction, generateSubjectMockAction } from '@/app/dashboard/admin/subjects/actions'
import { parseQuestionsFile } from '@/lib/excel-parser'

// --- HELPER: Parse Excel/CSV and Insert Questions into Pool ---
async function parseAndInsertQuestions(file: File, parentId: string) {
  const arrayBuffer = await file.arrayBuffer()
  const fileBuffer = Buffer.from(arrayBuffer)
  
  console.log(`[Question Pool] Processing file: ${file.name}, Size: ${fileBuffer.length} bytes`)

  const records = await parseQuestionsFile(fileBuffer, file.name)

  if (!records || records.length === 0) {
    return { error: "Parsed 0 records. Check if the file is empty or formatted properly." }
  }

  console.log(`[Question Pool] Successfully parsed ${records.length} question rows.`)

  let insertedCount = 0
  let skippedCount = 0
  let errors: string[] = []

  for (const [index, row] of records.entries()) {
    try {
      const qText = (row.question || row.text || '').toString().trim()
      const qDesc = (row.direction || row.description || '').toString().trim()
      const qExp = (row.explanation || '').toString().trim()
      const qDiff = (row.difficulty || 'Medium').toString().trim()
      const qMarks = typeof row.marks === 'number' ? row.marks : (parseInt(String(row.marks || '1')) || 1)
      
      const optA = (row.option_a || '').toString().trim()
      const optB = (row.option_b || '').toString().trim()
      const optC = (row.option_c || '').toString().trim()
      const optD = (row.option_d || '').toString().trim()
      
      const correctVal = (row.correct_option || 'A').toString().trim()

      // Validate critical fields
      if (!qText || !optA || !optB) {
        console.warn(`[Question Pool] Skipping Row ${index + 1}: Missing critical data (Question text or Options A & B).`)
        skippedCount++
        continue
      }

      // 1. Insert Question
      const question = await prisma.questions.create({
        data: {
          text: qText,
          direction: qDesc || null,
          explanation: qExp || '',
          difficulty: qDiff,
          marks: qMarks,
          order_index: index + 1,
          question_bank_id: parentId
        }
      })

      // 2. Prepare Options
      const cleanCorrect = correctVal.replace(/^Option\s+/i, '').trim().toUpperCase()

      const rawOptions = [
        { text: optA, label: 'A' },
        { text: optB, label: 'B' },
        { text: optC, label: 'C' },
        { text: optD, label: 'D' },
      ].filter(o => o.text && o.text.trim() !== '')

      const optionsData = rawOptions.map(opt => {
        const isCorrect = Boolean(
          cleanCorrect === opt.label || 
          (opt.text && cleanCorrect.toLowerCase() === opt.text.toLowerCase())
        )

        return {
          question_id: question.id,
          text: opt.text,
          is_correct: isCorrect
        }
      })

      // If no option marked correct by label, fallback to option text or 1st option
      const hasCorrect = optionsData.some(o => o.is_correct)
      if (!hasCorrect && optionsData.length > 0) {
        if (cleanCorrect === '1') optionsData[0].is_correct = true
        else if (cleanCorrect === '2' && optionsData.length > 1) optionsData[1].is_correct = true
        else if (cleanCorrect === '3' && optionsData.length > 2) optionsData[2].is_correct = true
        else if (cleanCorrect === '4' && optionsData.length > 3) optionsData[3].is_correct = true
        else optionsData[0].is_correct = true
      }

      await prisma.question_options.createMany({ data: optionsData as any })
      insertedCount++

    } catch (err: any) {
      console.error(`[Question Pool] Error Row ${index + 1}:`, err.message)
      errors.push(`Row ${index + 1}: ${err.message}`)
    }
  }

  console.log(`[Question Pool] Complete. Inserted: ${insertedCount}, Skipped: ${skippedCount}`)

  if (insertedCount === 0) {
    return { error: `Failed to insert questions. Errors: ${errors.slice(0, 3).join(', ')}` }
  }
  
  return { success: true, inserted: insertedCount }
}

// --- MAIN ACTION: Upload Bank & Trigger Auto-Generation ---
export async function uploadQuestionBankAction(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const subject_id = formData.get('subject_id') as string
  const file = (formData.get('file') || formData.get('csv_file')) as File

  if (!file || file.size === 0) return { error: 'No file uploaded' }

  let bankId: string | undefined = undefined;
  
  try {
    // 1. Create Question Bank Container (This appends to the Subject Pool)
    const bank = await prisma.question_banks.create({
      data: {
        title: title || `Upload ${new Date().toLocaleDateString()}`, 
        description: description || '', 
        subject_id 
      },
      select: { id: true }
    })
    bankId = bank.id;

    // 2. Parse File & Insert Questions
    const result = await parseAndInsertQuestions(file, bank.id)

    if (result?.error) {
      console.error("File Processing Failed:", result.error)
      // Rollback: Delete the empty bank if file fails
      await prisma.question_banks.delete({ where: { id: bank.id } })
      return { error: result.error || "File Upload Failed" }
    }

    // ------------------------------------------------------------------
    // 3. ✅ AUTO-GENERATE SUBJECT CONTENT (Incremental)
    // ------------------------------------------------------------------
    if (subject_id) {
      console.log(`[Auto-Gen] Updating Subject content for: ${subject_id}...`)
      
      // Wrap in separate try/catch so we don't fail the upload if generation has a hiccup
      try {
        // A. Create new Practice Sets for the NEW (unused) questions
        const practiceRes = await generatePracticeTestsAction(subject_id)
        if (!practiceRes.success) console.warn("Practice Gen Warning:", practiceRes.message)
        
        // B. Create a NEW Subject Mock using the EXPANDED pool (Archives old one)
        const mockRes = await generateSubjectMockAction(subject_id)
        if (!mockRes.success) console.warn("Mock Gen Warning:", mockRes.message)

      } catch (genError) {
        console.error("[Auto-Gen] Critical Error during generation:", genError)
      }
    }

    revalidatePath(`/dashboard/admin/subjects/${subject_id}/edit`)
    revalidatePath(`/dashboard/admin/manage-content`)
    revalidatePath(`/dashboard/admin/question-uploads`)
    
    return { success: true, count: result.inserted }
  } catch (error: any) {
    if (bankId) {
      await prisma.question_banks.delete({ where: { id: bankId } }).catch(() => {})
    }
    return { error: `Failed to create bank: ${error.message}` }
  }
}

