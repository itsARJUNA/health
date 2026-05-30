import { useMemo } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { getRecoveryColor, avg } from '../utils/loadData'
import { useChartTheme } from '../utils/useChartTheme'
import { format, parseISO } from 'date-fns'

function CustomTooltip({ active, payload, chartTheme }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const t = chartTheme
  return (
    <div style={{ background: t.tooltipBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>{format(parseISO(d.date), 'EEE, MMM d yyyy')}</p>
      <p style={{ fontSize: 13, fontWeight: 600, color: getRecoveryColor(d.recovery) }}>
        {d.recovery != null ? `${d.recovery}%` : '—'} Recovery
      </p>
      <p style={{ fontSize: 11, color: t.textMuted, marginTop: 4 }}>HRV: {d.hrv ?? '—'}ms | RHR: {d.restingHR ?? '—'}bpm</p>
    </div>
  )
}

export default function RecoveryChart({ data, dateRange }) {
  const t = useChartTheme()

  const filtered = useMemo(() => {
    return data.filter(d => d.recovery != null && d.date >= dateRange[0] && d.date <= dateRange[1])
  }, [data, dateRange])

  const average = avg(filtered.map(d => d.recovery))

  return (
    <div className="rounded-xl p-5 card-hover" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: t.textPrimary }}>Recovery Score</h3>
          <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>Daily recovery percentage</p>
        </div>
        {average && (
          <div className="text-right">
            <p className="text-xs" style={{ color: t.textMuted }}>Average</p>
            <p className="text-lg font-bold" style={{ color: getRecoveryColor(average) }}>
              {average.toFixed(0)}%
            </p>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={filtered}>
          <defs>
            <linearGradient id="recoveryGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4eca8b" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#4eca8b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} />
          <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'MMM d')} stroke={t.axisStroke} fontSize={11} tickMargin={8} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} stroke={t.axisStroke} fontSize={11} tickMargin={8} />
          <Tooltip content={<CustomTooltip chartTheme={t} />} />
          <ReferenceLine y={67} stroke="#4eca8b" strokeDasharray="3 3" strokeOpacity={0.4} />
          <ReferenceLine y={34} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.4} />
          <Area type="monotone" dataKey="recovery" stroke="#4eca8b" strokeWidth={2} fill="url(#recoveryGrad)" dot={false} activeDot={{ r: 4, stroke: '#4eca8b', strokeWidth: 2, fill: t.bg }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
