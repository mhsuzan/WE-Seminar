import { useState, useEffect, useCallback } from 'react'
import { HARDWARE_OPTIONS } from '../utils/calculations'

const KEY = 'green-ai-pinned'
export const MAX_PINS = 4

function load() {
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || '[]')
    if (!Array.isArray(raw)) return []
    return raw
      .filter(s => s && HARDWARE_OPTIONS.some(o => o.value === s.hardware))
      .slice(0, MAX_PINS)
  } catch {
    return []
  }
}

export default function usePinnedScenarios() {
  const [pins, setPins] = useState(load)

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(pins))
    } catch {
      // storage blocked — pins just won't survive a reload
    }
  }, [pins])

  const pin = useCallback((config) => {
    setPins(prev => {
      const exists = prev.some(p =>
        p.complexity === config.complexity &&
        p.hardware === config.hardware &&
        Math.abs(p.gridIntensity - config.gridIntensity) < 0.005
      )
      if (exists || prev.length >= MAX_PINS) return prev
      const used = new Set(prev.map(p => p.name))
      let n = 1
      while (used.has(`Scenario ${String.fromCharCode(64 + n)}`)) n++
      return [...prev, { ...config, id: Date.now(), name: `Scenario ${String.fromCharCode(64 + n)}` }]
    })
  }, [])

  const unpin = useCallback((id) => setPins(prev => prev.filter(p => p.id !== id)), [])
  const clear = useCallback(() => setPins([]), [])

  return { pins, pin, unpin, clear }
}
