import { useMemo, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts'
import { useChartTheme } from '../utils/useChartTheme'

const COLORS = ['#4eca8b', '#3b82f6', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1']

function renderActiveShape({ cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, percent, midAngle }, chartTheme) {
  const RADIAN = Math.PI / 180
  const sin = Math.sin(-RADIAN * midAngle)
  const cos = Math.cos(-RADIAN * midAngle)
  const mx = cx + (outerRadius + 20) * cos
  const my = cy + (outerRadius + 20) * sin
  const ex = cx + (outerRadius + 40) * cos
  const ey = cy + (outerRadius + 40) * sin
  const textAnchor = cos >= 0 ? 'start' : 'end'

  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} innerRadius={innerRadius - 4} outerRadius={innerRadius - 1} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <path d={`M${cx + outerRadius * cos},${cy + outerRadius * sin}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
      <circle cx={ex} cy={ey} r={2.5} fill={fill} />
      <text x={ex + (cos >= 0 ? 6 : -6)} y={ey - 2} textAnchor={textAnchor} fill={chartTheme.textPrimary} fontSize={12} fontWeight={600}>
        {payload.name}
      </text>
      <text x={ex + (cos >= 0 ? 6 : -6)} y={ey + 14} textAnchor={textAnchor} fill={chartTheme.textMuted} fontSize={11}>
        {value} session{value !== 1 ? 's' : ''} ({(percent * 100).toFixed(0)}%)
      </text>
    </g>
  )
}

export default function WorkoutsPieChart({ data, dateRange }) {
  const [activeIndex, setActiveIndex] = useState(null)
  const t = useChartTheme()

  const filtered = useMemo(() => {
    return data.filter(w => w.date >= dateRange[0] && w.date <= dateRange[1])
  }, [data, dateRange])

  const chartData = useMemo(() => {
    const counts = {}
    filtered.forEach(w => { counts[w.activity] = (counts[w.activity] || 0) + 1 })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [filtered])

  const totalSessions = filtered.length

  return (
    <div className="rounded-xl p-5 card-hover" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: t.textPrimary }}>Activity Breakdown</h3>
      <p className="text-xs mb-4" style={{ color: t.textMuted }}>{chartData.length} different activities</p>
      <div className="flex items-center gap-4">
        <div className="relative" style={{ width: '55%', height: 260 }}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                dataKey="value"
                activeIndex={activeIndex}
                activeShape={(props) => renderActiveShape(props, t)}
                onMouseEnter={(_, i) => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={activeIndex === null || activeIndex === i ? 1 : 0.4} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {activeIndex === null && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-xl font-bold" style={{ color: t.textPrimary }}>{totalSessions}</p>
                <p className="text-[10px]" style={{ color: t.textMuted }}>sessions</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1.5 max-h-[260px] overflow-y-auto pr-2">
          {chartData.map((item, i) => (
            <div
              key={item.name}
              className="flex items-center gap-2 text-xs cursor-default"
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
              <span className="flex-1 truncate" style={{ color: t.textSecondary }}>{item.name}</span>
              <span className="font-medium" style={{ color: t.textMuted }}>{item.value}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 text-xs pt-2 mt-2" style={{ borderTop: `1px solid ${t.border}` }}>
            <span className="flex-1 font-medium" style={{ color: t.textPrimary }}>Total</span>
            <span className="font-bold" style={{ color: t.accent }}>{totalSessions}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
