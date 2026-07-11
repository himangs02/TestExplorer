'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Create Stream
export async function createStreamAction(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const icon_key = formData.get('icon_key') as string
  const bg_color = formData.get('bg_color') as string
  const order_index = parseInt(formData.get('order_index') as string) || 0

  try {
    await prisma.categories.create({
      data: { title, description, icon_key, bg_color, order_index }
    })
  } catch (error: any) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin/streams')
  revalidatePath('/categories') // Update the public page too
  redirect('/dashboard/admin/streams')
}

// Update Stream
export async function updateStreamAction(formData: FormData) {
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const icon_key = formData.get('icon_key') as string
  const bg_color = formData.get('bg_color') as string
  const order_index = parseInt(formData.get('order_index') as string) || 0

  try {
    await prisma.categories.update({
      where: { id },
      data: { title, description, icon_key, bg_color, order_index }
    })
  } catch (error: any) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin/streams')
  revalidatePath('/categories')
  redirect('/dashboard/admin/streams')
}

// Delete Stream
export async function deleteStreamAction(formData: FormData) {
  const id = formData.get('id') as string

  try {
    await prisma.categories.delete({ where: { id } })
  } catch (error: any) {
    throw new Error(error.message)
  }
  
  revalidatePath('/dashboard/admin/streams')
  revalidatePath('/categories')
}