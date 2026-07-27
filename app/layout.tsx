import { headers } from "next/headers";
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
  
  let schoolData = null;
  let schoolSlug = null;

  // Reserved paths that are NOT school slugs
  const reservedPaths = ['about', 'contact', 'login', 'signup', 'dashboard', 'api', 'categories', 'courses', 'exams', 'mocktest', 'forgot-password', 'reset-password', 'auth', 'streams', 'blogs', 'complete-profile', 'cookie-policy', 'faqs', 'getting-started', 'library', 'privacy', 'profile', 'security', 'terms', 'update-password'];

  // First check if user is logged in and has an organization
  if (profile?.organization_id) {
    try {
      schoolData = await prisma.organizations.findUnique({ where: { id: profile.organization_id } });
      if (schoolData) schoolSlug = schoolData.slug;
    } catch (err) {
      console.error("Failed to fetch school data from profile in RootLayout:", err);
    }
  } 
  // If not logged in, try to get school from the URL path slug
  else {
    const segments = currentPath.split('/').filter(Boolean);
    const potentialSlug = segments.length > 0 ? segments[0] : null;
    
    if (potentialSlug && !reservedPaths.includes(potentialSlug)) {
      try {
        schoolData = await prisma.organizations.findUnique({ where: { slug: potentialSlug } });
        if (schoolData) schoolSlug = potentialSlug;
      } catch (err) {
        console.error("Failed to fetch school data from path in RootLayout:", err);
      }
    }
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 font-sans antialiased" suppressHydrationWarning={true}>
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
