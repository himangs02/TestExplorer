'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createChapterAction(formData: FormData) {
  try {
    const subject_id = formData.get('subject_id') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const order = parseInt(formData.get('order') as string || '0')
    const status = formData.get('status') as string || 'active'

    if (!subject_id || !name) {
      return { error: 'Subject ID and Name are required' }
    }

    const newChapter = await prisma.chapters.create({
      data: {
        subject_id,
        name,
        description,
        order,
        status,
      }
    })
    
    revalidatePath('/dashboard/admin/question-portal')
    return { success: true, data: newChapter }
  } catch (error: any) {
    console.error('Error creating chapter:', error)
    return { error: error.message || 'Failed to create chapter' }
  }
}

export async function updateChapterAction(formData: FormData) {
  try {
    const id = formData.get('id') as string
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const order = parseInt(formData.get('order') as string || '0')
    const status = formData.get('status') as string || 'active'

    if (!id || !name) {
      return { error: 'ID and Name are required' }
    }

    const updatedChapter = await prisma.chapters.update({
      where: { id },
      data: {
        name,
        description,
        order,
        status,
      }
    })
    
    revalidatePath('/dashboard/admin/question-portal')
    return { success: true, data: updatedChapter }
  } catch (error: any) {
    console.error('Error updating chapter:', error)
    return { error: error.message || 'Failed to update chapter' }
  }
}

export async function deleteChapterAction(formData: FormData) {
  try {
    const id = formData.get('id') as string
    if (!id) return { error: 'ID is required' }
    
    await prisma.chapters.delete({ where: { id } })
    revalidatePath('/dashboard/admin/question-portal')
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting chapter:', error)
    return { error: error.message || 'Failed to delete chapter' }
  }
}

export async function bulkCreateChaptersAction(chapters: any[]) {
  try {
    if (!chapters || chapters.length === 0) {
      return { error: 'No chapters provided' }
    }

    // Validate that all chapters have subject_id and name
    const invalidChapter = chapters.find(c => !c.subject_id || !c.name)
    if (invalidChapter) {
      return { error: 'All chapters must have a subject_id and name' }
    }

    await prisma.chapters.createMany({
      data: chapters.map(c => ({
        subject_id: c.subject_id,
        name: c.name,
        description: c.description || null,
        order: parseInt(c.order || '0'),
        status: c.status || 'active',
      })),
      skipDuplicates: true, // Prevents total failure if a duplicate ID somehow slips in (though we rely on UUIDs)
    })
    
    revalidatePath('/dashboard/admin/question-portal')
    return { success: true, count: chapters.length }
  } catch (error: any) {
    console.error('Error bulk creating chapters:', error)
    return { error: error.message || 'Failed to bulk create chapters' }
  }
}
