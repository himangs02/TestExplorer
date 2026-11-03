'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function signup(formData: FormData) {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string
  const fullName = (formData.get('fullName') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim()
  const address = formData.get('address') as string 
  const stream = (formData.get('stream') as string)?.trim()
  const studentClass = ((formData.get('class') || formData.get('student_class')) as string)?.trim()
  const state = (formData.get('state') as string)?.trim()
  const city = (formData.get('city') as string)?.trim()
  
  const schoolId = (formData.get('schoolId') as string)?.trim()
  const schoolName = (formData.get('schoolName') as string)?.trim()

  // ALL DETAILS MANDATORY VALIDATION
  if (!fullName) {
    return { error: 'Full Name is required.' }
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'A valid Email Address is required.' }
  }
  if (!schoolId && !schoolName) {
    return { error: 'School / Institute is required.' }
  }
  const validClasses = ['8th', '9th', '10th', '11th', '12th']
  if (!studentClass || !validClasses.includes(studentClass)) {
    return { error: 'Please select a valid class (8th, 9th, 10th, 11th, or 12th).' }
  }
  if (!stream) {
    return { error: 'Stream is required.' }
  }
  if (!phone || phone.length < 10) {
    return { error: 'A valid Contact Number (min 10 digits) is required.' }
  }
  if (!state) {
    return { error: 'State is required.' }
  }
  if (!city) {
    return { error: 'City is required.' }
  }
  if (!password || password.length < 8) {
    return { error: 'Password must be at least 8 characters long.' }
  }
  
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
        email: email,
        full_name: fullName,
        phone,
        phone_no: phone,
        role: 'student',
        organization_id: organizationId,
        stream,
        student_class: studentClass,
        class: studentClass,
        school_name: schoolName || null,
        state: state,
        city: city,
      }
    })

    // Grant access to all available subjects/courses by default
    const allSubjects = await prisma.subjects.findMany({
      select: { id: true }
    })

    if (allSubjects.length > 0) {
      await prisma.student_enrollments.createMany({
        data: allSubjects.map((subject) => ({
          user_id: user.id,
          subject_id: subject.id,
        })),
        skipDuplicates: true,
      })
    }

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
