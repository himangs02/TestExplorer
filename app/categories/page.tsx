import { prisma } from '@/lib/prisma'
import { Suspense } from 'react'
import { Layers, Loader2 } from 'lucide-react'
import CategorySearchExplorer from '@/components/landing/CategorySearchExplorer'

// Cache categories for 5 minutes (ISR)
export const revalidate = 300;

export const metadata = {
  title: 'Explore Streams & Exams | TestExplorer',
  description: 'Search and browse comprehensive mock tests across Engineering, Medical, CUET, Management, and Law.'
}

export default async function CategoriesPage() {
  // 1. Fetch Categories and their published courses
  const categories = await prisma.categories.findMany({
    orderBy: { order_index: 'asc' },
    include: {
      courses: {
        where: { is_published: true },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true
        }
      }
    }
  })

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-6 py-16">
        
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-[11px] font-bold uppercase tracking-wider mb-5">
            <Layers className="w-3 h-3 text-blue-400" />
            Select Your Stream & Exam
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4 leading-[0.95]">
            What are you <br/><span className="text-blue-600">aiming</span> for?
          </h1>
          <p className="text-lg text-gray-500 font-medium max-w-xl">
            Search any exam or select your field to find real NTA pattern mock tests and preparation material tailored for you.
          </p>
        </div>

        <Suspense fallback={
          <div className="p-12 text-center flex items-center justify-center gap-2 text-gray-500 font-bold">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Loading streams and exams...
          </div>
        }>
          <CategorySearchExplorer initialCategories={categories} />
        </Suspense>

      </main>
    </div>
  )
}
