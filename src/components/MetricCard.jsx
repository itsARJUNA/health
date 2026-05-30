import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useTheme } from '../utils/ThemeContext'
import AnimatedNumber from './AnimatedNumber'

export default function MetricCard({ title, value, unit, trend, color, subtitle }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const trendIcon = trend > 0
    ? <TrendingUp size={14} style={{ color: '#4eca8b' }} />
    : trend < 0
      ? <TrendingDown size={14} style={{ color: '#ef4444' }} />
      : <Minus size={14} style={{ color: isDark ? '#666' : '#888' }} />

  const isNumeric = value != null && !isNaN(parseFloat(value)) && !value.toString().includes('h')

  return (
    <div
      className="rounded-xl p-5 card-hover"
      style={{
        background: isDark ? '#141414' : '#ffffff',
        border: `1px solid ${isDark ? '#222222' : '#e0e0e0'}`,
      }}
    >
      <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: isDark ? '#666666' : '#888888' }}>{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold" style={{ color: color || (isDark ? '#e8e8e8' : '#1a1a1a') }}>
          {value != null ? (isNumeric ? <AnimatedNumber value={value} /> : value) : '—'}
        </span>
        {unit && <span className="text-sm" style={{ color: isDark ? '#666666' : '#888888' }}>{unit}</span>}
        {trend != null && (
          <span className="flex items-center gap-1 text-xs ml-auto">
            {trendIcon}
            <span style={{ color: isDark ? '#666666' : '#888888' }}>{Math.abs(trend).toFixed(1)}%</span>
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs mt-1" style={{ color: isDark ? '#666666' : '#888888' }}>{subtitle}</p>}
    </div>
  )
}
