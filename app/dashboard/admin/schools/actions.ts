'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- DELETE SCHOOL ---
export async function deleteSchoolAction(formData: FormData) {
  const schoolId = formData.get('schoolId') as string

  try {
    await prisma.organizations.delete({
      where: { id: schoolId }
    })
  } catch (error: any) {
    console.error('Delete failed:', error)
    throw new Error('Failed to delete school.')
  }

  revalidatePath('/dashboard/admin/schools')
}

// --- UPDATE SCHOOL ---
export async function updateSchoolAction(formData: FormData) {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const slug = formData.get('slug') as string
  const welcome_message = formData.get('welcome_message') as string

  try {
    await prisma.organizations.update({
      where: { id },
      data: {
        name,
        slug: slug.toLowerCase(),
        welcome_message
      }
    })
  } catch (error: any) {
    console.error('Update failed:', error)
    throw new Error('Failed to update school.')
  }

  revalidatePath('/dashboard/admin/schools')
  redirect('/dashboard/admin/schools')
}