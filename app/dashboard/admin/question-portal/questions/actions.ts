'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { parse } from 'csv-parse/sync'
import { randomUUID } from 'crypto'

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

export async function universalBulkUploadQuestionsAction(formData: FormData) {
  try {
    const file = formData.get('file') as File
    if (!file || file.size === 0) {
      return { error: 'Please select a valid CSV file to upload.' }
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

    // Pre-fetch all courses with their subjects and chapters
    const courses = await prisma.courses.findMany({
      include: {
        subjects: {
          include: {
            chapters: true
          }
        }
      }
    })

    // In-memory caches to avoid duplicate DB lookups / creations during bulk loops
    const subjectCache = new Map<string, { id: string; title: string; course_id: string; chapters: { id: string; name: string }[] }>()
    const chapterCache = new Map<string, { id: string; name: string; subject_id: string }>()

    for (const c of courses) {
      for (const s of c.subjects) {
        const sKey = `${c.id}:::${s.title.toLowerCase().trim()}`
        subjectCache.set(sKey, {
          id: s.id,
          title: s.title,
          course_id: s.course_id,
          chapters: s.chapters.map(ch => ({ id: ch.id, name: ch.name }))
        })
        for (const ch of s.chapters) {
          const chKey = `${s.id}:::${ch.name.toLowerCase().trim()}`
          chapterCache.set(chKey, {
            id: ch.id,
            name: ch.name,
            subject_id: ch.subject_id
          })
        }
      }
    }

    // 1. Fetch existing questions to build deduplication signatures
    const existingQuestions = await prisma.questions.findMany({
      where: { subject_id: { not: null } },
      select: { subject_id: true, chapter_id: true, text: true }
    })

    const normalizeText = (t: string) => 
      t.trim()
       .toLowerCase()
       .replace(/[\r\n\t]+/g, ' ')
       .replace(/\s+/g, ' ')
       .replace(/[^\w\s]/g, '')

    const existingQuestionSet = new Set<string>()
    for (const eq of existingQuestions) {
      if (!eq.text) continue
      const norm = normalizeText(eq.text)
      if (eq.subject_id) {
        existingQuestionSet.add(`${eq.subject_id}:::${eq.chapter_id || ''}:::${norm}`)
        existingQuestionSet.add(`${eq.subject_id}:::${norm}`)
      }
    }

    const inFlightDedupeSet = new Set<string>()
    let duplicatesCount = 0
    let skippedCount = 0
    const errors: { row: number; reason: string }[] = []
    const breakdown: Record<string, number> = {}

    const questionsToInsert: {
      id: string
      text: string
      explanation: string | null
      difficulty: string
      marks: number
      subject_id: string
      chapter_id: string | null
      status: string
    }[] = []

    const optionsToInsert: {
      id: string
      question_id: string
      text: string
      is_correct: boolean
    }[] = []

    for (const [index, row] of records.entries()) {
      const rowNum = index + 2 // +1 for 1-based index, +1 for header row

      try {
        // 1. Identify Course
        const courseInput = (
          row.course || 
          row.exam || 
          row.course_name || 
          row.exam_name || 
          row.course_title || 
          row.category || 
          ''
        ).toString().trim()

        if (!courseInput) {
          skippedCount++
          errors.push({ row: rowNum, reason: 'Missing Course/Exam name in row.' })
          continue
        }

        const normalizedCourseInput = courseInput.toLowerCase()
        let matchedCourse = courses.find(c => 
          c.title.toLowerCase() === normalizedCourseInput ||
          (c.slug && c.slug.toLowerCase() === normalizedCourseInput)
        )

        if (!matchedCourse) {
          matchedCourse = courses.find(c => 
            c.title.toLowerCase().includes(normalizedCourseInput) ||
            normalizedCourseInput.includes(c.title.toLowerCase())
          )
        }

        if (!matchedCourse) {
          skippedCount++
          errors.push({ 
            row: rowNum, 
            reason: `Course "${courseInput}" not found in database.` 
          })
          continue
        }

        // 2. Identify Subject
        const subjectInput = (
          row.subject || 
          row.subject_name || 
          row.subj || 
          row.subject_title || 
          ''
        ).toString().trim()

        if (!subjectInput) {
          skippedCount++
          errors.push({ row: rowNum, reason: 'Missing Subject name in row.' })
          continue
        }

        // Safety check: JEE Main/Advanced does not have Biology
        if (matchedCourse.title.toLowerCase().includes('jee') && subjectInput.toLowerCase().includes('bio')) {
          skippedCount++
          errors.push({ row: rowNum, reason: `Biology cannot be assigned to "${matchedCourse.title}". Please set course to NEET or CUET.` })
          continue
        }

        const subjectKey = `${matchedCourse.id}:::${subjectInput.toLowerCase()}`
        let matchedSubject = subjectCache.get(subjectKey)

        if (!matchedSubject) {
          // Look for partial match
          for (const [k, s] of subjectCache.entries()) {
            if (s.course_id === matchedCourse.id && (s.title.toLowerCase().includes(subjectInput.toLowerCase()) || subjectInput.toLowerCase().includes(s.title.toLowerCase()))) {
              matchedSubject = s
              break
            }
          }
        }

        // Auto-create subject under this course if it doesn't exist
        if (!matchedSubject) {
          const createdSubject = await prisma.subjects.create({
            data: {
              title: subjectInput,
              course_id: matchedCourse.id,
              status: 'active'
            }
          })
          matchedSubject = {
            id: createdSubject.id,
            title: createdSubject.title,
            course_id: createdSubject.course_id,
            chapters: []
          }
          subjectCache.set(subjectKey, matchedSubject)
        }

        // 3. Identify Chapter (Optional or Auto-create)
        const chapterInput = (
          row.chapter || 
          row.chapter_name || 
          row.chap || 
          row.chapter_title || 
          ''
        ).toString().trim()

        let matchedChapterId: string | null = null

        if (chapterInput) {
          const chapterKey = `${matchedSubject.id}:::${chapterInput.toLowerCase()}`
          let matchedChapter = chapterCache.get(chapterKey)

          if (!matchedChapter) {
            for (const ch of matchedSubject.chapters) {
              if (ch.name.toLowerCase().includes(chapterInput.toLowerCase()) || chapterInput.toLowerCase().includes(ch.name.toLowerCase())) {
                matchedChapter = { id: ch.id, name: ch.name, subject_id: matchedSubject.id }
                break
              }
            }
          }

          // Auto-create chapter under this subject if it doesn't exist
          if (!matchedChapter) {
            const nextOrder = (matchedSubject.chapters.length || 0) + 1
            const createdChapter = await prisma.chapters.create({
              data: {
                name: chapterInput,
                subject_id: matchedSubject.id,
                status: 'active',
                order: nextOrder
              }
            })
            matchedChapter = {
              id: createdChapter.id,
              name: createdChapter.name,
              subject_id: createdChapter.subject_id
            }
            chapterCache.set(chapterKey, matchedChapter)
            matchedSubject.chapters.push({ id: matchedChapter.id, name: matchedChapter.name })
          }

          matchedChapterId = matchedChapter.id
        }

        // 4. Extract Question Data
        const qText = (row.question || row.text || row.question_text || row.q || row.question_name || '').toString().trim()
        const qExp = (row.explanation || row.solution || row.rationale || row.exp || '').toString().trim()
        const qDiff = (row.difficulty || row.level || 'Medium').toString().trim()
        const qMarks = parseInt(row.marks || row.mark || row.score || row.points || '1') || 1

        const optA = (row.option_a || row.a || row.opt_a || row.option1 || row.opt1 || '').toString().trim()
        const optB = (row.option_b || row.b || row.opt_b || row.option2 || row.opt2 || '').toString().trim()
        const optC = (row.option_c || row.c || row.opt_c || row.option3 || row.opt3 || '').toString().trim()
        const optD = (row.option_d || row.d || row.opt_d || row.option4 || row.opt4 || '').toString().trim()

        const correctVal = (row.correct_option || row.answer || row.correct || row.ans || row.correct_answer || row.right_answer || row.answer_key || '').toString().trim()

        if (!qText || !optA || !optB || !correctVal) {
          skippedCount++
          errors.push({ row: rowNum, reason: 'Missing question text, Options (A & B), or Correct Answer.' })
          continue
        }

        // 5. DEDUPLICATION CHECK: Skip duplicates in DB and within this CSV file
        const normQ = normalizeText(qText)
        const specificSig = `${matchedSubject.id}:::${matchedChapterId || ''}:::${normQ}`
        const subjectSig = `${matchedSubject.id}:::${normQ}`

        if (
          existingQuestionSet.has(specificSig) || 
          existingQuestionSet.has(subjectSig) || 
          inFlightDedupeSet.has(specificSig) || 
          inFlightDedupeSet.has(subjectSig)
        ) {
          duplicatesCount++
          continue // Duplicate found -> skip smoothly!
        }

        // Mark signature as seen for this upload session
        inFlightDedupeSet.add(specificSig)
        inFlightDedupeSet.add(subjectSig)

        const cleanCorrect = correctVal.replace(/^Option\s+/i, '').trim().toUpperCase()

        const rawOptions = [
          { text: optA, label: 'A' },
          { text: optB, label: 'B' },
          { text: optC, label: 'C' },
          { text: optD, label: 'D' },
        ].filter(o => o.text && o.text.trim() !== '')

        const qId = randomUUID()

        const rowOptions = rawOptions.map(opt => {
          const isCorrect = Boolean(
            cleanCorrect === opt.label || 
            (opt.text && cleanCorrect.toLowerCase() === opt.text.trim().toLowerCase())
          )
          return {
            id: randomUUID(),
            question_id: qId,
            text: opt.text,
            is_correct: isCorrect
          }
        })

        const hasCorrect = rowOptions.some(o => o.is_correct)
        if (!hasCorrect && rowOptions.length > 0) {
          if (cleanCorrect === '1') rowOptions[0].is_correct = true
          else if (cleanCorrect === '2' && rowOptions.length > 1) rowOptions[1].is_correct = true
          else if (cleanCorrect === '3' && rowOptions.length > 2) rowOptions[2].is_correct = true
          else if (cleanCorrect === '4' && rowOptions.length > 3) rowOptions[3].is_correct = true
          else rowOptions[0].is_correct = true
        }

        questionsToInsert.push({
          id: qId,
          text: qText,
          explanation: qExp || null,
          difficulty: qDiff,
          marks: qMarks,
          subject_id: matchedSubject.id,
          chapter_id: matchedChapterId,
          status: 'active'
        })

        for (const opt of rowOptions) {
          optionsToInsert.push(opt)
        }

        const key = `${matchedCourse.title} > ${matchedSubject.title}`
        breakdown[key] = (breakdown[key] || 0) + 1

      } catch (rowErr: any) {
        console.error(`[Universal Bulk Upload] Error processing row ${rowNum}:`, rowErr)
        skippedCount++
        errors.push({ row: rowNum, reason: rowErr.message || 'Error processing row.' })
      }
    }

    // High-speed Chunked Batch Insertion (500 questions per transaction batch)
    const BATCH_SIZE = 500
    for (let i = 0; i < questionsToInsert.length; i += BATCH_SIZE) {
      const qBatch = questionsToInsert.slice(i, i + BATCH_SIZE)
      const qBatchIds = new Set(qBatch.map(q => q.id))
      const optBatch = optionsToInsert.filter(o => qBatchIds.has(o.question_id))

      await prisma.questions.createMany({
        data: qBatch
      })

      if (optBatch.length > 0) {
        await prisma.question_options.createMany({
          data: optBatch
        })
      }
    }

    revalidatePath('/dashboard/admin/question-portal/questions')
    revalidatePath('/dashboard/admin/question-portal')
    revalidatePath('/dashboard/admin/blueprints')

    return {
      success: true,
      count: questionsToInsert.length,
      duplicates: duplicatesCount,
      skipped: skippedCount,
      total: records.length,
      breakdown,
      errors: errors.slice(0, 15)
    }
  } catch (error: any) {
    console.error('Error during universal bulk question upload:', error)
    return { error: error.message || 'Failed to process universal bulk upload.' }
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

