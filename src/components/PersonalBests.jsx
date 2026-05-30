import { useMemo } from 'react'
import { useChartTheme } from '../utils/useChartTheme'
import { formatDuration } from '../utils/loadData'
import { format, parseISO } from 'date-fns'
import { Trophy, Flame, Moon, Heart, Zap, Calendar } from 'lucide-react'

export default function PersonalBests({ cycles, sleeps, workouts, dateRange }) {
  const t = useChartTheme()

  const bests = useMemo(() => {
    const filteredCycles = cycles.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1])
    const filteredSleeps = sleeps.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1])
    const filteredWorkouts = workouts.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1])

    const highestRecovery = filteredCycles.reduce((best, d) => d.recovery > (best?.recovery || 0) ? d : best, null)
    const longestSleep = filteredSleeps.reduce((best, d) => (d.asleep || 0) > (best?.asleep || 0) ? d : best, null)
    const hardestWorkout = filteredWorkouts.reduce((best, d) => (d.strain || 0) > (best?.strain || 0) ? d : best, null)
    const highestHRV = filteredCycles.reduce((best, d) => (d.hrv || 0) > (best?.hrv || 0) ? d : best, null)

    let streak = 0, maxStreak = 0
    filteredCycles.forEach(d => {
      if (d.recovery >= 67) { streak++; maxStreak = Math.max(maxStreak, streak) }
      else { streak = 0 }
    })

    const totalWorkoutMinutes = filteredWorkouts.reduce((s, w) => s + (w.duration || 0), 0)

    return [
      { icon: Trophy, label: 'Best Recovery', value: `${highestRecovery?.recovery}%`, date: highestRecovery?.date, color: '#4eca8b' },
      { icon: Moon, label: 'Longest Sleep', value: formatDuration(longestSleep?.asleep), date: longestSleep?.date, color: '#a855f7' },
      { icon: Flame, label: 'Hardest Workout', value: `${hardestWorkout?.strain?.toFixed(1)} strain`, subtitle: hardestWorkout?.activity, date: hardestWorkout?.date, color: '#f59e0b' },
      { icon: Heart, label: 'Peak HRV', value: `${highestHRV?.hrv}ms`, date: highestHRV?.date, color: '#10b981' },
      { icon: Zap, label: 'Green Streak', value: `${maxStreak} days`, subtitle: 'Consecutive 67%+ recovery', color: '#4eca8b' },
      { icon: Calendar, label: 'Total Training', value: formatDuration(totalWorkoutMinutes), subtitle: `${filteredWorkouts.length} sessions`, color: '#3b82f6' },
    ]
  }, [cycles, sleeps, workouts, dateRange])

  return (
    <div className="rounded-xl p-5 card-hover" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: t.textPrimary }}>Personal Bests</h3>
      <p className="text-xs mb-4" style={{ color: t.textMuted }}>Highlights from your data</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {bests.map((item, i) => {
          const Icon = item.icon
          return (
            <div key={i} className="rounded-lg p-3" style={{ background: t.isDark ? '#0a0a0a' : '#f9f9f9' }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: item.color }} />
                <span className="text-[11px] font-medium" style={{ color: t.textMuted }}>{item.label}</span>
              </div>
              <p className="text-lg font-bold" style={{ color: item.color }}>{item.value}</p>
              {item.subtitle && <p className="text-[11px] mt-0.5" style={{ color: t.textMuted }}>{item.subtitle}</p>}
              {item.date && <p className="text-[10px] mt-1" style={{ color: t.textMuted }}>{format(parseISO(item.date), 'MMM dd yyyy')}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
