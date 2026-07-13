'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createAnnouncementAction(formData: FormData): Promise<any> {
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return { error: 'Unauthorized' }

  // Get Admin's School ID
  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { organization_id: true }
  })

  if (!profile?.organization_id) return { error: 'No school assigned' }

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  try {
    await prisma.school_announcements.create({
      data: {
        organization_id: profile.organization_id,
        title,
        content
      }
    })
  } catch (error: any) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/announcements')
  revalidatePath('/') // Revalidate landing pages if cached
}

export async function deleteAnnouncementAction(formData: FormData): Promise<any> {
  const id = formData.get('id') as string

  try {
    await prisma.school_announcements.delete({
      where: { id }
    })
  } catch (error: any) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/announcements')
  return { success: true }
}