'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTagAction(formData: FormData) {
  const name = formData.get('name') as string

  if (!name) return

  try {
    await prisma.tags.create({ data: { name } })
  } catch (error: any) {
    console.error('Error creating tag:', error)
    throw new Error('Tag already exists or failed to create')
  }

  revalidatePath('/dashboard/admin/tags')
  revalidatePath('/dashboard/admin/blogs/create')
}

export async function deleteTagAction(formData: FormData) {
  const id = formData.get('id') as string

  try {
    await prisma.tags.delete({ where: { id } })
  } catch (error: any) {
    console.error('Error deleting tag:', error)
  }

  revalidatePath('/dashboard/admin/tags')
  revalidatePath('/dashboard/admin/blogs/create')
}