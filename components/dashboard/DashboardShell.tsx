'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import DashboardSidebar from './DashboardSidebar'
import UserNav from '@/components/Navbar/UserNav'

interface DashboardShellProps {
  children: React.ReactNode
  visibleItems: {
    label: string
    href: string
    iconName: string
  }[]
  schoolData: any
  basePath: string
  profile: any
  user: any
}

export default function DashboardShell({
  children,
  visibleItems,
  schoolData,
  basePath,
  profile,
  user,
}: DashboardShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const pathname = usePathname()

  // Auto-close mobile sidebar on navigation
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  return (
    <div className="h-screen flex bg-gray-50/50 antialiased overflow-hidden">
      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:flex w-64 shrink-0 h-full border-r border-gray-200 z-30 flex-col">
        <DashboardSidebar
          visibleItems={visibleItems}
          schoolData={schoolData}
          basePath={basePath}
          profile={profile}
        />
      </div>

      {/* Mobile Drawer Overlay & Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)} 
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <div className="h-16 flex items-center justify-between px-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-sm">
                  TE
                </div>
                <span className="text-lg font-black text-gray-900 tracking-tight">
                  Dashboard
                </span>
              </div>
              <button 
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <DashboardSidebar
                visibleItems={visibleItems}
                schoolData={schoolData}
                basePath={basePath}
                profile={profile}
                isMobileDrawer={true}
                onItemClick={() => setMobileSidebarOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 shrink-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-extrabold text-lg sm:text-xl text-gray-900 tracking-tight">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <UserNav profile={profile} email={user.email} />
          </div>
        </header>

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto overscroll-contain">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
