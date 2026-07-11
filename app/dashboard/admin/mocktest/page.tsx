import { prisma } from '@/lib/prisma'
import CategoryAccordion from '@/components/admin/CategoryAccordion'

export default async function AdminMockTestsPage() {
  // 1. Fetch Categories
  const categories = await prisma.categories.findMany({
    orderBy: { title: 'asc' }
  })

  // 2. Fetch Mocks
  const mockTests = await prisma.mock_tests.findMany({
    where: { subject_id: null },
    orderBy: { created_at: 'desc' },
    include: {
      mock_test_questions: {
        select: { id: true }
      },
      courses: {
        select: {
          id: true,
          title: true,
          category_id: true
        }
      }
    }
  })

  // Map to the shape expected by CategoryAccordion
  const formattedMocks = mockTests.map(mock => ({
    ...mock,
    questions: [{ count: mock.mock_test_questions.length }]
  }))

  // 3. Group Mocks by Category
  const mocksByCategoryId: Record<string, any[]> = {}
  
  formattedMocks.forEach((mock) => {
    const catId = mock.courses?.category_id
    if (catId) {
      if (!mocksByCategoryId[catId]) mocksByCategoryId[catId] = []
      mocksByCategoryId[catId].push(mock)
    }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mock Tests Repository</h1>
          <p className="text-gray-500 mt-1">Manage all your generated mock tests here.</p>
        </div>
      </div>

      <div className="space-y-4">
        {categories?.map((category) => {
          const categoryMocks = mocksByCategoryId[category.id] || []
          
          return (
            <CategoryAccordion 
              key={category.id} 
              category={category} 
              mocks={categoryMocks} 
            />
          )
        })}

        {(!categories || categories.length === 0) && (
          <div className="text-center p-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">No Categories Found</h3>
            <p className="text-gray-500">Please create categories (streams) first.</p>
          </div>
        )}
      </div>
    </div>
  )
}