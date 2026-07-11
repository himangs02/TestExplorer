'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// FETCH ALL EXAMS
export async function getExamLandingPages() {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')

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

// FETCH SINGLE EXAM DETAILS
export async function getExamDetails(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user) throw new Error('Unauthorized')

  const data = await prisma.courses.findUnique({
    where: { id }
  })

  if (!data) throw new Error('Exam not found')
  return data
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
        details: {}, // Start with empty details
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