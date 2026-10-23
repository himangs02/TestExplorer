'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Helper to format Google Drive links to direct images
function formatImageUrl(url: string | null | undefined) {
  if (!url) return null
  const trimmed = url.trim()
  if (!trimmed) return null
  try {
    if (trimmed.includes('drive.google.com')) {
      const urlObj = new URL(trimmed)
      const pathMatch = urlObj.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/)
      const idParam = urlObj.searchParams.get('id')
      const fileId = pathMatch ? pathMatch[1] : idParam
      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}`
      }
    }
  } catch (e) {}
  return trimmed
}

export async function updateSchoolSettingsAction(formData: FormData) {
  const organizationId = formData.get('organizationId') as string
  const name = formData.get('name') as string
  const welcome_message = formData.get('welcome_message') as string
  const logo_url = formData.get('logo_url') as string
  const hero_image_url = formData.get('hero_image_url') as string
  
  // NEW FIELDS
  const email = formData.get('email') as string
  const phone = formData.get('phone') as string

  try {
    const updated = await prisma.organizations.update({
      where: { id: organizationId },
      data: {
        name,
        welcome_message,
        logo_url: formatImageUrl(logo_url),
        hero_image_url: formatImageUrl(hero_image_url),
        email, // Save email
        phone, // Save phone
        updated_at: new Date(),
      }
    })
    if (updated.slug) {
      revalidatePath(`/${updated.slug}`)
    }
  } catch (error: any) {
    console.error('Error updating school settings:', error)
    return { success: false }
  }

  revalidatePath('/dashboard/school-settings')
  return { success: true }
}
