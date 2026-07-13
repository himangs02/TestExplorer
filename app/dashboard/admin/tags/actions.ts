'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTagAction(formData: FormData): Promise<any> {
  const name = formData.get('name') as string

  if (!name) return

  try {
    await prisma.tags.create({ data: { name } })
  } catch (error: any) {
    console.error('Error creating tag:', error)
    return { error: 'Tag already exists or failed to create' }
  }

  revalidatePath('/dashboard/admin/tags')
  revalidatePath('/dashboard/admin/blogs/create')
  return { success: true }
}

export async function deleteTagAction(formData: FormData): Promise<any> {
  const id = formData.get('id') as string

  try {
    await prisma.tags.delete({ where: { id } })
  } catch (error: any) {
    console.error('Error deleting tag:', error)
  }

  revalidatePath('/dashboard/admin/tags')
  revalidatePath('/dashboard/admin/blogs/create')
  return { success: true }
}