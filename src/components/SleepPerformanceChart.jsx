import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useChartTheme } from '../utils/useChartTheme'
import { format, parseISO } from 'date-fns'

export default function SleepPerformanceChart({ data, dateRange }) {
  const t = useChartTheme()

  const filtered = useMemo(() => {
    return data.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1] && d.performance)
  }, [data, dateRange])

  return (
    <div className="rounded-xl p-5 card-hover" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: t.textPrimary }}>Sleep Performance</h3>
      <p className="text-xs mb-4" style={{ color: t.textMuted }}>% of sleep need achieved</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={filtered}>
          <defs>
            <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} />
          <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'MMM d')} stroke={t.axisStroke} fontSize={11} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} stroke={t.axisStroke} fontSize={11} />
          <Tooltip contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.border}`, borderRadius: 8 }} labelFormatter={d => format(parseISO(d), 'MMM d yyyy')} />
          <Area type="monotone" dataKey="performance" stroke="#3b82f6" fill="url(#perfGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
