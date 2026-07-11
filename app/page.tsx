import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import LandingPage from '@/components/Home/LandingPage';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession(authOptions)
  const user = session?.user

  let profile = null;

  if (user) {
    const data = await prisma.profiles.findUnique({
      where: { id: user.id }
    })
    
    // If profile exists, use it. 
    // Fallback only if data is null (shouldn't happen now)
    profile = data || { 
      full_name: user.email?.split('@')[0] || 'Student', 
      role: 'student', 
      organization_id: null // Updated from school_id to match DB
    };
  }

  // Pass user.email explicitly so UserNav can display it
  return <LandingPage />;
}