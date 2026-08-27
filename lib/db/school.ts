import { prisma } from "@/lib/prisma";
import { headers, cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSchoolBySubdomain(slug: string) {
  try {
    const school = await prisma.organizations.findUnique({
      where: { slug }
    });
    return school;
  } catch (err) {
    console.error("Database error in getSchoolBySubdomain:", err);
    return null;
  }
}

export async function getCurrentSchool() {
  try {
    const session = await getServerSession(authOptions);
    let profile = null;
    if (session?.user?.id) {
      profile = await prisma.profiles.findUnique({
        where: { id: session.user.id },
        select: { organization_id: true, role: true }
      });
    }

    // 1. Check path slug first (highest priority, e.g. /gvmps or /gvmps/about)
    const headersList = await headers();
    const currentPath = headersList.get("x-current-path") || "";
    const host = headersList.get("x-current-domain") || headersList.get("host") || "";

    const reservedPaths = [
      'about', 'contact', 'login', 'signup', 'dashboard', 'api', 'categories', 
      'courses', 'exams', 'mocktest', 'forgot-password', 'reset-password', 'auth', 
      'streams', 'blogs', 'complete-profile', 'cookie-policy', 'faqs', 
      'getting-started', 'library', 'privacy', 'profile', 'security', 'terms', 
      'update-password', '_next', 'subject-practice'
    ];

    const segments = currentPath.split('/').filter(Boolean);
    const potentialSlug = segments.length > 0 ? segments[0] : null;

    if (potentialSlug && !reservedPaths.includes(potentialSlug)) {
      const school = await getSchoolBySubdomain(potentialSlug);
      if (school) return school;
    }

    // 2. Check subdomain (e.g. gvmps.testexplorer.in)
    if (host) {
      const hostname = host.split(':')[0];
      const mainDomains = ['localhost', 'testexplorer.in', 'testexplorer.com', 'test-explorer1.vercel.app'];
      const isMainDomain = mainDomains.includes(hostname) || hostname.startsWith('www.');
      if (!isMainDomain) {
        const subdomain = hostname.split('.')[0];
        if (subdomain && !reservedPaths.includes(subdomain)) {
          const school = await getSchoolBySubdomain(subdomain);
          if (school) return school;
        }
      }
    }

    // 3. If user is logged in as a school student/admin (non-super_admin) with an assigned organization
    if (profile?.role !== 'super_admin' && profile?.organization_id) {
      const school = await prisma.organizations.findUnique({
        where: { id: profile.organization_id }
      });
      if (school) return school;
    }

    return null;
  } catch (err) {
    console.error("Error in getCurrentSchool:", err);
    return null;
  }
}