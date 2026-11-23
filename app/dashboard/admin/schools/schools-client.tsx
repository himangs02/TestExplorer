'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Search, 
  X, 
  ArrowUpDown, 
  Building, 
  ExternalLink, 
  Pencil, 
  Plus,
  School
} from 'lucide-react'
import DeleteSchoolButton from './delete-button'

interface SchoolItem {
  id: string
  name: string
  slug: string
  logo_url?: string | null
  created_at?: string | Date | null
}

interface SchoolsClientProps {
  initialSchools: SchoolItem[]
}

export default function SchoolsClient({ initialSchools }: SchoolsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'slug_asc'>('newest')

  // Filter and sort schools
  const filteredAndSortedSchools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    let result = initialSchools.filter((school) => {
      if (!q) return true
      const name = school.name?.toLowerCase() || ''
      const slug = school.slug?.toLowerCase() || ''
      return name.includes(q) || slug.includes(q)
    })

    result = [...result].sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return timeB - timeA
      }
      if (sortBy === 'oldest') {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
        return timeA - timeB
      }
      if (sortBy === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '')
      }
      if (sortBy === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '')
      }
      if (sortBy === 'slug_asc') {
        return (a.slug || '').localeCompare(b.slug || '')
      }
      return 0
    })

    return result
  }, [initialSchools, searchQuery, sortBy])

  if (initialSchools.length === 0) {
    return (
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
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by school name or slug (e.g. 'Child Care', 'ccis')..."
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-sm text-gray-900 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:flex-none">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full sm:w-auto pl-8 pr-8 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-xs font-semibold text-gray-700 rounded-xl border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none cursor-pointer transition-all"
            >
              <option value="newest">Newest Added</option>
              <option value="oldest">Oldest Added</option>
              <option value="name_asc">Name (A → Z)</option>
              <option value="name_desc">Name (Z → A)</option>
              <option value="slug_asc">Slug (A → Z)</option>
            </select>
          </div>

          {/* Counter pill */}
          <span className="hidden md:inline-flex px-3 py-2 text-xs font-bold text-gray-500 bg-gray-100 rounded-xl shrink-0">
            {filteredAndSortedSchools.length} {filteredAndSortedSchools.length === 1 ? 'school' : 'schools'}
          </span>
        </div>
      </div>

      {/* Result Count (mobile or active search) */}
      {searchQuery && (
        <div className="flex items-center justify-between px-1 text-xs text-gray-500">
          <span>
            Found <strong className="text-gray-900 font-bold">{filteredAndSortedSchools.length}</strong> matching{' '}
            {filteredAndSortedSchools.length === 1 ? 'school' : 'schools'} for &ldquo;{searchQuery}&rdquo;
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-blue-600 hover:underline font-bold text-xs"
          >
            Reset filter
          </button>
        </div>
      )}

      {/* Schools List */}
      {filteredAndSortedSchools.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
            <School className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No matching schools found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No school matched &ldquo;{searchQuery}&rdquo;. Try checking the spelling or search by its slug keyword.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAndSortedSchools.map((school) => {
            const formattedDate = school.created_at
              ? new Date(school.created_at).toLocaleDateString()
              : 'Recent'

            return (
              <div 
                key={school.id} 
                className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-400 hover:shadow-xs transition-all"
              >
                {/* School Info */}
                <div className="flex items-center gap-4 min-w-0">
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
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{school.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 font-medium mt-0.5">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide">
                        {school.slug}
                      </span>
                      <span>•</span>
                      <span className="text-xs text-gray-500">{formattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
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
