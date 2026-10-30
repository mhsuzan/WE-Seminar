import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { calcEverything, hardwareInfo, HARDWARE_OPTIONS, GRID_MIN, GRID_MAX } from '../utils/calculations'

const DEFAULTS = { complexity: 30, hardware: 'cpu', gridIntensity: 0.5, hoursPerDay: 8 }

function readParams() {
  if (typeof window === 'undefined') return DEFAULTS
  const p = new URLSearchParams(window.location.search)
  const h = p.get('h')
  const g = parseFloat(p.get('g'))
  const u = parseInt(p.get('u'))
  return {
    complexity: Math.min(100, Math.max(1, parseInt(p.get('c')) || DEFAULTS.complexity)),
    hardware: HARDWARE_OPTIONS.some(o => o.value === h) ? h : DEFAULTS.hardware,
    gridIntensity: Number.isFinite(g) ? Math.min(GRID_MAX, Math.max(GRID_MIN, g)) : DEFAULTS.gridIntensity,
    hoursPerDay: Number.isFinite(u) ? Math.min(24, Math.max(1, u)) : DEFAULTS.hoursPerDay,
  }
}

export const PRESETS = [
  { label: 'Edge AI', icon: '\u{1F331}', complexity: 8, hardware: 'ane', gridIntensity: 0.2, desc: 'On-device inference' },
  { label: 'Balanced', icon: '\u{2696}\u{FE0F}', complexity: 45, hardware: 'cpu', gridIntensity: 0.5, desc: 'Sensible default' },
  { label: 'Cloud Training', icon: '\u{2601}\u{FE0F}', complexity: 85, hardware: 'cloud_gpu', gridIntensity: 0.8, desc: 'Heavy GPU cluster' },
  { label: 'Green Cloud', icon: '\u{1F33F}', complexity: 60, hardware: 'cloud_gpu', gridIntensity: 0.1, desc: 'Renewable-powered' },
]

export default function useGreenAIConfig() {
  const initial = useMemo(readParams, [])
  const [complexity, setComplexity] = useState(initial.complexity)
  const [hardware, setHardware] = useState(initial.hardware)
  const [gridIntensity, setGridIntensity] = useState(initial.gridIntensity)
  const [hoursPerDay, setHoursPerDay] = useState(initial.hoursPerDay)
  const syncing = useRef(false)

  const hardwareFactor = hardwareInfo(hardware).factor

  const metrics = useMemo(
    () => calcEverything(complexity, hardwareFactor, gridIntensity, hardware),
    [complexity, hardwareFactor, gridIntensity, hardware]
  )

  const applyPreset = useCallback((preset) => {
    setComplexity(preset.complexity)
    setHardware(preset.hardware)
    setGridIntensity(preset.gridIntensity)
  }, [])

  const reset = useCallback(() => {
    setComplexity(DEFAULTS.complexity)
    setHardware(DEFAULTS.hardware)
    setGridIntensity(DEFAULTS.gridIntensity)
    setHoursPerDay(DEFAULTS.hoursPerDay)
  }, [])

  useEffect(() => {
    if (syncing.current) return
    const p = new URLSearchParams()
    p.set('c', complexity)
    p.set('h', hardware)
    p.set('g', gridIntensity.toFixed(2))
    p.set('u', hoursPerDay)
    const qs = p.toString()
    const cur = window.location.search.replace('?', '')
    if (cur !== qs) {
      window.history.replaceState(null, '', `?${qs}`)
    }
  }, [complexity, hardware, gridIntensity, hoursPerDay])

  useEffect(() => {
    function onPop() {
      syncing.current = true
      const p = readParams()
      setComplexity(p.complexity)
      setHardware(p.hardware)
      setGridIntensity(p.gridIntensity)
      setHoursPerDay(p.hoursPerDay)
      syncing.current = false
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return {
    complexity, setComplexity,
    hardware, setHardware,
    gridIntensity, setGridIntensity,
    hoursPerDay, setHoursPerDay,
    hardwareFactor, applyPreset, reset,
    ...metrics,
  }
}
