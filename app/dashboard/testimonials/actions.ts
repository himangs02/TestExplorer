'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// --- CREATE TESTIMONIAL ---
export async function createTestimonialAction(formData: FormData) {
  const session = await getServerSession(authOptions)
  const user = session?.user
  if (!user) return { error: 'Unauthorized' }

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { organization_id: true }
  })

  if (!profile?.organization_id) {
    return { error: 'You are not assigned to a school.' }
  }

  // 2. Extract Data from the Form
  const student_name = (formData.get('student_name') as string || '').trim()
  const course_name = (formData.get('course_name') as string || '').trim()
  const message = (formData.get('message') as string || '').trim()
  const student_image = (formData.get('student_image') as string || '').trim()

  // 3. Basic Validation
  if (!student_name || !message) {
    return { error: 'Student Name and Message are required.' }
  }

  // 4. Insert into Database
  try {
    await prisma.school_testimonials.create({
      data: {
        organization_id: profile.organization_id,
        student_name,
        course_name,
        message,
        student_image
      }
    })
  } catch (error) {
    console.error("Error inserting testimonial:", error)
    return { error: 'Failed to add testimonial. Please try again.' }
  }

  // 5. Refresh Pages
  revalidatePath('/dashboard/admin/testimonials')
  revalidatePath('/') 
  return { success: true }
}

// --- DELETE TESTIMONIAL ---
export async function deleteTestimonialAction(formData: FormData) {
  const id = formData.get('id') as string

  if (!id) return { error: 'Testimonial ID required' }

  try {
    await prisma.school_testimonials.delete({
      where: { id }
    })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    return { error: 'Failed to delete testimonial.' }
  }

  // Refresh Pages
  revalidatePath('/dashboard/admin/testimonials')
  revalidatePath('/') 
  return { success: true }
}
