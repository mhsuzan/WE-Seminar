import { useState, useEffect, useRef } from 'react'

export default function AnimatedNumber({ value, decimals = 0, duration = 400 }) {
  const [display, setDisplay] = useState(value)
  const raf = useRef()
  const prev = useRef(value)

  useEffect(() => {
    if (value === prev.current) return
    const start = prev.current
    const end = value
    const t0 = performance.now()

    function tick(now) {
      const t = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const cur = start + (end - start) * eased
      setDisplay(cur)
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else prev.current = end
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])

  return <span>{display.toFixed(decimals)}</span>
}
