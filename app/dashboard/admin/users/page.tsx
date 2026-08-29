import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Building2, Users, ArrowRight, User } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  // 1. Fetch Organizations (Schools)
  const schools = await prisma.organizations.findMany({
    select: { id: true, name: true, slug: true, logo_url: true },
    orderBy: { name: 'asc' }
  })

  // 2. Fetch Student Counts
  const [individualCount, ...schoolCounts] = await Promise.all([
    prisma.profiles.count({
      where: {
        role: 'student',
        OR: [{ organization_id: null }, { organization_id: '' }]
      }
    }),
    ...schools.map((s) =>
      prisma.profiles.count({
        where: { organization_id: s.id, role: 'student' }
      })
    )
  ])

  const schoolCountMap = new Map(schools.map((s, idx) => [s.id, schoolCounts[idx] || 0]))
  
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
        <p className="text-gray-500 font-medium text-lg">Select a school to manage its students.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* --- Public / Individual Students Card --- */}
        <Link 
          href="/dashboard/admin/users/public"
          className="group relative flex flex-col justify-between p-6 bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                 <User className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">
                {individualCount} {individualCount === 1 ? 'student' : 'students'}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Individual Students</h3>
            <p className="text-sm text-gray-500">Students not enrolled in any organization.</p>
          </div>
          
          <div className="mt-6 flex items-center text-sm font-bold text-gray-400 group-hover:text-black transition-colors">
            View List <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* --- School Cards --- */}
        {schools?.map((school) => {
          const count = schoolCountMap.get(school.id) || 0
          return (
            <Link 
              key={school.id} 
              href={`/dashboard/admin/users/${school.id}`}
              className="group relative flex flex-col justify-between p-6 bg-white border border-gray-200 rounded-3xl shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  {school.logo_url ? (
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                      <img src={school.logo_url} alt={school.name} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Building2 className="w-6 h-6" />
                    </div>
                  )}
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {count} {count === 1 ? 'student' : 'students'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">{school.name}</h3>
                <p className="text-sm text-gray-500">Manage students & enrollments.</p>
              </div>
              
              <div className="mt-6 flex items-center text-sm font-bold text-gray-400 group-hover:text-blue-600 transition-colors">
                View Students <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}

      </div>
    </div>
  )
}