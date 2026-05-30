import { useMemo } from 'react'

export default function JournalInsights({ data, cycles, dateRange }) {
  const insights = useMemo(() => {
    const filtered = data.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1])

    const questionStats = {}
    filtered.forEach(entry => {
      if (!questionStats[entry.question]) {
        questionStats[entry.question] = { yes: 0, total: 0 }
      }
      questionStats[entry.question].total++
      if (entry.answeredYes) questionStats[entry.question].yes++
    })

    const recoveryByQuestion = {}
    const cycleMap = {}
    cycles.forEach(c => { cycleMap[c.date] = c.recovery })

    filtered.forEach(entry => {
      if (!recoveryByQuestion[entry.question]) {
        recoveryByQuestion[entry.question] = { withYes: [], withNo: [] }
      }
      const recovery = cycleMap[entry.date]
      if (recovery != null) {
        if (entry.answeredYes) recoveryByQuestion[entry.question].withYes.push(recovery)
        else recoveryByQuestion[entry.question].withNo.push(recovery)
      }
    })

    const correlations = Object.entries(recoveryByQuestion)
      .map(([question, { withYes, withNo }]) => {
        const avgYes = withYes.length > 3 ? withYes.reduce((a, b) => a + b, 0) / withYes.length : null
        const avgNo = withNo.length > 3 ? withNo.reduce((a, b) => a + b, 0) / withNo.length : null
        const diff = avgYes != null && avgNo != null ? avgYes - avgNo : null
        return { question, avgYes, avgNo, diff, yesCount: withYes.length, noCount: withNo.length }
      })
      .filter(c => c.diff != null)
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .slice(0, 8)

    const topHabits = Object.entries(questionStats)
      .map(([question, { yes, total }]) => ({ question, yes, total, pct: (yes / total * 100) }))
      .filter(h => h.total >= 5)
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 6)

    return { correlations, topHabits }
  }, [data, cycles, dateRange])

  return (
    <div className="bg-whoop-card border border-whoop-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-zinc-200 mb-1">Journal Insights</h3>
      <p className="text-xs text-whoop-muted mb-4">How your habits correlate with recovery</p>

      {insights.correlations.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Recovery Impact</p>
          <div className="space-y-2">
            {insights.correlations.map((c, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-300 truncate">{c.question}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-semibold ${c.diff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {c.diff > 0 ? '+' : ''}{c.diff.toFixed(1)}%
                  </span>
                  <div className="w-20 h-1.5 bg-whoop-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.diff > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`}
                      style={{ width: `${Math.min(Math.abs(c.diff) * 3, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.topHabits.length > 0 && (
        <div>
          <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Habit Frequency</p>
          <div className="grid grid-cols-2 gap-2">
            {insights.topHabits.map((h, i) => (
              <div key={i} className="bg-whoop-dark/50 rounded-lg p-2.5">
                <p className="text-xs text-zinc-300 truncate mb-1">{h.question}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-whoop-border rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${h.pct}%` }} />
                  </div>
                  <span className="text-xs text-whoop-muted shrink-0">{h.pct.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
