import Link from 'next/link'
import { ArrowRight, BookOpen, PenTool } from 'lucide-react'
import { Button } from "@/components/ui/button"

export default function PracticeOptionsGrid() {
  const options = [
    {
      id: 'mock-test',
      title: 'Practice for Mock Test',
      description: 'Take full-length mock exams designed to simulate the real test environment.',
      bg_color: 'bg-[#d6f722]', // Keeping the vibrant yellow-green style
      icon: PenTool,
      link: '/categories' // Or wherever the mock tests are listed
    },
    {
      id: 'subject-wise',
      title: 'Practice Subject Wise',
      description: 'Focus on specific subjects and chapters to master individual concepts.',
      bg_color: 'bg-[#84eb21]', // Vibrant green style
      icon: BookOpen,
      link: '/subject-practice' // Or wherever the subject practice is listed
    }
  ]

  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 container mx-auto py-12 px-4">
      {options.map((opt) => {
        const Icon = opt.icon

        return (
          <Link 
            key={opt.id} 
            href={opt.link}
            className="group relative block text-left w-full max-w-sm" 
          >
            <div 
              className={`
                relative z-10 h-64 px-6 py-8 rounded-[2.5rem] border-2 border-black flex items-center flex-col space-y-6 justify-center
                transition-all duration-300 ease-out
                group-hover:-translate-y-2 group-hover:translate-x-1 group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
              `}
              style={{ backgroundColor: opt.bg_color.replace('bg-[', '').replace(']', '') }}
            >
              <div className='text-center space-y-3 px-2'>
                <div className="mx-auto w-12 h-12 bg-white/50 rounded-full flex items-center justify-center border-2 border-black/10 mb-4">
                   <Icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-black text-black tracking-tight leading-tight">
                  {opt.title}
                </h3>
                <p className="text-black/70 font-bold text-sm line-clamp-2">
                  {opt.description}
                </p>
              </div>

              <Button variant="outline" className='rounded-full text-sm font-bold border-black bg-white hover:bg-black hover:text-white transition-colors h-10 px-6'>
                Start Practicing <ArrowRight className='w-4 h-4 ml-2'/>
              </Button>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
