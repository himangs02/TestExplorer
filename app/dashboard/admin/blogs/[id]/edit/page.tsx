import BlogForm from '@/components/blogs/blog-form'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // 1. Fetch Blog
  const blog = await prisma.blogs.findUnique({ where: { id } })
  if (!blog) return notFound()

  // 2. Fetch Available Tags
  const tags = await prisma.tags.findMany({ select: { name: true }, orderBy: { name: 'asc' } })
  
  // 3. Fetch The Blog's Author (or fallback to current user if none)
  let authorProfile = null
  if (blog.author_id) {
     authorProfile = await prisma.profiles.findUnique({
       where: { id: blog.author_id },
       select: { id: true, full_name: true }
     })
  } else {
     // Fallback: Current Admin
     const session = await getServerSession(authOptions)
     if (session?.user?.id) {
        authorProfile = await prisma.profiles.findUnique({
          where: { id: session.user.id },
          select: { id: true, full_name: true }
        })
     }
  }

  return (
    <BlogForm 
      blog={blog} 
      availableTags={tags?.map(t => t.name) || []}
      defaultAuthor={authorProfile as any}
    />
  )
}