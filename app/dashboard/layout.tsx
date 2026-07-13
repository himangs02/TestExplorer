import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getSchoolBySubdomain } from '@/lib/db/school'
import UserNav from '@/components/Navbar/UserNav' 
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  const user = session?.user
  
  if (!user) return redirect('/login')

  let profile = null;
  if (user?.id) {
    try {
      profile = await prisma.profiles.findUnique({ where: { id: user.id } });
    } catch (err) {
      console.error("Failed to fetch user profile in DashboardLayout:", err);
    }
  }

  if (!profile) return redirect('/complete-profile')

  const headersList = await headers()
  const domain = headersList.get("x-current-domain") || headersList.get("host") || "";
  
  let schoolData = null;
  let subdomain = null;

  if (domain.includes("localhost")) {
    const parts = domain.split(".");
    if (parts.length >= 2) {
      subdomain = parts[0];
    }
  } else {
    const parts = domain.split(".");
    if (parts.length >= 3) {
      subdomain = parts[0];
    }
  }

  if (subdomain && subdomain !== "www" && subdomain !== "test-explorer") {
    try {
      schoolData = await getSchoolBySubdomain(subdomain);
    } catch (err) {
      console.error("Failed to fetch school data in DashboardLayout:", err);
    }
  }

  const basePath = ""

  const rawNavItems = [
    { label: 'My Stats', href: '/dashboard', iconName: 'LayoutDashboard', roles: ['student'] },
    { label: 'My Courses', href: '/dashboard/my-courses', iconName: 'GraduationCap', roles: ['student'] },
    { label: 'My Exams', href: '/dashboard/exams', iconName: 'FileText', roles: ['student'] },

    { label: 'Overview', href: '/dashboard', iconName: 'LayoutDashboard', roles: ['school_admin'] },
    { label: 'School Settings', href: '/dashboard/school-settings', iconName: 'Settings', roles: ['school_admin'] },
    { label: 'My Students', href: '/dashboard/students', iconName: 'Users', roles: ['school_admin'] },
    { label: 'Announcements', href: '/dashboard/announcements', iconName: 'Megaphone', roles: ['school_admin'] },
    { label: 'Leaderboard', href: '/dashboard/leaderboard', iconName: 'Trophy', roles: ['school_admin'] },
    {label: 'Testimonials', href: '/dashboard/testimonials', iconName: 'MessageSquare', roles: ['school_admin'] },

    { label: 'Overview', href: '/dashboard/admin', iconName: 'LayoutDashboard', roles: ['super_admin'] },
    { label: 'Schools', href: '/dashboard/admin/schools', iconName: 'Building2', roles: ['super_admin'] },
    { label: 'Streams', href: '/dashboard/admin/streams', iconName: 'Layers', roles: ['super_admin'] },
    { label: 'Mock Blueprints', href: '/dashboard/admin/blueprints', iconName: 'Map', roles: ['super_admin'] },
    { label: 'Mock Tests', href: '/dashboard/admin/mocktest', iconName: 'Pen', roles: ['super_admin'] },
    { label: 'Manage Content', href: '/dashboard/admin/manage-content', iconName: 'BookOpen', roles: ['super_admin'] },
    { label: 'Courses', href: '/dashboard/admin/courses', iconName: 'FileText', roles: ['super_admin'] },
    { label: 'Exams', href: '/dashboard/admin/exams', iconName: 'FileText', roles: ['super_admin'] },
    { label: 'Question Pool', href: '/dashboard/admin/question-uploads', iconName: 'Database', roles: ['super_admin'] },
    { label: 'Subjects', href: '/dashboard/admin/subjects', iconName: 'Library', roles: ['super_admin'] },
    { label: 'Users', href: '/dashboard/admin/users', iconName: 'Users', roles: ['super_admin'] },
    { label: 'Tags', href: '/dashboard/admin/tags', iconName: 'TagIcon', roles: ['super_admin'] },
    { label: 'Blogs', href: '/dashboard/admin/blogs', iconName: 'Newspaper', roles: ['super_admin'] },
    { label: 'Leaderboard', href: '/dashboard/admin/leaderboard', iconName: 'Trophy', roles: ['super_admin'] },
    { label: 'Rank Config', href: '/dashboard/admin/rank-prediction', iconName: 'BarChart3', roles: ['super_admin'] },
    { label: 'Exam Landing Pages', href: '/dashboard/admin/exam-landing-pages', iconName: 'Globe', roles: ['super_admin'] },
    { label: 'Messages', href: '/dashboard/admin/messages', iconName: 'Mail', roles: ['super_admin'] },
  ]

  const visibleItems = rawNavItems
    .filter(item => item.roles.includes(profile.role || 'student'))
    .map(item => ({
      ...item,
      href: `${basePath}${item.href}`
    }))

  return (
    <div className="min-h-screen flex bg-gray-50">
      <DashboardSidebar 
        visibleItems={visibleItems}
        schoolData={schoolData}
        basePath={basePath}
        profile={profile as any}
      />
      <main className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between px-4 md:px-8">
          <h1 className="font-bold text-lg text-gray-800">Dashboard</h1>
          <UserNav profile={profile as any} email={user.email || undefined} />
        </header>
        <div className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
