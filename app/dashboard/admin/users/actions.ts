'use server'

import { prisma } from '@/lib/prisma'

export async function getStudentEnrollments(studentId: string) {
  try {
    const enrollments = await prisma.student_enrollments.findMany({
      where: { user_id: studentId },
      select: { subject_id: true }
    });
    return { success: true, data: enrollments.map(e => e.subject_id) };
  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    return { success: false, error: error.message };
  }
}

export async function updateStudentEnrollments(studentId: string, subjectIds: string[]) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete existing enrollments
      await tx.student_enrollments.deleteMany({
        where: { user_id: studentId }
      });

      // 2. Insert new enrollments
      if (subjectIds.length > 0) {
        const inserts = subjectIds.map(subject_id => ({
          user_id: studentId,
          subject_id
        }));
        await tx.student_enrollments.createMany({
          data: inserts
        });
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating enrollments:', error);
    return { success: false, error: error.message };
  }
}
