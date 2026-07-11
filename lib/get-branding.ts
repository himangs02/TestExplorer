import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function getBranding() {
  const headersList = await headers()
  const host = headersList.get('host') || ''

  // 1. Define Main Domains (Where "Test Explorer" should show)
  const mainDomains = ['localhost:3000', 'testexplorer.com', 'test-explorer1.vercel.app']
  
  // 2. Default Branding
  let branding = {
    name: 'Test Explorer',
    logoLetter: 'T',
    isSchool: false,
    logo: null as string | null
  }

  // 3. Check if Subdomain
  const isMainDomain = mainDomains.includes(host) || host.startsWith('www.')
  
  if (!isMainDomain) {
    const subdomain = host.split('.')[0]
    
    // Fetch School Details
    const school = await prisma.organizations.findUnique({
      where: { slug: subdomain }
    })

    if (school) {
      branding = {
        name: school.name,
        logoLetter: school.name[0],
        logo: school.logo_url,
        isSchool: true
      }
    }
  }

  return branding
}