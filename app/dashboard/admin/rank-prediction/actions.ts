'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { parse } from 'csv-parse/sync'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

interface RankCSVRow {
  min_score: string;
  max_score: string;
  rank: string;
  percentile: string;
  [key: string]: string | undefined;
}

export async function uploadRankDataAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: 'Unauthorized' }

  // CHANGED: Now accepting course_id
  const course_id = formData.get('course_id') as string
  const file = formData.get('csv_file') as File

  if (!course_id) return { error: "Course ID is missing" }
  if (!file) return { error: "No file uploaded" }

  // 1. Parse CSV
  const fileContent = await file.text()
  const records = parse(fileContent, {
    columns: (headers: string[]) => 
      headers.map(h => 
        h.trim().toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
      ),
    skip_empty_lines: true,
    trim: true, 
    relax_quotes: true
  }) as RankCSVRow[]

  if (records.length === 0) return { error: "CSV file is empty" }

  // 2. Prepare Data
  const rowsToInsert = records.map(row => {
    const min = row.min_score || row.min || row.score_from
    const max = row.max_score || row.max || row.score_to
    const rank = row.rank || row.approx_rank || row.rank_range
    const percentile = row.percentile || row.approx_percentile || row.percentile_range

    if (!min || !max) return null 

    return {
      course_id, // Link to Course
      min_score: parseFloat(min),
      max_score: parseFloat(max),
      approx_rank: rank,
      approx_percentile: percentile
    }
  }).filter(r => r !== null)

  if (rowsToInsert.length === 0) return { error: "No valid rows found. Check CSV headers." }

  // 3. TRANSACTION: Delete Old -> Insert New
  
  try {
    // A. Delete existing rank data for this COURSE
    await prisma.exam_rank_predictions.deleteMany({
      where: { course_id }
    })

    // B. Insert new data
    // Prisma requires exact types for createMany
    const validRows = rowsToInsert as {
      course_id: string;
      min_score: number;
      max_score: number;
      approx_rank: string | undefined;
      approx_percentile: string | undefined;
    }[];
    
    await prisma.exam_rank_predictions.createMany({
      data: validRows
    })

    revalidatePath('/dashboard/admin/rank-prediction')
    return { success: true, count: rowsToInsert.length }
  } catch (error: any) {
    return { error: "Failed to save rank data: " + error.message }
  }
}

export async function deleteRankDataAction(courseId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { error: 'Unauthorized' }
  
  try {
    // Delete by course_id
    await prisma.exam_rank_predictions.deleteMany({
      where: { course_id: courseId }
    })
    
    revalidatePath('/dashboard/admin/rank-prediction')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}