'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

function parseTags(tagString: string): string[] {
  return tagString.split(',').map(t => t.trim()).filter(t => t.length > 0)
}

// Helper to convert file to base64
async function uploadImage(file: File): Promise<string | null> {
  if (!file || file.size === 0) return null

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64Data = buffer.toString('base64')
  
  // Return Data URI format
  return `data:${file.type || 'image/jpeg'};base64,${base64Data}`
}

export async function createBlogAction(formData: FormData) {
  // Basic Info
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const content = formData.get('content') as string
  const category_id = formData.get('category_id') as string
  const tags = parseTags(formData.get('tags') as string)
  const is_featured = formData.get('is_featured') === 'on'
  const is_published = formData.get('is_published') === 'on'

  // SEO & Meta
  const meta_title = formData.get('meta_title') as string
  const meta_description = formData.get('meta_description') as string
  const keywords = parseTags(formData.get('keywords') as string)
  const robots = formData.get('robots') as string
  const canonical_url = formData.get('canonical_url') as string
  
  // Social Media
  const og_title = formData.get('og_title') as string
  const og_description = formData.get('og_description') as string
  
  // Author & Settings
  const author_id = formData.get('author_id') as string
  const enable_structured_data = formData.get('enable_structured_data') === 'on'

  // Image Uploads
  const imageFile = formData.get('image_file') as File
  const ogImageFile = formData.get('og_image_file') as File
  
  let image_url = await uploadImage(imageFile)
  let og_image_url = await uploadImage(ogImageFile)

  // Default placeholder
  if (!image_url) {
    image_url = 'https://images.unsplash.com/photo-1499750310159-5b5f226932b7?auto=format&fit=crop&w=800&q=80' 
  }

  try {
    await prisma.blogs.create({
      data: {
        title, slug, content, category_id, tags: JSON.stringify(tags), is_featured, is_published,
        image_url,
        meta_title, meta_description, keywords: JSON.stringify(keywords), robots, canonical_url,
        og_title, og_description, og_image_url,
        author_id: author_id || null,
        enable_structured_data
      }
    })
  } catch (error: any) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin/blogs')
  revalidatePath('/blogs')
  redirect('/dashboard/admin/blogs')
}

export async function updateBlogAction(formData: FormData) {
  const id = formData.get('id') as string
  
  // Basic Info
  const title = formData.get('title') as string
  const slug = formData.get('slug') as string
  const content = formData.get('content') as string
  const category_id = formData.get('category_id') as string
  const tags = parseTags(formData.get('tags') as string)
  const is_featured = formData.get('is_featured') === 'on'
  const is_published = formData.get('is_published') === 'on'

  // SEO & Meta
  const meta_title = formData.get('meta_title') as string
  const meta_description = formData.get('meta_description') as string
  const keywords = parseTags(formData.get('keywords') as string)
  const robots = formData.get('robots') as string
  const canonical_url = formData.get('canonical_url') as string
  
  // Social Media
  const og_title = formData.get('og_title') as string
  const og_description = formData.get('og_description') as string
  
  // Author & Settings
  const author_id = formData.get('author_id') as string
  const enable_structured_data = formData.get('enable_structured_data') === 'on'

  // Handle Image Uploads
  const imageFile = formData.get('image_file') as File
  const ogImageFile = formData.get('og_image_file') as File
  
  const newImageUrl = await uploadImage(imageFile)
  const newOgImageUrl = await uploadImage(ogImageFile)

  const updateData: any = {
    title, slug, content, category_id, tags: JSON.stringify(tags), is_featured, is_published,
    meta_title, meta_description, keywords: JSON.stringify(keywords), robots, canonical_url,
    og_title, og_description,
    author_id: author_id || null,
    enable_structured_data
  }

  if (newImageUrl) updateData.image_url = newImageUrl
  if (newOgImageUrl) updateData.og_image_url = newOgImageUrl

  try {
    await prisma.blogs.update({
      where: { id },
      data: updateData
    })
  } catch (error: any) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin/blogs')
  revalidatePath('/blogs')
  redirect('/dashboard/admin/blogs')
}

export async function deleteBlogAction(formData: FormData) {
  const id = formData.get('id') as string

  try {
    await prisma.blogs.delete({ where: { id } })
  } catch (error: any) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard/admin/blogs')
  revalidatePath('/blogs')
}