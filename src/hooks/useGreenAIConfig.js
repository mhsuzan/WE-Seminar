import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { calcEverything, HARDWARE_OPTIONS } from '../utils/calculations'

function readParams() {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  return {
    complexity: Math.min(100, Math.max(1, parseInt(p.get('c')) || 30)),
    hardware: p.get('h') || 'cpu',
    gridIntensity: Math.min(1, Math.max(0.1, parseFloat(p.get('g')) || 0.5)),
  }
}

const DEFAULTS = { complexity: 30, hardware: 'cpu', gridIntensity: 0.5 }

export const PRESETS = [
  { label: 'Edge AI', icon: '\u{1F331}', complexity: 8, hardware: 'ane', gridIntensity: 0.2, desc: 'On-device inference' },
  { label: 'Balanced', icon: '\u{2696}\u{FE0F}', complexity: 45, hardware: 'cpu', gridIntensity: 0.5, desc: 'Sensible default' },
  { label: 'Cloud Training', icon: '\u{2601}\u{FE0F}', complexity: 85, hardware: 'cloud_gpu', gridIntensity: 0.8, desc: 'Heavy GPU cluster' },
  { label: 'Green Cloud', icon: '\u{1F33F}', complexity: 60, hardware: 'cloud_gpu', gridIntensity: 0.1, desc: 'Renewable-powered' },
]

export default function useGreenAIConfig() {
  const [complexity, setComplexity] = useState(() => readParams().complexity)
  const [hardware, setHardware] = useState(() => readParams().hardware)
  const [gridIntensity, setGridIntensity] = useState(() => readParams().gridIntensity)
  const syncing = useRef(false)

  const hardwareFactor = HARDWARE_OPTIONS.find(h => h.value === hardware).factor

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
  }, [])

  useEffect(() => {
    if (syncing.current) return
    const p = new URLSearchParams()
    p.set('c', complexity)
    p.set('h', hardware)
    p.set('g', gridIntensity.toFixed(2))
    const qs = p.toString()
    const cur = window.location.search.replace('?', '')
    if (cur !== qs) {
      window.history.replaceState(null, '', `?${qs}`)
    }
  }, [complexity, hardware, gridIntensity])

  useEffect(() => {
    function onPop() {
      syncing.current = true
      const p = readParams()
      setComplexity(p.complexity)
      setHardware(p.hardware)
      setGridIntensity(p.gridIntensity)
      syncing.current = false
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return {
    complexity, setComplexity,
    hardware, setHardware,
    gridIntensity, setGridIntensity,
    hardwareFactor, applyPreset, reset,
    ...metrics,
  }
}
