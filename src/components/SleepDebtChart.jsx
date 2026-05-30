import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useChartTheme } from '../utils/useChartTheme'
import { format, parseISO } from 'date-fns'

export default function SleepDebtChart({ data, dateRange }) {
  const t = useChartTheme()

  const filtered = useMemo(() => {
    return data.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1] && d.debt != null)
  }, [data, dateRange])

  return (
    <div className="rounded-xl p-5 card-hover" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: t.textPrimary }}>Sleep Debt</h3>
      <p className="text-xs mb-4" style={{ color: t.textMuted }}>Accumulated deficit in minutes</p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={filtered}>
          <defs>
            <linearGradient id="debtGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} />
          <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'MMM d')} stroke={t.axisStroke} fontSize={11} interval="preserveStartEnd" />
          <YAxis stroke={t.axisStroke} fontSize={11} />
          <Tooltip contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.border}`, borderRadius: 8 }} labelFormatter={d => format(parseISO(d), 'MMM d yyyy')} />
          <Area type="monotone" dataKey="debt" stroke="#f43f5e" fill="url(#debtGrad)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
