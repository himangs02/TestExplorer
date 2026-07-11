'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  const user = session?.user

  if (!user) {
    return { error: 'You must be logged in to update your profile.' }
  }

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const state = formData.get('state') as string
  const city = formData.get('city') as string
  
  try {
    // Update Profile
    await prisma.profiles.update({
      where: { id: user.id },
      data: { 
        full_name: fullName,
        phone: phone,
        state: state,
        city: city,
        updated_at: new Date()
      }
    })

    revalidatePath('/profile')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Profile Update Error:', error.message) // Check your terminal for this!
    return { error: `Update failed: ${error.message}` }
  }
}