import Papa from 'papaparse'
import cyclesRaw from '../data/physiological_cycles.csv?raw'
import sleepsRaw from '../data/sleeps.csv?raw'
import workoutsRaw from '../data/workouts.csv?raw'
import journalRaw from '../data/journal_entries.csv?raw'

function parseCsv(text) {
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
  return data
}

export async function loadAllData() {
  const cycles = parseCsv(cyclesRaw)
  const sleeps = parseCsv(sleepsRaw)
  const workouts = parseCsv(workoutsRaw)
  const journal = parseCsv(journalRaw)

  return {
    cycles: cycles.map(row => ({
      date: (row['Wake onset'] || row['Cycle end time'] || row['Cycle start time'])?.split(' ')[0],
      recovery: parseFloat(row['Recovery score %']) || null,
      restingHR: parseFloat(row['Resting heart rate (bpm)']) || null,
      hrv: parseFloat(row['Heart rate variability (ms)']) || null,
      skinTemp: parseFloat(row['Skin temp (celsius)']) || null,
      spo2: parseFloat(row['Blood oxygen %']) || null,
      strain: parseFloat(row['Day Strain']) || null,
      calories: parseFloat(row['Energy burned (cal)']) || null,
      maxHR: parseFloat(row['Max HR (bpm)']) || null,
      avgHR: parseFloat(row['Average HR (bpm)']) || null,
      respiratoryRate: parseFloat(row['Respiratory rate (rpm)']) || null,
      sleepPerformance: parseFloat(row['Sleep performance %']) || null,
      sleepEfficiency: parseFloat(row['Sleep efficiency %']) || null,
      sleepConsistency: parseFloat(row['Sleep consistency %']) || null,
      sleepDuration: parseFloat(row['Asleep duration (min)']) || null,
      sleepNeed: parseFloat(row['Sleep need (min)']) || null,
      sleepDebt: parseFloat(row['Sleep debt (min)']) || null,
      lightSleep: parseFloat(row['Light sleep duration (min)']) || null,
      deepSleep: parseFloat(row['Deep (SWS) duration (min)']) || null,
      remSleep: parseFloat(row['REM duration (min)']) || null,
      awakeDuration: parseFloat(row['Awake duration (min)']) || null,
    })).filter(r => r.date).sort((a, b) => a.date.localeCompare(b.date)),

    sleeps: sleeps.map(row => ({
      date: row['Cycle start time']?.split(' ')[0],
      performance: parseFloat(row['Sleep performance %']) || null,
      respiratoryRate: parseFloat(row['Respiratory rate (rpm)']) || null,
      asleep: parseFloat(row['Asleep duration (min)']) || null,
      inBed: parseFloat(row['In bed duration (min)']) || null,
      light: parseFloat(row['Light sleep duration (min)']) || null,
      deep: parseFloat(row['Deep (SWS) duration (min)']) || null,
      rem: parseFloat(row['REM duration (min)']) || null,
      awake: parseFloat(row['Awake duration (min)']) || null,
      need: parseFloat(row['Sleep need (min)']) || null,
      debt: parseFloat(row['Sleep debt (min)']) || null,
      efficiency: parseFloat(row['Sleep efficiency %']) || null,
      consistency: parseFloat(row['Sleep consistency %']) || null,
      isNap: row['Nap'] === 'true',
    })).filter(r => r.date && !r.isNap).sort((a, b) => a.date.localeCompare(b.date)),

    workouts: workouts.map(row => ({
      date: row['Workout start time']?.split(' ')[0],
      startTime: row['Workout start time'],
      endTime: row['Workout end time'],
      duration: parseFloat(row['Duration (min)']) || null,
      activity: row['Activity name'] || 'Unknown',
      strain: parseFloat(row['Activity Strain']) || null,
      calories: parseFloat(row['Energy burned (cal)']) || null,
      maxHR: parseFloat(row['Max HR (bpm)']) || null,
      avgHR: parseFloat(row['Average HR (bpm)']) || null,
      zone1: parseFloat(row['HR Zone 1 %']) || 0,
      zone2: parseFloat(row['HR Zone 2 %']) || 0,
      zone3: parseFloat(row['HR Zone 3 %']) || 0,
      zone4: parseFloat(row['HR Zone 4 %']) || 0,
      zone5: parseFloat(row['HR Zone 5 %']) || 0,
    })).filter(r => r.date).sort((a, b) => a.date.localeCompare(b.date)),

    journal: journal.map(row => ({
      date: row['Cycle start time']?.split(' ')[0],
      question: row['Question text'],
      answeredYes: row['Answered yes'] === 'true',
    })).filter(r => r.date),
  }
}

export function getRecoveryColor(value) {
  if (value >= 67) return '#16a34a'
  if (value >= 34) return '#f59e0b'
  return '#dc2626'
}

export function getStrainColor(value) {
  if (value >= 18) return '#dc2626'
  if (value >= 14) return '#f59e0b'
  if (value >= 10) return '#3b82f6'
  return '#16a34a'
}

export function formatDuration(minutes) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function avg(arr) {
  const valid = arr.filter(v => v != null)
  if (valid.length === 0) return null
  return valid.reduce((a, b) => a + b, 0) / valid.length
}
