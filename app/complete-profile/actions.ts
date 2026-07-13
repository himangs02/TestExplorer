'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { revalidatePath } from 'next/cache'

export async function completeProfileAction(formData: FormData): Promise<any> {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user || !session.user.id) {
    return { error: 'Not authenticated' }
  }

  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const stream = formData.get('stream') as string
  const state = formData.get('state') as string
  const city = formData.get('city') as string

  if (!fullName || !phone || !stream || !state || !city) {
    return { error: 'Please fill in all required fields to continue.' }
  }

  try {
    await prisma.profiles.update({
      where: { id: session.user.id },
      data: {
        full_name: fullName,
        phone_no: phone,
        stream: stream,
        state: state,
        city: city,
        updated_at: new Date(),
      }
    })

    revalidatePath('/')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error: any) {
    console.error('Error completing profile:', error)
    return { error: error.message || 'An error occurred while saving your profile.' }
  }
}
