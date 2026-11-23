// lib/student-motivation.ts

export interface DayActivity {
  dayLabel: string // 'M', 'T', 'W', etc.
  dateStr: string // 'YYYY-MM-DD'
  isActive: boolean
  isToday: boolean
}

export interface AchievementBadge {
  id: string
  title: string
  description: string
  iconName: 'Target' | 'Zap' | 'Award' | 'Flame' | 'Trophy' | 'Sparkles' | 'BookOpen' | 'CheckCircle'
  category: 'tests' | 'accuracy' | 'streak'
  isUnlocked: boolean
  currentValue: number
  targetValue: number
  progressPercent: number
  unlockedAtMessage?: string
}

export interface StudentMotivationData {
  currentStreak: number
  bestStreak: number
  hasPracticedToday: boolean
  weekActivity: DayActivity[]
  unlockedBadges: AchievementBadge[]
  nextMilestoneBadge: AchievementBadge | null
  motivationalQuote: string
  dailyMissionText: string
  dailyMissionActionUrl: string
}

/**
 * Calculates streak, 7-day activity map, achievement badges, and motivational insights.
 */
export function calculateStudentMotivation(
  attempts: any[] = [],
  avgAccuracy: number = 0
): StudentMotivationData {
  const safeAttempts = Array.isArray(attempts) ? attempts : []
  const completed = safeAttempts.filter(a => a.status === 'completed' || a.score != null)

  // 1. Map of dates with completed test attempts
  const activeDateSet = new Set<string>()
  completed.forEach(a => {
    const rawDate = a.completed_at || a.started_at
    if (rawDate) {
      const d = new Date(rawDate)
      if (!isNaN(d.getTime())) {
        activeDateSet.add(d.toISOString().split('T')[0])
      }
    }
  })

  // 2. Determine 7-day activity map (last 7 days ending today)
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const hasPracticedToday = activeDateSet.has(todayStr)

  const dayLetters = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const weekActivity: DayActivity[] = []

  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(now)
    dayDate.setDate(now.getDate() - i)
    const dateStr = dayDate.toISOString().split('T')[0]
    const dayIndex = dayDate.getDay()

    weekActivity.push({
      dayLabel: dayLetters[dayIndex],
      dateStr,
      isActive: activeDateSet.has(dateStr),
      isToday: dateStr === todayStr
    })
  }

  // 3. Compute continuous streak (counting backwards from today or yesterday)
  let currentStreak = 0
  let checkDate = new Date(now)

  // If didn't practice today yet, check if practiced yesterday to keep streak alive
  if (!activeDateSet.has(todayStr)) {
    checkDate.setDate(checkDate.getDate() - 1)
  }

  while (true) {
    const str = checkDate.toISOString().split('T')[0]
    if (activeDateSet.has(str)) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }

  // Best streak (at least currentStreak)
  const bestStreak = Math.max(currentStreak, activeDateSet.size > 0 ? 1 : 0)

  // 4. Calculate Achievement Badges
  const totalCompleted = completed.length
  const bestScore = completed.reduce((max, a) => {
    const s = Number(a.percentage) || 0
    return s > max ? s : max
  }, 0)

  const allBadges: AchievementBadge[] = [
    {
      id: 'first_test',
      title: 'First Step',
      description: 'Complete your first practice test or full mock exam.',
      iconName: 'Target',
      category: 'tests',
      isUnlocked: totalCompleted >= 1,
      currentValue: Math.min(1, totalCompleted),
      targetValue: 1,
      progressPercent: totalCompleted >= 1 ? 100 : 0,
      unlockedAtMessage: 'Achieved! Journey started.'
    },
    {
      id: 'pace_setter',
      title: 'Pace Setter',
      description: 'Complete 3 full test sessions.',
      iconName: 'Zap',
      category: 'tests',
      isUnlocked: totalCompleted >= 3,
      currentValue: Math.min(3, totalCompleted),
      targetValue: 3,
      progressPercent: Math.min(100, Math.round((totalCompleted / 3) * 100)),
      unlockedAtMessage: 'Achieved! Building great habits.'
    },
    {
      id: 'test_explorer',
      title: 'Test Explorer',
      description: 'Complete 5 test sessions to establish baseline confidence.',
      iconName: 'Trophy',
      category: 'tests',
      isUnlocked: totalCompleted >= 5,
      currentValue: Math.min(5, totalCompleted),
      targetValue: 5,
      progressPercent: Math.min(100, Math.round((totalCompleted / 5) * 100)),
      unlockedAtMessage: 'Achieved! Deep exam familiarity.'
    },
    {
      id: 'concept_master',
      title: 'Concept Master',
      description: 'Maintain an overall average accuracy of 60% or higher.',
      iconName: 'Sparkles',
      category: 'accuracy',
      isUnlocked: totalCompleted > 0 && avgAccuracy >= 60,
      currentValue: avgAccuracy,
      targetValue: 60,
      progressPercent: Math.min(100, Math.round((avgAccuracy / 60) * 100)),
      unlockedAtMessage: 'Achieved! Unlocked Level 2 Multi-Step sets.'
    },
    {
      id: 'sharp_shooter',
      title: 'Sharp Shooter',
      description: 'Score 80%+ accuracy in any completed mock or practice set.',
      iconName: 'Award',
      category: 'accuracy',
      isUnlocked: bestScore >= 80,
      currentValue: bestScore,
      targetValue: 80,
      progressPercent: Math.min(100, Math.round((bestScore / 80) * 100)),
      unlockedAtMessage: 'Achieved! Precision accuracy unlocked.'
    },
    {
      id: 'streak_3',
      title: 'Consistency Flame',
      description: 'Maintain a 3-day active practice streak.',
      iconName: 'Flame',
      category: 'streak',
      isUnlocked: currentStreak >= 3,
      currentValue: Math.min(3, currentStreak),
      targetValue: 3,
      progressPercent: Math.min(100, Math.round((currentStreak / 3) * 100)),
      unlockedAtMessage: 'Achieved! Unstoppable consistency.'
    }
  ]

  const unlockedBadges = allBadges.filter(b => b.isUnlocked)
  const lockedBadges = allBadges.filter(b => !b.isUnlocked)
  const nextMilestoneBadge = lockedBadges.length > 0 ? lockedBadges[0] : null

  // 5. Dynamic Motivational Quote & Mission
  let motivationalQuote = 'Small daily improvements over time lead to stunning exam results.'
  let dailyMissionText = 'Complete at least 1 practice session today to activate your daily streak!'
  let dailyMissionActionUrl = '/categories'

  if (hasPracticedToday) {
    motivationalQuote = 'Awesome work! Your practice streak is protected for today. Consistency is your superpower.'
    dailyMissionText = 'Streak active! Review your incorrect questions or tackle a fresh chapter challenge.'
    dailyMissionActionUrl = '/dashboard/exams'
  } else if (currentStreak >= 2) {
    motivationalQuote = `You are on a ${currentStreak}-day streak! Keep the flame burning by answering a quick test set.`
    dailyMissionText = `Practice today to protect your ${currentStreak}-day streak!`
    dailyMissionActionUrl = '/categories'
  } else if (avgAccuracy > 0 && avgAccuracy < 60) {
    motivationalQuote = 'Foundation mode active: Focus on 1-step formulas first. Every correct answer moves you closer to Concept Master!'
    dailyMissionText = 'Take a 15-minute Foundation Practice set to boost your accuracy.'
    dailyMissionActionUrl = '/categories'
  } else if (avgAccuracy >= 60) {
    motivationalQuote = 'Master mode unlocked! You are handling multi-step problems with confidence. Push for 85%+!'
    dailyMissionText = 'Take a timed mock exam to build stamina and eliminate negative marking.'
    dailyMissionActionUrl = '/categories'
  }

  return {
    currentStreak,
    bestStreak,
    hasPracticedToday,
    weekActivity,
    unlockedBadges,
    nextMilestoneBadge,
    motivationalQuote,
    dailyMissionText,
    dailyMissionActionUrl
  }
}
