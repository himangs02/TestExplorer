'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// --- DELETE SCHOOL ---
export async function deleteSchoolAction(formData: FormData): Promise<any> {
  const schoolId = formData.get('schoolId') as string

  if (!schoolId) {
    return { error: 'School ID is required.' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Find all profiles belonging to this school
      const schoolProfiles = await tx.profiles.findMany({
        where: { organization_id: schoolId },
        select: { id: true, email: true }
      })

      const profileIds = schoolProfiles.map(p => p.id).filter(Boolean)
      const profileEmails = schoolProfiles.map(p => p.email).filter(Boolean) as string[]

      // 2. Find any matching users in `users` table
      const matchedUsers = await tx.users.findMany({
        where: {
          OR: [
            ...(profileIds.length > 0 ? [{ id: { in: profileIds } }] : []),
            ...(profileEmails.length > 0 ? [{ email: { in: profileEmails } }] : [])
          ]
        },
        select: { id: true }
      })

      const allUserIdsToDelete = Array.from(new Set([...profileIds, ...matchedUsers.map(u => u.id)]))

      if (allUserIdsToDelete.length > 0) {
        // Clean up user-dependent tables
        await tx.student_enrollments.deleteMany({
          where: {
            OR: [
              { user_id: { in: allUserIdsToDelete } },
              { assigned_by: { in: allUserIdsToDelete } }
            ]
          }
        })

        await tx.attempts.deleteMany({
          where: { user_id: { in: allUserIdsToDelete } }
        })

        await tx.exam_attempts.deleteMany({
          where: { user_id: { in: allUserIdsToDelete } }
        })

        await tx.account.deleteMany({
          where: { userId: { in: allUserIdsToDelete } }
        })

        await tx.session.deleteMany({
          where: { userId: { in: allUserIdsToDelete } }
        })

        await tx.blogs.updateMany({
          where: { author_id: { in: allUserIdsToDelete } },
          data: { author_id: null }
        })

        // Delete from profiles
        await tx.profiles.deleteMany({
          where: { id: { in: allUserIdsToDelete } }
        })

        // Delete credentials (email, password) from users table
        await tx.users.deleteMany({
          where: { id: { in: allUserIdsToDelete } }
        })
      }

      // 3. Clean up any remaining profiles linked to this org
      await tx.profiles.deleteMany({
        where: { organization_id: schoolId }
      })

      // 4. Clean up school-specific content
      await tx.contact_messages.deleteMany({
        where: { organization_id: schoolId }
      })

      await tx.school_announcements.deleteMany({
        where: { organization_id: schoolId }
      })

      await tx.school_testimonials.deleteMany({
        where: { organization_id: schoolId }
      })

      // 5. Delete the organization
      await tx.organizations.delete({
        where: { id: schoolId }
      })
    })
  } catch (error: any) {
    console.error('Delete school failed:', error)
    return { error: error.message || 'Failed to delete school.' }
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
  const hero_image_url = (formData.get('hero_image_url') as string)?.trim() || null
  const logo_url = (formData.get('logo_url') as string)?.trim() || null
  const principal_image = (formData.get('principal_image') as string)?.trim() || null
  const principal_message = (formData.get('principal_message') as string)?.trim() || null

  try {
    const updated = await prisma.organizations.update({
      where: { id },
      data: {
        name,
        slug,
        welcome_message,
        hero_image_url: getValidImageUrl(hero_image_url),
        logo_url: getValidImageUrl(logo_url),
        principal_image: getValidImageUrl(principal_image),
        principal_message
      }
    })

    if (updated.slug) {
      revalidatePath(`/${updated.slug}`)
    }
  } catch (error: any) {
    console.error('Update failed:', error)
    return { error: 'Failed to update school.' }
  }

  revalidatePath('/dashboard/admin/schools')
  redirect('/dashboard/admin/schools')
}
