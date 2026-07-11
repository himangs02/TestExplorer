'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const address = formData.get('address') as string 
  const stream = formData.get('stream') as string
  
  const schoolId = formData.get('schoolId') as string
  
  let organizationId = null
  if (schoolId && schoolId.trim() !== '') {
    organizationId = schoolId
  }

  try {
    const existingUser = await prisma.users.findUnique({
      where: { email }
    })

    if (existingUser) {
      return { error: "User already exists with this email" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Using uuid package or let prisma handle defaults if id is cuid/uuid
    // Based on the migration, the ID might be a UUID. If Prisma schema has @default(uuid()), we can omit id.
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name: fullName,
        role: 'student', // default role
      }
    })

    await prisma.profiles.create({
      data: {
        id: user.id, // Foreign key to users
        full_name: fullName,
        phone,
        role: 'student',
        organization_id: organizationId,
        stream,
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error("Signup error:", error)
    return { error: error.message || "Failed to sign up" }
  }
}

export async function forgotPassword(formData: FormData) {
  // TODO: implement with Nodemailer or other email service for NextAuth
  return { error: "Forgot password not implemented yet in NextAuth migration" }
}