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
  const email = formData.get('email') as string
  
  if (!email) {
    return { error: "Email is required" }
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email }
    })

    if (!user) {
      console.log(`\n======================================================`)
      console.log(`[DEV INFO] Forgot Password requested for ${email}, but this email does NOT exist in the database.`)
      console.log(`No reset token was generated. Returning success to UI to prevent email enumeration.`)
      console.log(`======================================================\n`)
      // Return success even if user doesn't exist to prevent email enumeration
      return { success: true }
    }

    const token = crypto.randomUUID()
    
    // Save to VerificationToken table
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours
      }
    })

    // Simulate sending email (in development)
    console.log(`\n======================================================`)
    console.log(`Password reset requested for ${email}`)
    console.log(`Reset link: http://localhost:3000/reset-password?token=${token}`)
    console.log(`======================================================\n`)

    return { success: true }
  } catch (error: any) {
    console.error("Forgot password error:", error)
    return { error: error.message || "Failed to process request" }
  }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!token) return { error: "Invalid or missing token" }
  if (password !== confirmPassword) return { error: "Passwords do not match" }
  if (password.length < 6) return { error: "Password must be at least 6 characters" }

  try {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token }
    })

    if (!verificationToken || verificationToken.expires < new Date()) {
      return { error: "Token is invalid or has expired" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.users.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword }
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token }
    })

    return { success: true }
  } catch (error: any) {
    console.error("Reset password error:", error)
    return { error: error.message || "Failed to reset password" }
  }
}