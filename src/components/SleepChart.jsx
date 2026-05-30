import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatDuration, avg } from '../utils/loadData'
import { useChartTheme } from '../utils/useChartTheme'
import { format, parseISO } from 'date-fns'

function CustomTooltip({ active, payload, chartTheme }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const t = chartTheme
  return (
    <div style={{ background: t.tooltipBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>{format(parseISO(d.date), 'EEE, MMM d yyyy')}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: t.textPrimary, marginBottom: 8 }}>Total: {formatDuration(d.light + d.deep + d.rem)}</p>
      <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#60a5fa', marginRight: 8 }}></span>Light: {formatDuration(d.light)}</p>
        <p><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#6366f1', marginRight: 8 }}></span>Deep: {formatDuration(d.deep)}</p>
        <p><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 4, background: '#a855f7', marginRight: 8 }}></span>REM: {formatDuration(d.rem)}</p>
      </div>
    </div>
  )
}

export default function SleepChart({ data, dateRange }) {
  const t = useChartTheme()

  const filtered = useMemo(() => {
    return data.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1] && d.asleep)
  }, [data, dateRange])

  const avgSleep = avg(filtered.map(d => d.asleep))

  return (
    <div className="rounded-xl p-5 card-hover" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: t.textPrimary }}>Sleep Stages</h3>
          <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>Nightly breakdown by stage</p>
        </div>
        {avgSleep && (
          <div className="text-right">
            <p className="text-xs" style={{ color: t.textMuted }}>Avg Duration</p>
            <p className="text-lg font-bold" style={{ color: '#a855f7' }}>{formatDuration(avgSleep)}</p>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={filtered}>
          <defs>
            <linearGradient id="lightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="deepGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="remGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} />
          <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'MMM d')} stroke={t.axisStroke} fontSize={11} tickMargin={8} interval="preserveStartEnd" />
          <YAxis stroke={t.axisStroke} fontSize={11} tickMargin={8} tickFormatter={v => `${Math.round(v / 60)}h`} />
          <Tooltip content={<CustomTooltip chartTheme={t} />} />
          <Area type="monotone" dataKey="light" stackId="1" stroke="#60a5fa" fill="url(#lightGrad)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="deep" stackId="1" stroke="#6366f1" fill="url(#deepGrad)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="rem" stackId="1" stroke="#a855f7" fill="url(#remGrad)" strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-3 text-xs" style={{ color: t.textMuted }}>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#60a5fa' }}></span>Light</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#6366f1' }}></span>Deep (SWS)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#a855f7' }}></span>REM</span>
      </div>
    </div>
  )
}
