import BlogForm from '@/components/blogs/blog-form'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function CreateBlogPage() {
  
  // 1. Fetch available tags
  const tags = await prisma.tags.findMany({
    select: { name: true },
    orderBy: { name: 'asc' }
  })
  
  // 2. Fetch Current Logged-in Admin
  const session = await getServerSession(authOptions)
  let currentUserProfile = null

  if (session?.user?.id) {
    const profile = await prisma.profiles.findUnique({
      where: { id: session.user.id },
      select: { id: true, full_name: true }
    })
    currentUserProfile = profile
  }

  return (
    <BlogForm 
      availableTags={tags?.map(t => t.name) || []} 
      defaultAuthor={currentUserProfile as any} // Pass current user
    />
  )
}