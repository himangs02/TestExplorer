const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSubmit() {
  const examId = '594f1e2a-9f3c-477f-b6df-43266e3623de';
  const userId = 'dac21f57-0375-41f7-96cc-da3e48e20bd9'; // super@gmail.com
  
  try {
    const attempt = await prisma.exam_attempts.create({
      data: {
        user_id: userId,
        score: 1,
        total_marks: 2,
        percentage: 50.0,
        time_taken_seconds: 60,
        answers: {},
        exam_id: null, 
        practice_test_id: examId
      }
    });
    console.log("Success:", attempt);
  } catch (error) {
    console.error("Prisma Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testSubmit();
