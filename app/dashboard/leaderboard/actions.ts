'use server'

import { prisma } from '@/lib/prisma'

export async function getSubjectsForCourse(courseId: string) {
  try {
    const subjects = await prisma.subjects.findMany({
      where: { course_id: courseId },
      select: { id: true, title: true },
      orderBy: { title: 'asc' }
    })
    return { data: subjects }
  } catch (error: any) {
    console.error('Error fetching subjects:', error)
    return { error: error.message }
  }
}

export async function getLeaderboard(subjectId: string, schoolId: string | null) {
  try {
    // 1. Fetch attempts for exams linked to this subject
    // In Prisma, we need a complex query to aggregate attempts by user
    // We can use a raw query or fetch attempts and aggregate in JS
    
    // We want attempts for exams where subject_id = subjectId OR practice_tests where subject_id = subjectId
    
    const attempts = await prisma.exam_attempts.findMany({
      where: {
        OR: [
          { exams: { subject_id: subjectId } },
          { practice_tests: { subject_id: subjectId } },
          { mock_tests: { subject_id: subjectId } }
        ],
        // Optionally filter by schoolId if provided
        ...(schoolId ? { users: { attempts: { some: { users: { attempts: undefined } } } } } : {}) // This is getting complex, let's filter after fetching or use raw query
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })
    
    // Since profile has the organization_id, we should fetch users with their profiles
    const profiles = await prisma.profiles.findMany({
      where: {
        ...(schoolId ? { organization_id: schoolId } : {})
      },
      include: {
        organizations: {
          select: { name: true }
        }
      }
    })
    
    const profileMap = new Map(profiles.map(p => [p.id, p]))

    // Aggregate data
    const userStats = new Map()
    
    for (const attempt of attempts) {
      const p = profileMap.get(attempt.user_id)
      
      // If we are filtering by school, and user is not in school, skip
      if (schoolId && (!p || p.organization_id !== schoolId)) {
        continue
      }
      
      if (!userStats.has(attempt.user_id)) {
        userStats.set(attempt.user_id, {
          student_id: attempt.user_id,
          student_name: p?.full_name || attempt.users?.name || 'Unknown',
          school_name: p?.organizations?.name || null,
          total_score: 0,
          tests_taken: 0,
          total_percentage: 0
        })
      }
      
      const stats = userStats.get(attempt.user_id)
      stats.total_score += (attempt.score || 0)
      stats.tests_taken += 1
      stats.total_percentage += Number(attempt.percentage || 0)
    }

    const leaderboard = Array.from(userStats.values()).map(stats => ({
      ...stats,
      avg_percentage: Math.round(stats.total_percentage / stats.tests_taken)
    })).sort((a, b) => b.total_score - a.total_score)
    
    return { data: leaderboard }
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error)
    return { error: error.message }
  }
}
