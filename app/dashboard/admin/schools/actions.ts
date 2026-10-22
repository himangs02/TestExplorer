'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- DELETE SCHOOL ---
export async function deleteSchoolAction(formData: FormData): Promise<any> {
  const schoolId = formData.get('schoolId') as string

  try {
    await prisma.organizations.delete({
      where: { id: schoolId }
    })
  } catch (error: any) {
    console.error('Delete failed:', error)
    return { error: 'Failed to delete school.' }
  }

  revalidatePath('/dashboard/admin/schools')
  return { success: true }
}

// Helper to format Google Drive links to direct images
function getValidImageUrl(url: string | null) {
  if (!url) return null
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname.includes('drive.google.com')) {
      const pathMatch = urlObj.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/)
      const idParam = urlObj.searchParams.get('id')
      const fileId = pathMatch ? pathMatch[1] : idParam
      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}`
      }
    }
  } catch (e) {}
  return url
}

// --- UPDATE SCHOOL ---
export async function updateSchoolAction(formData: FormData): Promise<any> {
  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const slug = (formData.get('slug') as string)?.toLowerCase()?.trim()
  const welcome_message = (formData.get('welcome_message') as string) || null
  const principal_image = (formData.get('principal_image') as string)?.trim() || null
  const principal_message = (formData.get('principal_message') as string)?.trim() || null

  try {
    await prisma.organizations.update({
      where: { id },
      data: {
        name,
        slug,
        welcome_message,
        principal_image: getValidImageUrl(principal_image),
        principal_message
      }
    })
  } catch (error: any) {
    console.error('Update failed:', error)
    return { error: 'Failed to update school.' }
  }

  revalidatePath('/dashboard/admin/schools')
  redirect('/dashboard/admin/schools')
}
