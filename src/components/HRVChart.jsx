import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { avg } from '../utils/loadData'
import { useChartTheme } from '../utils/useChartTheme'
import { format, parseISO } from 'date-fns'

function CustomTooltip({ active, payload, chartTheme }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const t = chartTheme
  return (
    <div style={{ background: t.tooltipBg, border: `1px solid ${t.border}`, borderRadius: 8, padding: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      <p style={{ fontSize: 11, color: t.textMuted, marginBottom: 4 }}>{format(parseISO(d.date), 'EEE, MMM d yyyy')}</p>
      <p style={{ fontSize: 13 }}><span style={{ color: '#10b981', fontWeight: 600 }}>{d.hrv ?? '—'}</span> <span style={{ fontSize: 11, color: t.textMuted }}>ms HRV</span></p>
      <p style={{ fontSize: 13 }}><span style={{ color: '#f43f5e', fontWeight: 600 }}>{d.restingHR ?? '—'}</span> <span style={{ fontSize: 11, color: t.textMuted }}>bpm RHR</span></p>
    </div>
  )
}

export default function HRVChart({ data, dateRange }) {
  const t = useChartTheme()

  const filtered = useMemo(() => {
    return data.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1] && (d.hrv || d.restingHR))
  }, [data, dateRange])

  const avgHRV = avg(filtered.map(d => d.hrv))
  const avgRHR = avg(filtered.map(d => d.restingHR))

  return (
    <div className="rounded-xl p-5 card-hover" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: t.textPrimary }}>HRV & Resting Heart Rate</h3>
          <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>Key recovery indicators</p>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-xs" style={{ color: t.textMuted }}>Avg HRV</p>
            <p className="text-lg font-bold" style={{ color: '#10b981' }}>{avgHRV?.toFixed(0) ?? '—'}ms</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: t.textMuted }}>Avg RHR</p>
            <p className="text-lg font-bold" style={{ color: '#f43f5e' }}>{avgRHR?.toFixed(0) ?? '—'}bpm</p>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={filtered}>
          <CartesianGrid strokeDasharray="3 3" stroke={t.gridStroke} />
          <XAxis dataKey="date" tickFormatter={d => format(parseISO(d), 'MMM d')} stroke={t.axisStroke} fontSize={11} tickMargin={8} interval="preserveStartEnd" />
          <YAxis yAxisId="hrv" stroke={t.axisStroke} fontSize={11} tickMargin={8} />
          <YAxis yAxisId="rhr" orientation="right" stroke={t.axisStroke} fontSize={11} tickMargin={8} />
          <Tooltip content={<CustomTooltip chartTheme={t} />} />
          {avgHRV && <ReferenceLine yAxisId="hrv" y={avgHRV} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.4} />}
          <Line yAxisId="hrv" type="monotone" dataKey="hrv" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#10b981', strokeWidth: 2, fill: t.bg }} />
          <Line yAxisId="rhr" type="monotone" dataKey="restingHR" stroke="#f43f5e" strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: '#f43f5e', strokeWidth: 2, fill: t.bg }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-3 text-xs" style={{ color: t.textMuted }}>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981' }}></span>HRV (ms)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#f43f5e' }}></span>RHR (bpm)</span>
      </div>
    </div>
  )
}
