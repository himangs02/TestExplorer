// lib/learning-tier.ts

export type LearningTierId = 'FOUNDATION' | 'PROFICIENT' | 'ADVANCED'

export interface LearningTierInfo {
  tierId: LearningTierId
  title: string
  badgeText: string
  color: 'amber' | 'blue' | 'emerald'
  currentScore: number // 0 to 100
  targetScore: number
  progressToNext: number // 0 to 100
  statusMessage: string
  recommendedStrategy: string
  unlockedFeatures: string[]
  nextLevelMessage: string
}

/**
 * Calculates a student's learning tier based on their completed exam/practice attempts.
 * Rule:
 *  - Score < 60%: Foundation Booster (Strengthen core concepts, 1-step and direct formulas)
 *  - Score 60% - 85%: Concept Master (2-step application problems, progressive difficulty)
 *  - Score > 85%: Olympiad & Challenger (3+ step HOTS, multi-concept synthesis)
 */
export function calculateLearningTier(completedAttempts: any[] = []): LearningTierInfo {
  const safeAttempts = Array.isArray(completedAttempts) ? completedAttempts : []
  const validAttempts = safeAttempts.filter(a => a.status === 'completed' || a.score != null)
  
  // Calculate average accuracy/score percentage
  let avgPercentage = 0
  if (validAttempts.length > 0) {
    const sumPercentage = validAttempts.reduce((acc, curr) => {
      // Prioritize percentage (accuracy), fallback to score / total_marks
      if (curr.percentage != null && !isNaN(Number(curr.percentage))) {
        return acc + Number(curr.percentage)
      }
      const score = Number(curr.score) || 0
      const totalMarks = Number(curr.total_marks) || 120
      return acc + (totalMarks > 0 ? (score / totalMarks) * 100 : 0)
    }, 0)
    avgPercentage = Math.round(sumPercentage / validAttempts.length)
  }

  // If student has taken 0 tests, start them in Foundation Booster with a warm welcome
  if (validAttempts.length === 0) {
    return {
      tierId: 'FOUNDATION',
      title: 'Foundation Level (Getting Started)',
      badgeText: 'New Learner',
      color: 'amber',
      currentScore: 0,
      targetScore: 60,
      progressToNext: 0,
      statusMessage: 'Take your first mock or practice set to benchmark your concept strengths.',
      recommendedStrategy: 'Start with 1-step foundation questions to build speed and accuracy.',
      unlockedFeatures: [
        'Curated 1-step formula and definition questions',
        'Step-by-step detailed solution guides',
        'Personal concept diagnostics'
      ],
      nextLevelMessage: 'Score 60% or higher to unlock Advanced Multi-Step Challenges!'
    }
  }

  if (avgPercentage < 60) {
    const progress = Math.min(100, Math.max(5, Math.round((avgPercentage / 60) * 100)))
    const needed = 60 - avgPercentage
    return {
      tierId: 'FOUNDATION',
      title: 'Foundation Booster Mode',
      badgeText: 'Level 1: Core Concepts',
      color: 'amber',
      currentScore: avgPercentage,
      targetScore: 60,
      progressToNext: progress,
      statusMessage: `Current Mastery: ${avgPercentage}%. You are building your core conceptual base.`,
      recommendedStrategy: 'Focus on mastering formula application and basic 1-step problems before jumping to multi-step questions.',
      unlockedFeatures: [
        'Scaffolded questions prioritizing easy and medium concepts',
        'Step-by-step solution breakdown on every question',
        'Formula & definition review notes'
      ],
      nextLevelMessage: `Earn ${needed}% more accuracy to unlock Level 2: Concept Master & Multi-Step Problems!`
    }
  } else if (avgPercentage <= 85) {
    const progress = Math.min(100, Math.max(5, Math.round(((avgPercentage - 60) / 25) * 100)))
    const needed = 86 - avgPercentage
    return {
      tierId: 'PROFICIENT',
      title: 'Concept Master Mode',
      badgeText: 'Level 2: Proficient',
      color: 'blue',
      currentScore: avgPercentage,
      targetScore: 85,
      progressToNext: progress,
      statusMessage: `Great job! Your mastery is ${avgPercentage}%. You have a solid grasp on core concepts.`,
      recommendedStrategy: 'Practice 2-step synthesis questions and timed mock tests to sharpen your problem-solving speed.',
      unlockedFeatures: [
        'Multi-step application questions unlocked',
        'Full syllabus competitive mock tests',
        'Speed & time-pressure performance diagnostics'
      ],
      nextLevelMessage: `Reach 85%+ accuracy to achieve Level 3: Olympiad & Challenger Status!`
    }
  } else {
    return {
      tierId: 'ADVANCED',
      title: 'Olympiad & Challenger Mode',
      badgeText: 'Level 3: Top Ranker',
      color: 'emerald',
      currentScore: avgPercentage,
      targetScore: 100,
      progressToNext: 100,
      statusMessage: `Outstanding performance! Average accuracy: ${avgPercentage}%. You are performing in the top percentile!`,
      recommendedStrategy: 'Tackle Higher Order Thinking Skills (HOTS), multi-concept problems, and Olympiad/NTSE previous year questions.',
      unlockedFeatures: [
        'HOTS & Multi-concept questions unlocked',
        'All India Rank (AIR) precision benchmarks',
        'Elite challenge sets'
      ],
      nextLevelMessage: 'You have unlocked the highest level! Maintain your streak to stay at the top.'
    }
  }
}
