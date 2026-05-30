import { useMemo } from 'react'
import { subDays, subMonths, format } from 'date-fns'
import { useChartTheme } from '../utils/useChartTheme'

const PRESETS = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '6M', months: 6 },
  { label: '1Y', months: 12 },
]

export default function DateRangeSelector({ dateRange, setDateRange, dataRange }) {
  const t = useChartTheme()

  const handlePreset = (preset) => {
    const end = dataRange[1]
    let start
    if (preset.months) {
      start = format(subMonths(new Date(end), preset.months), 'yyyy-MM-dd')
    } else {
      start = format(subDays(new Date(end), preset.days), 'yyyy-MM-dd')
    }
    setDateRange([start, end])
  }

  const activePreset = useMemo(() => {
    const end = dataRange[1]
    for (const preset of PRESETS) {
      let expected
      if (preset.months) expected = format(subMonths(new Date(end), preset.months), 'yyyy-MM-dd')
      else expected = format(subDays(new Date(end), preset.days), 'yyyy-MM-dd')
      if (dateRange[0] === expected && dateRange[1] === end) return preset.label
    }
    return null
  }, [dateRange, dataRange])

  return (
    <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      {PRESETS.map(preset => {
        const isActive = activePreset === preset.label
        return (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium time-btn ${isActive ? 'time-btn-active' : ''}`}
          >
            {preset.label}
          </button>
        )
      })}
    </div>
  )
}
