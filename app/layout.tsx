import { headers, cookies } from "next/headers";
import { getSchoolBySubdomain } from "@/lib/db/school"; 
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Explorer",
  description: "Your learning journey starts here.",
  icons: {
    icon: "/favicon.ico", 
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  let profile = null;
  if (user?.id) {
    try {
      profile = await prisma.profiles.findUnique({ where: { id: user.id } });
    } catch (err) {
      console.error("Failed to fetch user profile in RootLayout:", err);
    }
  }

  const headersList = await headers();
  const currentPath = headersList.get("x-current-path") || "";
  const cookieStore = await cookies();
  const cookieSlug = cookieStore.get("school_slug")?.value;
  
  let schoolData = null;
  let schoolSlug = null;

  // Reserved paths that are NOT school slugs
  const reservedPaths = [
    'about', 'contact', 'login', 'signup', 'dashboard', 'api', 'categories', 
    'courses', 'exams', 'mocktest', 'forgot-password', 'reset-password', 'auth', 
    'streams', 'blogs', 'complete-profile', 'cookie-policy', 'faqs', 
    'getting-started', 'library', 'privacy', 'profile', 'security', 'terms', 
    'update-password', '_next', 'subject-practice'
  ];

  const segments = currentPath.split('/').filter(Boolean);
  const potentialSlug = segments.length > 0 ? segments[0] : null;
  const isSchoolSlugInPath = potentialSlug && !reservedPaths.includes(potentialSlug);

  // 1. Check if explicitly visiting a school slug in URL path (e.g. /gvmps or /gvmps/about)
  if (isSchoolSlugInPath) {
    try {
      schoolData = await prisma.organizations.findUnique({ where: { slug: potentialSlug } });
      if (schoolData) schoolSlug = potentialSlug;
    } catch (err) {
      console.error("Failed to fetch school data from path in RootLayout:", err);
    }
  } 
  // 2. If user is logged in and belongs to an organization (only for students, teachers, school admins - NOT super_admin)
  else if (profile?.organization_id && profile?.role !== 'super_admin') {
    try {
      schoolData = await prisma.organizations.findUnique({ where: { id: profile.organization_id } });
      if (schoolData) schoolSlug = schoolData.slug;
    } catch (err) {
      console.error("Failed to fetch school data from profile in RootLayout:", err);
    }
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 font-sans antialiased" suppressHydrationWarning>
        <NextAuthProvider>
          <SiteHeader 
            school={schoolData} 
            user={user} 
            profile={profile}
            schoolSlug={schoolSlug} 
          />
          <main>{children}</main>
          <Toaster />
        </NextAuthProvider>
      </body>
    </html>
  );
}
