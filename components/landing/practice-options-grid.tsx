import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Category {
  id: string
  title: string
  bg_color?: string | null
  slug?: string | null
}

export default function PracticeOptionsGrid({ categories }: { categories?: Category[] }) {
  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <section className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {categories.map((cat) => {
          const rawBg = cat.bg_color || 'bg-[#e8ec13]'
          const isArbitrary = rawBg.startsWith('bg-[#') && rawBg.endsWith(']')
          const hexColor = isArbitrary ? rawBg.slice(4, -1) : null
          const finalClass = hexColor ? '' : rawBg
          const finalStyle = hexColor ? { backgroundColor: hexColor } : undefined

          return (
            <Link 
              key={cat.id} 
              href={`/categories/${cat.id}`}
              className="group relative block w-full" 
            >
              <div 
                className={`
                  relative z-10 h-44 sm:h-48 px-4 py-5 rounded-2xl md:rounded-3xl border-2 border-black flex items-center flex-col justify-between
                  transition-all duration-300 ease-out
                  group-hover:-translate-y-1.5 group-hover:translate-x-1 group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                  ${finalClass}
                `}
                style={finalStyle}
              >
                <div className="w-full flex-1 flex items-center justify-center">
                  <h3 className="text-xl md:text-2xl font-black text-black tracking-tight text-center leading-tight">
                    {cat.title}
                  </h3>
                </div>

                <div className="rounded-full text-xs font-bold border-2 border-black bg-white text-black px-4 py-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 group-hover:bg-black group-hover:text-white transition-all shadow-xs">
                  <span>Take Mock Test</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}


