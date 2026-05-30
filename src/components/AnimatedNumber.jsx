import { useState, useEffect, useRef } from 'react'

export default function AnimatedNumber({ value, duration = 600 }) {
  const [display, setDisplay] = useState(value)
  const prevRef = useRef(value)
  const frameRef = useRef(null)

  useEffect(() => {
    const from = prevRef.current || 0
    const to = parseFloat(value) || 0

    if (isNaN(from) || isNaN(to) || from === to) {
      setDisplay(value)
      prevRef.current = value
      return
    }

    const startTime = performance.now()
    const diff = to - from

    const animate = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = from + diff * eased

      if (Number.isInteger(to)) {
        setDisplay(Math.round(current).toString())
      } else {
        setDisplay(current.toFixed(1))
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(value)
        prevRef.current = value
      }
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [value, duration])

  return display
}
