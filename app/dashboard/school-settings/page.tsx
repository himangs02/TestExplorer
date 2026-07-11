import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import SchoolSettingsForm from './school-settings-form'

export default async function SchoolSettingsPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user
  
  // 1. Get the admin's organization ID
  const profile = await prisma.profiles.findUnique({
    where: { id: user?.id },
    select: { organization_id: true }
  })

  if (!profile?.organization_id) {
    return <div>Error: You are not linked to a school.</div>
  }

  // 2. Fetch School Details
  const school = await prisma.organizations.findUnique({
    where: { id: profile.organization_id }
  })

  return (
    <div className="max-w-4xl">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-3xl font-bold text-gray-900">School Settings</h2>
        <p className="text-gray-500">Manage your white-label branding and information.</p>
      </div>

      <SchoolSettingsForm 
        school={school} 
        organizationId={profile.organization_id} 
      />
    </div>
  )
}