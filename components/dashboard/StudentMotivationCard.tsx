'use client'

import Link from 'next/link'
import { 
  Flame, 
  Target, 
  Zap, 
  Trophy, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { StudentMotivationData, AchievementBadge } from '@/lib/student-motivation'

interface Props {
  motivation: StudentMotivationData
}

export default function StudentMotivationCard({ motivation }: Props) {
  const {
    currentStreak,
    hasPracticedToday,
    weekActivity,
    unlockedBadges,
    nextMilestoneBadge,
    motivationalQuote,
    dailyMissionText,
    dailyMissionActionUrl
  } = motivation

  const renderBadgeIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Target': return <Target className={className} />
      case 'Zap': return <Zap className={className} />
      case 'Trophy': return <Trophy className={className} />
      case 'Award': return <Award className={className} />
      case 'Sparkles': return <Sparkles className={className} />
      default: return <Flame className={className} />
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-xs mb-10 space-y-6">
      
      {/* Top Header: Streak & Daily Mission */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-100">
        
        {/* Left: Streak Counter & Status */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
            currentStreak > 0 
              ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-orange-300'
              : 'bg-gray-100 text-gray-400'
          }`}>
            <Flame className={`w-8 h-8 ${currentStreak > 0 ? 'animate-bounce' : ''}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                {currentStreak > 0 ? `${currentStreak}-Day Streak!` : 'Start Your Streak!'}
              </h3>
              {hasPracticedToday && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Today Completed
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5 max-w-md">
              {motivationalQuote}
            </p>
          </div>
        </div>

        {/* Right: 7-Day Consistency Week Tracker */}
        <div className="flex items-center gap-2 self-start lg:self-center bg-gray-50 p-2 rounded-2xl border border-gray-100">
          {weekActivity.map((day) => (
            <div key={day.dateStr} className="flex flex-col items-center gap-1 px-1.5 py-1">
              <span className={`text-[10px] font-bold uppercase ${day.isToday ? 'text-blue-600 font-black' : 'text-gray-400'}`}>
                {day.dayLabel}
              </span>
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  day.isActive 
                    ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs'
                    : day.isToday
                      ? 'border-2 border-dashed border-gray-300 text-gray-400 bg-white'
                      : 'bg-gray-200/80 text-gray-400'
                }`}
                title={day.isActive ? `${day.dateStr}: Practiced!` : `${day.dateStr}: No activity`}
              >
                {day.isActive ? '🔥' : '·'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle: Daily Action Prompt */}
      <div className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        hasPracticedToday 
          ? 'bg-emerald-50/70 border border-emerald-200/70 text-emerald-950'
          : 'bg-amber-50/70 border border-amber-200/70 text-amber-950'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${
            hasPracticedToday ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">{dailyMissionText}</h4>
            <p className="text-xs text-gray-600 mt-0.5">Regular daily revision boosts long-term memory retention by 40%.</p>
          </div>
        </div>

        <Link
          href={dailyMissionActionUrl}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 shadow-xs ${
            hasPracticedToday
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
        >
          {hasPracticedToday ? 'Review Exam Analytics' : 'Start Today\'s Practice'}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Bottom: Achievements & Badges Showcase */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h4 className="text-sm font-bold text-gray-900">Milestone Badges</h4>
            <span className="text-[11px] font-bold text-gray-400">
              ({unlockedBadges.length} unlocked)
            </span>
          </div>

          {nextMilestoneBadge && (
            <span className="text-[11px] font-bold text-blue-600">
              Next Goal: {nextMilestoneBadge.title} ({nextMilestoneBadge.progressPercent}%)
            </span>
          )}
        </div>

        {/* Badges List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {unlockedBadges.map((badge) => (
            <div 
              key={badge.id}
              className="p-3 rounded-2xl bg-gradient-to-b from-amber-50/60 to-white border border-amber-200/80 text-center space-y-1 shadow-2xs"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center shadow-xs">
                {renderBadgeIcon(badge.iconName, "w-4 h-4")}
              </div>
              <h5 className="font-bold text-xs text-gray-900 truncate">{badge.title}</h5>
              <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Unlocked
              </span>
            </div>
          ))}

          {/* Next Locked Badge with Progress */}
          {nextMilestoneBadge && (
            <div className="p-3 rounded-2xl bg-gray-50 border border-dashed border-gray-300 text-center space-y-1 col-span-2 sm:col-span-1">
              <div className="w-9 h-9 rounded-xl bg-gray-200 text-gray-400 mx-auto flex items-center justify-center">
                {renderBadgeIcon(nextMilestoneBadge.iconName, "w-4 h-4")}
              </div>
              <h5 className="font-bold text-xs text-gray-600 truncate">{nextMilestoneBadge.title}</h5>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${Math.max(10, nextMilestoneBadge.progressPercent)}%` }} 
                />
              </div>
              <span className="text-[9px] text-gray-400 font-bold block truncate">
                {nextMilestoneBadge.targetValue - nextMilestoneBadge.currentValue} more to unlock
              </span>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
