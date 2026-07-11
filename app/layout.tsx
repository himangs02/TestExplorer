import { headers } from "next/headers";
import { getSchoolBySubdomain } from "@/lib/db/school"; 
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

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

  // 2. ROBUST SUBDOMAIN DETECTION
  const headersList = await headers();
  const domain = headersList.get("x-current-domain") || headersList.get("host") || "";
  const hostname = headersList.get("host") || "";
  
  let schoolData = null;
  let subdomain = null;

  // Split hostname into parts
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
      console.error("Failed to fetch school data in RootLayout:", err);
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
          />
          <main>{children}</main>
          <Toaster />
        </NextAuthProvider>
      </body>
    </html>
  );
}
