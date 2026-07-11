'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// 1. Delete Single Mock Test
export async function deleteMockTest(id: string) {
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return { error: 'Unauthorized' }

  try {
    await prisma.mock_tests.delete({ where: { id } })
    revalidatePath('/dashboard/admin/mocktest')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

// 2. Update Mock Test Details
export async function updateMockTest(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return { error: 'Unauthorized' }
  
  const title = formData.get('title') as string
  const duration = parseInt(formData.get('duration') as string)

  try {
    await prisma.mock_tests.update({
      where: { id },
      data: {
        title,
        duration_minutes: duration
      }
    })
    revalidatePath('/dashboard/admin/mocktest')
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

// 3. NEW: Bulk Delete Mock Tests (For "Delete All" button)
export async function deleteMockTestsAction(mockIds: string[]) {
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return { error: 'Unauthorized' }

  if (!mockIds || mockIds.length === 0) {
    return { error: 'No tests selected for deletion.' }
  }

  try {
    await prisma.mock_tests.deleteMany({
      where: { id: { in: mockIds } }
    })
    revalidatePath('/dashboard/admin/mocktest')
    return { success: true }
  } catch (error: any) {
    console.error('Bulk delete error:', error)
    return { error: 'Failed to delete mock tests.' }
  }
}