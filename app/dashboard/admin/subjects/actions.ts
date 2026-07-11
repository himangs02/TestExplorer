'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Create Subject
export async function createSubjectAction(formData: FormData) {
  const title = formData.get('title') as string
  const course_id = formData.get('course_id') as string

  try {
    await prisma.subjects.create({
      data: { title, course_id }
    })
  } catch (error: any) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin/subjects')
  redirect('/dashboard/admin/subjects')
}

// Update Subject
export async function updateSubjectAction(formData: FormData) {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const course_id = formData.get('course_id') as string

  try {
    await prisma.subjects.update({
      where: { id },
      data: { title, course_id }
    })
  } catch (error: any) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin/subjects')
  redirect('/dashboard/admin/subjects')
}

// Delete Subject
export async function deleteSubjectAction(formData: FormData) {
  const id = formData.get('id') as string

  try {
    await prisma.subjects.delete({ where: { id } })
  } catch (error: any) {
    throw new Error(error.message)
  }
  revalidatePath('/dashboard/admin/subjects')
}
