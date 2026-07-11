'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

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
    await prisma.organizations.update({
      where: { id: organizationId },
      data: {
        name,
        welcome_message,
        logo_url,
        hero_image_url,
        email, // Save email
        phone, // Save phone
        updated_at: new Date(),
      }
    })
  } catch (error: any) {
    console.error('Error updating school settings:', error)
    return { success: false }
  }

  revalidatePath('/dashboard/school-settings')
  return { success: true }
}