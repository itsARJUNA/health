import { useTheme } from './ThemeContext'

export function useChartTheme() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return {
    isDark,
    bg: isDark ? '#141414' : '#ffffff',
    border: isDark ? '#222222' : '#e0e0e0',
    gridStroke: isDark ? '#1e1e1e' : '#f0f0f0',
    axisStroke: isDark ? '#666666' : '#888888',
    textPrimary: isDark ? '#e8e8e8' : '#1a1a1a',
    textSecondary: isDark ? '#999999' : '#555555',
    textMuted: isDark ? '#666666' : '#888888',
    tooltipBg: isDark ? '#141414' : '#ffffff',
    tooltipBorder: isDark ? '#222222' : '#e0e0e0',
    cardHover: isDark ? '#0f2a1f' : '#f0f5e8',
    accent: isDark ? '#4eca8b' : '#0B3D2E',
  }
}
