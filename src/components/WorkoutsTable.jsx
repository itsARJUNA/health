import React, { useMemo, useState } from 'react'
import { formatDuration, getStrainColor } from '../utils/loadData'
import { useChartTheme } from '../utils/useChartTheme'
import { format, parseISO } from 'date-fns'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 20

export default function WorkoutsTable({ data, dateRange }) {
  const t = useChartTheme()
  const [sortKey, setSortKey] = useState('date')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(0)
  const [expandedRow, setExpandedRow] = useState(null)

  const filtered = useMemo(() => {
    return data
      .filter(d => d.date >= dateRange[0] && d.date <= dateRange[1])
      .sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey]
        if (av == null) return 1
        if (bv == null) return -1
        const cmp = typeof av === 'string' ? av.localeCompare(bv) : av - bv
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [data, dateRange, sortKey, sortDir])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
    setPage(0)
  }

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return null
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  const activityCounts = useMemo(() => {
    const counts = {}
    filtered.forEach(w => { counts[w.activity] = (counts[w.activity] || 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [filtered])

  return (
    <div className="rounded-xl p-5 card-hover" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: t.textPrimary }}>Workouts</h3>
          <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{filtered.length} sessions in period</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {activityCounts.map(([name, count]) => (
            <span key={name} className="text-xs px-2 py-0.5 rounded-full" style={{ background: t.isDark ? '#1a1a1a' : '#f0f0f0', border: `1px solid ${t.isDark ? '#2a2a2a' : '#e0e0e0'}`, color: t.textMuted }}>
              {name} ({count})
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${t.border}` }}>
              {[['date', 'Date', 'left'], ['activity', 'Activity', 'left'], ['strain', 'Strain', 'right'], ['duration', 'Duration', 'right'], ['calories', 'Calories', 'right'], ['avgHR', 'Avg HR', 'right'], ['maxHR', 'Max HR', 'right']].map(([key, label, align]) => (
                <th key={key} className={`text-${align} py-2 px-2 cursor-pointer text-xs`} style={{ color: t.textMuted }} onClick={() => toggleSort(key)}>
                  <span className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>{label} <SortIcon col={key} /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((w, i) => {
              const isExpanded = expandedRow === i
              const ZONES = [
                { label: 'Zone 1', value: w.zone1, color: '#94a3b8' },
                { label: 'Zone 2', value: w.zone2, color: '#3b82f6' },
                { label: 'Zone 3', value: w.zone3, color: '#4eca8b' },
                { label: 'Zone 4', value: w.zone4, color: '#f59e0b' },
                { label: 'Zone 5', value: w.zone5, color: '#ef4444' },
              ]
              return (
                <React.Fragment key={i}>
                  <tr
                    className="transition-colors cursor-pointer"
                    style={{ borderBottom: isExpanded ? 'none' : `1px solid ${t.isDark ? '#1a1a1a' : '#f5f5f5'}` }}
                    onClick={() => setExpandedRow(isExpanded ? null : i)}
                  >
                    <td className="py-2.5 px-2 text-xs" style={{ color: t.textMuted }}>{format(parseISO(w.date), 'MMM dd yyyy')}</td>
                    <td className="py-2.5 px-2 font-medium" style={{ color: t.textPrimary }}>{w.activity}</td>
                    <td className="py-2.5 px-2 text-right font-semibold" style={{ color: getStrainColor(w.strain) }}>{w.strain?.toFixed(1) ?? '—'}</td>
                    <td className="py-2.5 px-2 text-right" style={{ color: t.textMuted }}>{formatDuration(w.duration)}</td>
                    <td className="py-2.5 px-2 text-right" style={{ color: t.textMuted }}>{w.calories?.toFixed(0) ?? '—'}</td>
                    <td className="py-2.5 px-2 text-right" style={{ color: t.textMuted }}>{w.avgHR ?? '—'}</td>
                    <td className="py-2.5 px-2 text-right" style={{ color: t.textMuted }}>{w.maxHR ?? '—'}</td>
                  </tr>
                  {isExpanded && (
                    <tr style={{ borderBottom: `1px solid ${t.isDark ? '#1a1a1a' : '#f5f5f5'}` }}>
                      <td colSpan={7} className="px-2 py-3">
                        <div className="rounded-lg p-3" style={{ background: t.isDark ? '#0a0a0a' : '#f9f9f9' }}>
                          <p className="text-xs font-medium mb-2" style={{ color: t.textSecondary }}>HR Zone Distribution</p>
                          <div className="flex items-center gap-1 h-5 rounded-full overflow-hidden mb-2">
                            {ZONES.map((z, zi) => (
                              z.value > 0 && <div key={zi} style={{ width: `${z.value}%`, background: z.color, height: '100%' }} />
                            ))}
                          </div>
                          <div className="flex items-center gap-4 flex-wrap">
                            {ZONES.map((z, zi) => (
                              <span key={zi} className="flex items-center gap-1.5 text-[11px]" style={{ color: t.textMuted }}>
                                <span className="w-2 h-2 rounded-full" style={{ background: z.color }}></span>
                                {z.label}: {z.value}%
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: `1px solid ${t.border}` }}>
            <p className="text-xs" style={{ color: t.textMuted }}>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded-md disabled:opacity-30 transition-colors" style={{ color: t.textMuted }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className="w-7 h-7 rounded-md text-xs font-medium transition-colors"
                  style={{
                    background: page === i ? '#0B3D2E' : 'transparent',
                    color: page === i ? '#4eca8b' : t.textMuted,
                  }}
                >
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="p-1.5 rounded-md disabled:opacity-30 transition-colors" style={{ color: t.textMuted }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
