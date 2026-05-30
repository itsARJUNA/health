import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getStrainColor, avg } from '../utils/loadData'
import { useChartTheme } from '../utils/useChartTheme'
import { format, parseISO } from 'date-fns'

export default function StrainChart({ data, dateRange }) {
  const t = useChartTheme()

  const filtered = useMemo(() => {
    return data.filter(d => d.strain != null && d.date >= dateRange[0] && d.date <= dateRange[1])
  }, [data, dateRange])

  const average = avg(filtered.map(d => d.strain))

  return (
    <div className="rounded-xl p-5 card-hover" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: t.textPrimary }}>Day Strain</h3>
          <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>Daily cardiovascular load (0–21)</p>
        </div>
        {average && (
          <div className="text-right">
            <p className="text-xs" style={{ color: t.textMuted }}>Average</p>
            <p className="text-lg font-bold" style={{ color: getStrainColor(average) }}>{average.toFixed(1)}</p>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={filtered}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} vertical={false} />
          <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'MMM d')} stroke={t.axisStroke} fontSize={11} tickMargin={8} interval="preserveStartEnd" />
          <YAxis domain={[0, 21]} stroke={t.axisStroke} fontSize={11} tickMargin={8} />
          <Tooltip
            contentStyle={{ background: t.tooltipBg, border: `1px solid ${t.border}`, borderRadius: 8 }}
            labelFormatter={d => format(parseISO(d), 'MMM d yyyy')}
          />
          <Bar dataKey="strain" radius={[3, 3, 0, 0]} maxBarSize={8}>
            {filtered.map((entry, i) => (
              <Cell key={i} fill={getStrainColor(entry.strain)} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
