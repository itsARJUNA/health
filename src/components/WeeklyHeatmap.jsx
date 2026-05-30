import { useMemo, useState, useRef } from 'react'
import { format, parseISO, getDaysInMonth, eachDayOfInterval } from 'date-fns'
import { getRecoveryColor } from '../utils/loadData'
import { useChartTheme } from '../utils/useChartTheme'

export default function WeeklyHeatmap({ data, dateRange }) {
  const t = useChartTheme()
  const [tooltip, setTooltip] = useState(null)
  const containerRef = useRef(null)

  const grid = useMemo(() => {
    const recoveryByDate = {}
    data.forEach(d => {
      if (d.date && d.recovery != null) {
        if (!recoveryByDate[d.date] || d.recovery > recoveryByDate[d.date]) {
          recoveryByDate[d.date] = d.recovery
        }
      }
    })

    const start = parseISO(dateRange[0])
    const end = parseISO(dateRange[1])
    const allDays = eachDayOfInterval({ start, end })

    const months = {}
    allDays.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd')
      const month = dateStr.slice(0, 7)
      if (!months[month]) months[month] = {}
      const day = parseInt(dateStr.slice(8, 10))
      months[month][day] = recoveryByDate[dateStr] ?? null
    })

    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, days]) => {
        const totalDays = getDaysInMonth(parseISO(month + '-01'))
        return { month, days, totalDays }
      })
  }, [data, dateRange])

  const noDataBg = t.isDark ? '#1a1a1a' : '#f0f0f0'
  const noDataStroke = t.isDark ? '#4b5563' : '#d0d0d0'

  const handleMouseEnter = (e, date, recovery) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    setTooltip({
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top,
      date,
      recovery,
    })
  }

  const handleMouseLeave = () => setTooltip(null)

  return (
    <div className="rounded-xl p-5 card-hover relative" style={{ background: t.bg, border: `1px solid ${t.border}` }} ref={containerRef}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <pattern id="noDataPattern" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="5" stroke={noDataStroke} strokeWidth="0.75" strokeOpacity="0.6" />
          </pattern>
        </defs>
      </svg>

      {tooltip && (
        <div
          className="heatmap-tooltip visible"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 2 }}>{tooltip.date}</p>
          {tooltip.recovery != null ? (
            <p style={{ fontSize: 13, fontWeight: 600, color: getRecoveryColor(tooltip.recovery) }}>
              {tooltip.recovery}% Recovery
            </p>
          ) : (
            <p style={{ fontSize: 12, color: t.textMuted }}>No data</p>
          )}
        </div>
      )}

      <h3 className="text-sm font-semibold mb-1" style={{ color: t.textPrimary }}>Recovery Heatmap</h3>
      <p className="text-xs mb-4" style={{ color: t.textMuted }}>Daily recovery scores by month</p>
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex items-center gap-1 mb-2">
            <span className="w-12 shrink-0"></span>
            {Array.from({ length: 31 }, (_, i) => (
              <div key={i} className="w-4 text-center text-[9px]" style={{ color: t.textMuted }}>
                {i + 1}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {grid.map(({ month, days, totalDays }) => (
              <div key={month} className="flex items-center gap-1">
                <span className="w-12 text-[10px] text-right shrink-0" style={{ color: t.textMuted }}>
                  {format(parseISO(month + '-01'), 'MMM yy')}
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: 31 }, (_, i) => {
                    const day = i + 1
                    const isValidDay = day <= totalDays
                    const recovery = days[day]
                    const dateStr = isValidDay ? format(parseISO(`${month}-${String(day).padStart(2, '0')}`), 'MMM dd yyyy') : ''

                    if (!isValidDay) {
                      return <div key={i} className="w-4 h-4" />
                    }

                    if (recovery == null) {
                      return (
                        <svg
                          key={i}
                          width="16"
                          height="16"
                          className="cursor-pointer"
                          onMouseEnter={(e) => handleMouseEnter(e, dateStr, null)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <rect width="16" height="16" rx="3" fill={noDataBg} />
                          <rect width="16" height="16" rx="3" fill="url(#noDataPattern)" />
                        </svg>
                      )
                    }

                    return (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-[3px] transition-all cursor-pointer hover:scale-150 hover:z-10"
                        style={{
                          backgroundColor: getRecoveryColor(recovery),
                          opacity: Math.max(0.4, recovery / 100),
                        }}
                        onMouseEnter={(e) => handleMouseEnter(e, dateStr, recovery)}
                        onMouseLeave={handleMouseLeave}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 text-[10px]" style={{ color: t.textMuted }}>
        <div className="flex items-center gap-2">
          <span>Low</span>
          <div className="flex gap-0.5">
            {[20, 35, 50, 67, 85].map(v => (
              <div key={v} className="w-4 h-4 rounded-[3px]" style={{ backgroundColor: getRecoveryColor(v), opacity: Math.max(0.4, v / 100) }} />
            ))}
          </div>
          <span>High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="16" height="16">
            <rect width="16" height="16" rx="3" fill={noDataBg} />
            <rect width="16" height="16" rx="3" fill="url(#noDataPattern)" />
          </svg>
          <span>No data</span>
        </div>
      </div>
    </div>
  )
}
