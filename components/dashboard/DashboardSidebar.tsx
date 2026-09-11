'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, BookOpen, Settings, Users, FileText, Building2, 
  TagIcon, Megaphone, GraduationCap, Newspaper, Trophy, Map, Pen, BarChart3, Globe, Database, Mail, 
} from 'lucide-react'

// Map string names to actual components
const IconMap: Record<string, any> = {
  LayoutDashboard,
  BookOpen,
  Settings,
  Users,
  FileText,
  Building2,
  TagIcon,
  Megaphone,
  GraduationCap,
  Newspaper,
  Trophy,
  Map,
  Pen,
  BarChart3,
  Globe,
  Database,
  Mail,
}

interface SidebarProps {
  visibleItems: {
    label: string
    href: string
    iconName: string
  }[]
  schoolData: any
  basePath: string
  profile: any
  isMobileDrawer?: boolean
  onItemClick?: () => void
}

export default function DashboardSidebar({ 
  visibleItems, 
  schoolData, 
  basePath, 
  profile,
  isMobileDrawer = false,
  onItemClick
}: SidebarProps) {
  const pathname = usePathname()

  useEffect(() => {
    toast.dismiss()
  }, [pathname])

  return (
    <aside className="w-full h-full bg-white flex flex-col">
      
      {/* BRANDING (Only show on desktop sidebar since drawer has its own header) */}
      {!isMobileDrawer && (
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          {schoolData ? (
            <Link href={`${basePath}/`} className="flex items-center gap-3 group">
              {schoolData.logo_url ? (
                <div className="w-8 h-8 relative shrink-0">
                  <img 
                    src={schoolData.logo_url} 
                    alt={schoolData.name} 
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                  {schoolData.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                {schoolData.name}
              </span>
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                TE
              </div>
              <span className="text-xl font-black tracking-tighter text-blue-600">
                Test Explorer
              </span>
            </Link>
          )}
        </div>
      )}
      
      {/* NAV LINKS */}
      <nav className="flex-1 p-3.5 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href
          
          // ✅ FIX: Resolve the icon from the map using the string name
          const IconComponent = IconMap[item.iconName] || LayoutDashboard 
          
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              onClick={onItemClick}
              className={`
                flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors group
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 font-bold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <IconComponent 
                className={`w-4.5 h-4.5 transition-colors shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} 
              />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* USER FOOTER */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
            profile.role === 'super_admin' ? 'bg-purple-600' : 
            profile.role === 'school_admin' ? 'bg-black' : 'bg-blue-600'
          }`}>
            {profile.full_name ? profile.full_name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-900 truncate">{profile.full_name}</p>
            <p className="text-xs text-gray-500 capitalize truncate">
              {profile.role.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}