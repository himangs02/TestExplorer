import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Plus, Building, ExternalLink, Pencil } from 'lucide-react'
import DeleteSchoolButton from './delete-button'

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

      {schools.length === 0 && !error ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No schools yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Onboard your first white-labeled school or institute to get started.
          </p>
          <Link
            href="/dashboard/admin/schools/new"
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all"
          >
            <Plus className="w-4 h-4" /> Add School
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {schools.map((school) => {
            const formattedDate = school.created_at
              ? new Date(school.created_at).toLocaleDateString()
              : 'Recent'

            return (
              <div 
                key={school.id} 
                className="bg-white p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-400 transition-all"
              >
                {/* School Info */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden shrink-0">
                    {school.logo_url ? (
                      <img 
                        src={school.logo_url} 
                        alt={school.name} 
                        className="w-full h-full object-contain p-1" 
                      />
                    ) : (
                      <Building className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{school.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mt-0.5">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                        {school.slug}
                      </span>
                      <span>•</span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-1.5">
                  {/* 1. Visit Site */}
                  <a 
                    href={`/${school.slug}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Visit Live Site"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>

                  {/* 2. Edit Button */}
                  <Link
                    href={`/dashboard/admin/schools/${school.id}/edit`}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit Settings"
                  >
                    <Pencil className="w-5 h-5" />
                  </Link>

                  {/* 3. Delete Action */}
                  <DeleteSchoolButton schoolId={school.id} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}