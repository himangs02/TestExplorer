import { prisma } from "@/lib/prisma";

export async function getSchoolBySubdomain(slug: string) {
  try {
    const school = await prisma.organizations.findUnique({
      where: { slug }
    });
    return school;
  } catch (err) {
    return null;
  }
}