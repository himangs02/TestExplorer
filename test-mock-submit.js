const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const examId = "0b46e92d-7d39-4f6c-b12a-ad7e8746b82f"; // Political Science Mock 3
  
  const mockQs = await prisma.mock_test_questions.findMany({
      where: { mock_test_id: examId },
      select: {
        questions: { select: { id: true, question_options: { select: { id: true, is_correct: true } } } }
      }
  })
  
  const questions = mockQs.map(m => m.questions);
  console.log("Questions array length:", questions.length);
  if(questions.length > 0) {
      console.log("First question has options:", !!questions[0].question_options);
  }
}
main().finally(()=>prisma.$disconnect());
