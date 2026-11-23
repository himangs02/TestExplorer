// lib/adaptive-difficulty.ts

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

export interface AdaptiveTrackInfo {
  trackId: 'foundation' | 'advanced'
  trackName: string
  trackDescription: string
  badgeText: string
  isFoundation: boolean
}

/**
 * Given a student's average accuracy (0 to 100) or test history, determines the adaptive difficulty track.
 * Rule:
 *  - Average accuracy < 60% (or no attempts): Foundation Track (Easy/1-Step -> Medium/2-Step -> Hard/Multi-Step)
 *  - Average accuracy >= 60%: Advanced Challenge Track (Hard/Multi-step -> Medium -> Easy)
 */
export function getAdaptiveTrack(avgAccuracy: number): AdaptiveTrackInfo {
  const isFoundation = avgAccuracy < 60

  if (isFoundation) {
    return {
      trackId: 'foundation',
      trackName: 'Foundation Step-by-Step Track',
      trackDescription: 'Questions are sequenced from 1-step core formulas and definitions to multi-step problem solving.',
      badgeText: 'Foundation (1-Step → Multi-Step)',
      isFoundation: true
    }
  }

  return {
    trackId: 'advanced',
    trackName: 'Advanced Challenge Track',
    trackDescription: 'Questions prioritize higher-order thinking skills (HOTS), multi-concept synthesis, and exam-level problems.',
    badgeText: 'Advanced (Multi-Step Challenge)',
    isFoundation: false
  }
}

/**
 * Reorders questions adaptively based on the student's mastery level:
 * - Foundation (< 60%): Easy -> Medium -> Hard -> Unclassified
 * - Advanced (>= 60%): Hard -> Medium -> Easy -> Unclassified
 */
export function orderQuestionsAdaptively<T extends { difficulty?: string | null }>(
  questions: T[],
  avgAccuracy: number
): { orderedQuestions: T[]; track: AdaptiveTrackInfo } {
  const track = getAdaptiveTrack(avgAccuracy)

  if (!questions || questions.length === 0) {
    return { orderedQuestions: [], track }
  }

  const easy: T[] = []
  const medium: T[] = []
  const hard: T[] = []
  const unclassified: T[] = []

  for (const q of questions) {
    const diff = q.difficulty?.trim().toLowerCase()
    if (diff === 'easy') {
      easy.push(q)
    } else if (diff === 'medium') {
      medium.push(q)
    } else if (diff === 'hard') {
      hard.push(q)
    } else {
      unclassified.push(q)
    }
  }

  let orderedQuestions: T[] = []

  if (track.isFoundation) {
    // Scaffolded: Easy -> Medium -> Unclassified -> Hard
    orderedQuestions = [...easy, ...medium, ...unclassified, ...hard]
  } else {
    // Challenging: Hard -> Medium -> Easy -> Unclassified
    orderedQuestions = [...hard, ...medium, ...easy, ...unclassified]
  }

  return { orderedQuestions, track }
}

/**
 * Helper to get human-readable badge text and styling for a specific question's difficulty
 */
export function getDifficultyBadge(difficulty?: string | null): {
  label: string
  sublabel: string
  colorClass: string
  bgClass: string
  borderClass: string
} {
  const diff = difficulty?.trim().toLowerCase()

  if (diff === 'easy') {
    return {
      label: 'Easy',
      sublabel: '1-Step Concept',
      colorClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-200'
    }
  }

  if (diff === 'hard') {
    return {
      label: 'Hard',
      sublabel: 'Multi-Step HOTS',
      colorClass: 'text-purple-700',
      bgClass: 'bg-purple-50',
      borderClass: 'border-purple-200'
    }
  }

  // Default to medium
  return {
    label: 'Medium',
    sublabel: '2-Step Application',
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200'
  }
}
