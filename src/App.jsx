import { useState, useEffect, useMemo } from 'react'
import { loadAllData, avg, getRecoveryColor, getStrainColor, formatDuration } from './utils/loadData'
import MetricCard from './components/MetricCard'
import RecoveryChart from './components/RecoveryChart'
import StrainChart from './components/StrainChart'
import SleepChart from './components/SleepChart'
import HRVChart from './components/HRVChart'
import WorkoutsTable from './components/WorkoutsTable'
import WorkoutsPieChart from './components/WorkoutsPieChart'
import DateRangeSelector from './components/DateRangeSelector'
import WeeklyHeatmap from './components/WeeklyHeatmap'
import SleepPerformanceChart from './components/SleepPerformanceChart'
import SleepDebtChart from './components/SleepDebtChart'
import PersonalBests from './components/PersonalBests'
import { Activity, Moon, Heart, Dumbbell } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'recovery', label: 'Recovery', icon: Heart },
  { id: 'sleep', label: 'Sleep', icon: Moon },
  { id: 'workouts', label: 'Workouts', icon: Dumbbell },
]

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[var(--color-accent-text)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sm text-[var(--color-text-muted)]">Loading your WHOOP data...</p>
      </div>
    </div>
  )
}

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState(['', ''])

  useEffect(() => {
    loadAllData().then(d => {
      setData(d)
      const dates = d.cycles.map(c => c.date).filter(Boolean)
      setDateRange([dates[0], dates[dates.length - 1]])
      setLoading(false)
    })
  }, [])

  const dataRange = useMemo(() => {
    if (!data) return ['', '']
    const dates = data.cycles.map(c => c.date).filter(Boolean)
    return [dates[0], dates[dates.length - 1]]
  }, [data])

  const metrics = useMemo(() => {
    if (!data) return {}
    const filtered = data.cycles.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1])
    const allDates = data.cycles.map(c => c.date).filter(Boolean)
    const totalDays = allDates.length
    const isFullRange = filtered.length >= totalDays * 0.9

    const half = Math.floor(filtered.length / 2)
    const first = filtered.slice(0, half)
    const second = filtered.slice(half)

    const calcTrend = (key) => {
      if (isFullRange) return null
      const a = avg(first.map(d => d[key]))
      const b = avg(second.map(d => d[key]))
      if (!a || !b) return null
      return ((b - a) / a) * 100
    }

    return {
      recovery: avg(filtered.map(d => d.recovery)),
      recoveryTrend: calcTrend('recovery'),
      strain: avg(filtered.map(d => d.strain)),
      strainTrend: calcTrend('strain'),
      hrv: avg(filtered.map(d => d.hrv)),
      hrvTrend: calcTrend('hrv'),
      rhr: avg(filtered.map(d => d.restingHR)),
      rhrTrend: calcTrend('restingHR'),
      sleepDuration: avg(data.sleeps.filter(s => s.date >= dateRange[0] && s.date <= dateRange[1] && s.asleep).map(s => s.asleep)),
      sleepTrend: isFullRange ? null : (() => {
        const sleepFiltered = data.sleeps.filter(s => s.date >= dateRange[0] && s.date <= dateRange[1] && s.asleep)
        const sh = Math.floor(sleepFiltered.length / 2)
        const a = avg(sleepFiltered.slice(0, sh).map(s => s.asleep))
        const b = avg(sleepFiltered.slice(sh).map(s => s.asleep))
        if (!a || !b) return null
        return ((b - a) / a) * 100
      })(),
      sleepPerformance: avg(filtered.map(d => d.sleepPerformance)),
      calories: avg(filtered.map(d => d.calories)),
      caloriesTrend: calcTrend('calories'),
    }
  }, [data, dateRange])

  if (loading) return <LoadingScreen />

  return (
    <div className="min-h-screen md:flex" style={{ background: '#0a0a0a', color: '#e8e8e8' }}>
      {/* Sidebar - hidden on mobile */}
      <aside
        className="hidden md:flex w-56 p-5 flex-col shrink-0 sticky top-0 h-screen"
        style={{ borderRight: '1px solid #222222', background: '#141414' }}
      >
        <div className="mb-8">
          <h1 className="text-2xl tracking-tight leading-tight" style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#4eca8b' }}>
            Arjuna's Health Tracker
          </h1>
          <p className="text-xs mt-1" style={{ color: '#666666' }}>Data collected via WHOOP</p>
        </div>

        <nav className="flex-1 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm nav-btn ${isActive ? 'nav-btn-active' : ''}`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </nav>

        <div className="pt-4" style={{ borderTop: '1px solid #222222' }}>
          <p className="text-[10px]" style={{ color: '#666666' }}>{data.cycles.length} days tracked</p>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-10 px-4 py-3" style={{ background: '#141414', borderBottom: '1px solid #222222' }}>
        <h1 className="text-lg tracking-tight" style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#4eca8b' }}>
          Arjuna's Health Tracker
        </h1>
        <p className="text-[10px]" style={{ color: '#666666' }}>Data collected via WHOOP</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-20 md:pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold" style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#4eca8b' }}>
                {TABS.find(t => t.id === activeTab)?.label}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#666666' }}>
                {dateRange[0]} — {dateRange[1]}
              </p>
            </div>
            <DateRangeSelector dateRange={dateRange} setDateRange={setDateRange} dataRange={dataRange} />
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-5 tab-content" key="overview">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard title="Recovery" value={metrics.recovery?.toFixed(0)} unit="%" trend={metrics.recoveryTrend} color={getRecoveryColor(metrics.recovery)} />
                <MetricCard title="Avg Strain" value={metrics.strain?.toFixed(1)} trend={metrics.strainTrend} color={getStrainColor(metrics.strain)} />
                <MetricCard title="Avg Calories" value={metrics.calories?.toFixed(0)} unit="cal" trend={metrics.caloriesTrend} color="#f59e0b" />
                <MetricCard title="Sleep" value={formatDuration(metrics.sleepDuration)} trend={metrics.sleepTrend} color="#a855f7" subtitle={`${metrics.sleepPerformance?.toFixed(0) ?? '—'}% performance`} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <RecoveryChart data={data.cycles} dateRange={dateRange} />
                <WorkoutsPieChart data={data.workouts} dateRange={dateRange} />
              </div>
              <PersonalBests cycles={data.cycles} sleeps={data.sleeps} workouts={data.workouts} dateRange={dateRange} />
              <WeeklyHeatmap data={data.cycles} dateRange={dateRange} />
            </div>
          )}

          {activeTab === 'recovery' && (
            <div className="space-y-5 tab-content" key="recovery">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard title="Avg Recovery" value={metrics.recovery?.toFixed(0)} unit="%" color={getRecoveryColor(metrics.recovery)} trend={metrics.recoveryTrend} />
                <MetricCard title="HRV" value={metrics.hrv?.toFixed(0)} unit="ms" color="#10b981" trend={metrics.hrvTrend} />
                <MetricCard title="Resting HR" value={metrics.rhr?.toFixed(0)} unit="bpm" color="#f43f5e" trend={metrics.rhrTrend} />
                <MetricCard title="Avg Strain" value={metrics.strain?.toFixed(1)} color={getStrainColor(metrics.strain)} />
              </div>
              <RecoveryChart data={data.cycles} dateRange={dateRange} />
              <HRVChart data={data.cycles} dateRange={dateRange} />
              <WeeklyHeatmap data={data.cycles} dateRange={dateRange} />
            </div>
          )}

          {activeTab === 'sleep' && (
            <div className="space-y-5 tab-content" key="sleep">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard title="Avg Duration" value={formatDuration(metrics.sleepDuration)} color="#a855f7" trend={metrics.sleepTrend} />
                <MetricCard title="Performance" value={metrics.sleepPerformance?.toFixed(0)} unit="%" color="#3b82f6" />
                <MetricCard title="Avg Deep" value={formatDuration(avg(data.cycles.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1]).map(d => d.deepSleep)))} color="#6366f1" />
                <MetricCard title="Avg REM" value={formatDuration(avg(data.cycles.filter(d => d.date >= dateRange[0] && d.date <= dateRange[1]).map(d => d.remSleep)))} color="#a855f7" />
              </div>
              <SleepChart data={data.sleeps} dateRange={dateRange} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <SleepPerformanceChart data={data.sleeps} dateRange={dateRange} />
                <SleepDebtChart data={data.sleeps} dateRange={dateRange} />
              </div>
            </div>
          )}

          {activeTab === 'workouts' && (
            <div className="space-y-5 tab-content" key="workouts">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard title="Total Workouts" value={data.workouts.filter(w => w.date >= dateRange[0] && w.date <= dateRange[1]).length} color="#3b82f6" />
                <MetricCard title="Avg Strain" value={avg(data.workouts.filter(w => w.date >= dateRange[0] && w.date <= dateRange[1]).map(w => w.strain))?.toFixed(1)} color={getStrainColor(avg(data.workouts.filter(w => w.date >= dateRange[0] && w.date <= dateRange[1]).map(w => w.strain)))} />
                <MetricCard title="Avg Duration" value={formatDuration(avg(data.workouts.filter(w => w.date >= dateRange[0] && w.date <= dateRange[1]).map(w => w.duration)))} color="#f59e0b" />
                <MetricCard title="Avg Calories" value={metrics.calories?.toFixed(0)} unit="cal/day" color="#f59e0b" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <StrainChart data={data.cycles} dateRange={dateRange} />
                <WorkoutsPieChart data={data.workouts} dateRange={dateRange} />
              </div>
              <WorkoutsTable data={data.workouts} dateRange={dateRange} />
            </div>
          )}

        </div>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 flex items-center justify-around py-2" style={{ background: '#141414', borderTop: '1px solid #222222' }}>
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 transition-all"
              style={{ color: isActive ? '#4eca8b' : '#666666' }}
            >
              <Icon size={18} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
