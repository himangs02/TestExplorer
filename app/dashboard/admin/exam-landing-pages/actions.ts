'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { generateExamDetails } from '@/lib/exam-details-generator'

// FETCH ALL EXAMS (and ensure DB has full details populated)
export async function getExamLandingPages() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')

  const courses = await prisma.courses.findMany({
    include: {
      subjects: { select: { title: true } }
    },
    orderBy: { created_at: 'desc' }
  })

  // Auto-populate any course with missing/empty details in the database
  for (const c of courses) {
    let parsed: any = null
    if (typeof c.details === 'string') {
      try { parsed = JSON.parse(c.details) } catch(e) {}
    } else if (c.details && typeof c.details === 'object') {
      parsed = c.details
    }

    if (!parsed || !parsed.tabs || Object.keys(parsed.tabs).length === 0 || !parsed.tabs.highlights || parsed.tabs.highlights.length === 0) {
      const subjectNames = c.subjects?.map(s => s.title) || []
      const generated = generateExamDetails(c.title, c.slug || c.id, subjectNames)
      try {
        await prisma.courses.update({
          where: { id: c.id },
          data: { details: generated }
        })
      } catch (err) {
        console.error('Failed to populate details for course', c.title, err)
      }
    }
  }

  const data = await prisma.courses.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
      is_published: true,
      created_at: true
    },
    orderBy: { created_at: 'desc' }
  })
  
  return data
}

// FETCH SINGLE EXAM DETAILS (and auto-populate DB if empty)
export async function getExamDetails(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')

  const data = await prisma.courses.findUnique({
    where: { id },
    include: {
      subjects: { select: { title: true } }
    }
  })

  if (!data) throw new Error('Exam not found')

  let parsedDetails: any = null
  if (typeof data.details === 'string') {
    try {
      parsedDetails = JSON.parse(data.details)
    } catch(e) {}
  } else if (data.details && typeof data.details === 'object') {
    parsedDetails = data.details
  }

  // If details or tabs are missing/empty, generate and persist to database!
  if (!parsedDetails || !parsedDetails.tabs || Object.keys(parsedDetails.tabs).length === 0 || !parsedDetails.tabs.highlights || parsedDetails.tabs.highlights.length === 0) {
    const subjectNames = data.subjects?.map(s => s.title) || []
    const generated = generateExamDetails(data.title, data.slug || data.id, subjectNames)

    await prisma.courses.update({
      where: { id: data.id },
      data: { details: generated }
    })

    return {
      ...data,
      details: generated
    }
  }

  return {
    ...data,
    details: parsedDetails
  }
}

// UPDATE EXAM DETAILS (The heavy lifter)
export async function updateExamDetails(id: string, details: any) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { success: false, message: 'Unauthorized' }

  try {
    // We only update the 'details' json column
    await prisma.courses.update({
      where: { id },
      data: { details }
    })

    revalidatePath(`/dashboard/admin/exam-landing-pages/${id}`)
    revalidatePath('/dashboard/admin/exam-landing-pages')
    return { success: true, message: 'Saved successfully' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// DELETE EXAM
export async function deleteExam(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { success: false, message: 'Unauthorized' }

  try {
    await prisma.courses.delete({
      where: { id }
    })

    revalidatePath('/dashboard/admin/exam-landing-pages')
    return { success: true, message: 'Deleted successfully' }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

// CREATE NEW EXAM STUB
export async function createExamStub(title: string, slug: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return { success: false, message: 'Unauthorized' }

  try {
    const data = await prisma.courses.create({
      data: { 
        title, 
        slug, 
        details: '{}', // Start with empty details
        category_id: '' // Provide a dummy or fetch valid if required, assuming it might be optional or handled
      },
      select: { id: true }
    })

    revalidatePath('/dashboard/admin/exam-landing-pages')
    return { success: true, id: data.id }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}