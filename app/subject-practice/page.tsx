import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import { getCategoryIcon } from '@/lib/icons'

export default async function SubjectPracticePage() {
  // Fetch all categories (streams)
  const categories = await prisma.categories.findMany({
    orderBy: { order_index: 'asc' }
  })

  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-6 py-16">
        
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black text-white text-xs font-bold uppercase tracking-wider mb-6">
            <BookOpen className="w-3 h-3 text-green-400" />
            Subject-Wise Practice
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tighter mb-6 leading-[0.9]">
            Master every <br/><span className="text-green-600">concept.</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-xl">
            First, select your stream to find the perfect practice material tailored for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((cat) => {
            const Icon = getCategoryIcon(cat.icon_key)

            const rawBg = cat.bg_color || 'bg-gray-50'
            const isArbitrary = rawBg.startsWith('bg-[#') && rawBg.endsWith(']')
            const hexColor = isArbitrary ? rawBg.slice(4, -1) : null
            
            const finalClass = hexColor ? '' : rawBg
            const finalStyle = hexColor ? { backgroundColor: hexColor } : undefined

            return (
              <Link 
                key={cat.id} 
                href={`/subject-practice/${cat.id}`}
                className="group relative block"
              >
                <div 
                  className={`
                    relative z-10 h-full p-8 rounded-[2.5rem] border-2 border-black 
                    transition-all duration-300 ease-out
                    group-hover:-translate-y-2 group-hover:translate-x-1 group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                    ${finalClass} 
                  `}
                  style={finalStyle}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-14 h-14 bg-white border-2 border-black rounded-2xl flex items-center justify-center">
                      <Icon className="w-7 h-7 text-black" />
                    </div>
                    <div className="bg-white rounded-full p-3 border-2 border-black transition-transform group-hover:rotate-45">
                      <ArrowUpRight className="w-5 h-5 text-black" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-black text-black mb-2 tracking-tight">
                      {cat.title}
                    </h3>
                    <p className="text-black/70 font-bold text-sm">
                      {cat.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

      </main>
    </div>
  )
}
