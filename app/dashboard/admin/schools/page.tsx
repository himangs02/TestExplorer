import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import SchoolsClient from './schools-client'

export const dynamic = 'force-dynamic'

export default async function ManageSchoolsPage() {
  let schools: any[] = []
  let error: string | null = null

  try {
    schools = await prisma.organizations.findMany({
      orderBy: { created_at: 'desc' }
    })
  } catch (err: any) {
    console.error('Failed to fetch schools in ManageSchoolsPage:', err)
    error = 'Unable to load schools at this moment. Please check database connection.'
  }

  const serializedSchools = schools.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    logo_url: s.logo_url,
    created_at: s.created_at ? s.created_at.toISOString() : null,
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Schools</h1>
          <p className="text-gray-500 font-medium">Manage white-labeled clients and partner schools.</p>
        </div>
        <Link 
          href="/dashboard/admin/schools/new" 
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
        >
          <Plus className="w-4 h-4" />
          Add New School
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <SchoolsClient initialSchools={serializedSchools} />
    </div>
  )
}
