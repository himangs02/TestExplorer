'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Create Course
export async function createCourseAction(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const is_published = formData.get('is_published') === 'on'

  try {
    await prisma.courses.create({
      data: {
        title, 
        description, 
        is_published,
        category_id: category_id || null // Handle "Select Category" (empty string) case
      }
    })
  } catch (error: any) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin/courses')
  redirect('/dashboard/admin/courses')
}

// Update Course
export async function updateCourseAction(formData: FormData) {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const category_id = formData.get('category_id') as string
  const is_published = formData.get('is_published') === 'on'

  try {
    await prisma.courses.update({
      where: { id },
      data: {
        title, 
        description, 
        is_published,
        category_id: category_id || null
      }
    })
  } catch (error: any) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin/courses')
  redirect('/dashboard/admin/courses')
}

// Delete Course
export async function deleteCourseAction(formData: FormData) {
  const id = formData.get('id') as string

  try {
    await prisma.courses.delete({ where: { id } })
  } catch (error: any) {
    throw new Error(error.message)
  }
  
  revalidatePath('/dashboard/admin/courses')
}