'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createTopicAction(formData: FormData) {
  try {
    const chapter_id = formData.get('chapter_id') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const order = parseInt(formData.get('order') as string || '0')
    const status = formData.get('status') as string || 'active'

    if (!chapter_id || !name) {
      return { error: 'Chapter ID and Name are required' }
    }

    const newTopic = await prisma.topics.create({
      data: {
        chapter_id,
        name,
        description,
        order,
        status,
      }
    })
    
    revalidatePath('/dashboard/admin/question-portal')
    return { success: true, data: newTopic }
  } catch (error: any) {
    console.error('Error creating topic:', error)
    return { error: error.message || 'Failed to create topic' }
  }
}

export async function updateTopicAction(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const order = parseInt(formData.get('order') as string || '0')
    const status = formData.get('status') as string || 'active'

    if (!id || !name) {
      return { error: 'ID and Name are required' }
    }

    const updatedTopic = await prisma.topics.update({
      where: { id },
      data: {
        name,
        description,
        order,
        status,
      }
    })
    
    revalidatePath('/dashboard/admin/question-portal')
    return { success: true, data: updatedTopic }
  } catch (error: any) {
    console.error('Error updating topic:', error)
    return { error: error.message || 'Failed to update topic' }
  }
}

export async function deleteTopicAction(formData: FormData) {
  try {
    const id = formData.get('id') as string
    if (!id) return { error: 'ID is required' }
    
    await prisma.topics.delete({ where: { id } })
    revalidatePath('/dashboard/admin/question-portal')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting topic:', error)
    return { error: error.message || 'Failed to delete topic' }
  }
}

export async function bulkCreateTopicsAction(topics: any[]) {
  try {
    if (!topics || topics.length === 0) {
      return { error: 'No topics provided' }
    }

    const created = await prisma.topics.createMany({
      data: topics.map(t => ({
        chapter_id: t.chapter_id,
        name: t.name,
        description: t.description || null,
        order: parseInt(t.order) || 0,
        status: t.status || 'active'
      })),
      skipDuplicates: true
    })

    revalidatePath('/dashboard/admin/question-portal')
    return { success: true, count: created.count }
  } catch (error: any) {
    console.error('Error bulk creating topics:', error)
    return { error: error.message || 'Failed to create topics in bulk' }
  }
}
