'use server'

import { prisma } from '@/lib/prisma'

export async function searchSchools(query: string) {
  try {
    if (!query || query.length < 2) return [];

    const schools = await prisma.organizations.findMany({
      where: {
        name: {
          contains: query
        }
      },
      select: {
        id: true,
        name: true
      },
      take: 5
    });

    return schools;
  } catch (error) {
    console.error('Error searching schools:', error);
    return [];
  }
}
