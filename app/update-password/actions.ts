'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import bcrypt from 'bcryptjs'

export async function updatePassword(password: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.users.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error updating password:', error)
    return { success: false, error: error.message }
  }
}
