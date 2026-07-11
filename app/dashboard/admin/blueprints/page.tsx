import { prisma } from '@/lib/prisma'
import { Database } from 'lucide-react'
import BlueprintModal from '@/components/admin/blueprint-creator' 
import BlueprintDelete from '@/components/admin/blueprint-delete'

export default async function BlueprintPage() {
  // Fetch Courses with their Subjects
  const courses = await prisma.courses.findMany({
    select: {
      id: true,
      title: true,
      subjects: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: { title: 'asc' }
  })

  // Fetch Existing Blueprints
  const blueprints = await prisma.mock_blueprints.findMany({
    include: {
      courses: {
        select: { title: true }
      },
      mock_blueprint_items: {
        select: {
          question_count: true,
          subject_id: true,
          subjects: { select: { title: true } }
        }
      }
    },
    orderBy: { created_at: 'desc' }
  })

  // Format to match expected component props
  const formattedBlueprints = blueprints.map(bp => ({
    ...bp,
    items: bp.mock_blueprint_items
  }))

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Mock Blueprints</h1>
          <p className="text-gray-500">Define criteria. Mocks are auto-generated based on available questions.</p>
        </div>
        {/* CREATE MODE */}
        <BlueprintModal courses={courses || []} />
      </div>

      <div className="grid gap-6">
        {formattedBlueprints?.map((bp) => (
          <div key={bp.id} className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            
            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                   {bp.courses?.title}
                 </span>
                 <h3 className="text-xl font-bold text-gray-900">{bp.title}</h3>
              </div>
              
              <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                <span className="font-medium">⏱ {bp.total_duration_minutes} mins</span>
                <span className="font-medium">🎯 {bp.total_marks} marks</span>
              </div>

              {/* Items List */}
              <div className="mt-4 flex flex-wrap gap-2">
                {bp.items.map((item: any) => (
                  <div key={item.subject_id} className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs flex items-center gap-2">
                    <Database className="w-3 h-3 text-gray-400" />
                    <span className="font-bold text-gray-700">{item.question_count}</span>
                    <span className="text-gray-500">{item.subjects?.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
               {/* Note: Generate button removed as per requirements */}
               
               {/* EDIT MODE */}
               <BlueprintModal courses={courses || []} blueprint={bp} />
               
               {/* DELETE */}
               <BlueprintDelete id={bp.id} title={bp.title} />
            </div>

          </div>
        ))}

        {(!formattedBlueprints || formattedBlueprints.length === 0) && (
          <div className="p-12 text-center text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            No blueprints defined. Click "Create Blueprint" to start.
          </div>
        )}
      </div>
    </div>
  )
}