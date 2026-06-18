export const HARDWARE_OPTIONS = [
  { label: 'Apple Neural Engine', value: 'ane', factor: 0.3, description: 'On-device AI chip' },
  { label: 'NPU (AI Boost)', value: 'npu', factor: 0.35, description: 'Integrated laptop NPU' },
  { label: 'Edge TPU', value: 'edge_tpu', factor: 0.5, description: 'Low power AI accelerator' },
  { label: 'ARM CPU (M-series)', value: 'arm_cpu', factor: 0.6, description: 'Apple Silicon efficiency cores' },
  { label: 'Standard CPU', value: 'cpu', factor: 1.0, description: 'General-purpose processor' },
  { label: 'AWS Inferentia2', value: 'inferentia', factor: 1.8, description: 'Cloud inference chip' },
  { label: 'Mid-range GPU', value: 'mid_gpu', factor: 2.5, description: 'Consumer RTX-class GPU' },
  { label: 'Cloud GPU (A100)', value: 'cloud_gpu', factor: 5.0, description: 'High-throughput AI GPU' },
  { label: 'NVIDIA H100', value: 'h100', factor: 6.5, description: 'Current-gen AI training GPU' },
  { label: 'TPU v5p', value: 'tpu_v5', factor: 8.0, description: 'Google TPU pod' },
]

const MAX_ENERGY = 800

const HW_COST = {
  ane: 0, npu: 0, edge_tpu: 0.10, arm_cpu: 0,
  cpu: 0.08, inferentia: 0.65, mid_gpu: 0.30,
  cloud_gpu: 2.50, h100: 3.50, tpu_v5: 4.00,
}

const TIPS = [
  {
    check: (c, h, g) => g > 0.7,
    text: (c, h, g, a, e, es, co2, hl) =>
      `Your grid is coal-heavy (${g.toFixed(2)}). Scheduling in regions with hydro or solar could cut CO₂ by 80%+ without changing hardware.`,
  },
  {
    check: (c, h, g) => g < 0.2,
    text: () =>
      `You're running on a near-renewable grid — your CO₂ footprint is as low as it gets for any given energy use.`,
  },
  {
    check: (c, h) => c < 15 && (h === 'cloud_gpu' || h === 'h100' || h === 'tpu_v5'),
    text: (c, h, g, a, e, es, co2, hl) =>
      `A complexity-${c} model on ${hl} is overkill. Try Edge TPU or NPU for up to 10x energy savings with similar accuracy.`,
  },
  {
    check: (c, h) => c > 80 && (h === 'ane' || h === 'npu' || h === 'edge_tpu'),
    text: (c, h, g, a, e, es, co2, hl) =>
      `A complexity-${c} model on ${hl} may be too slow for real-time use. Consider cloud GPU or model distillation.`,
  },
  {
    check: (c, h, g, a, e) => a > 90 && e > 100,
    text: (c, h, g, a, e) =>
      `High accuracy (${a}%) at ${e} kWh — you're past the diminishing returns knee. Pruning or quantization can cut energy 2-4x with <1% accuracy loss.`,
  },
  {
    check: (c, h, g, a, e, es) => es > 75,
    text: (c, h, g, a, e, es) =>
      `Efficiency score of ${es}/100 — excellent balance. This configuration hits the sweet spot for sustainable AI.`,
  },
  {
    check: (c, h, g, a, e, es) => es < 30,
    text: (c, h, g, a, e, es) =>
      `Efficiency score of ${es}/100 — energy-intensive for the accuracy delivered. Try reducing complexity or switching to efficient hardware.`,
  },
  {
    check: (c, h) => h === 'ane' || h === 'npu' || h === 'edge_tpu' || h === 'arm_cpu',
    text: (c, h, g, a, e, es, co2, hl) =>
      `${hl} enables on-device inference — zero latency, no cloud egress cost, and minimal power. Ideal for real-time applications.`,
  },
]

export function calcAccuracy(complexity) {
  const raw = 97 / (1 + Math.exp(-0.08 * (complexity - 38)))
  return Math.max(5, Math.round(raw))
}

export function calcEnergy(complexity, hardwareFactor) {
  return Math.round(complexity * hardwareFactor * 10) / 10
}

export function calcChartEfficiency(energy) {
  return Math.max(0, Math.min(100, Math.round(100 - (Math.min(MAX_ENERGY, energy) / MAX_ENERGY) * 100)))
}

export function calcEfficiencyScore(accuracy, energy) {
  const energyNorm = Math.min(100, (energy / MAX_ENERGY) * 100)
  return Math.round(0.45 * accuracy + 0.55 * Math.max(0, 100 - energyNorm))
}

export function calcCo2(energy, gridIntensity) {
  return Math.round(energy * gridIntensity * 10) / 10
}

export function getCo2Equivalency(co2) {
  const km = Math.round(co2 / 0.25)
  if (km <= 0) {
    const phones = Math.round(co2 / 0.008)
    return { value: phones || 1, unit: 'smartphone charges' }
  }
  if (km < 2) {
    const phones = Math.round(co2 / 0.008)
    return { value: phones, unit: 'smartphone charges' }
  }
  return { value: km, unit: 'km driven (petrol car)' }
}

export function calcOperatingCost(energy, hardware) {
  const electricity = Math.round(energy * 0.40 * 100) / 100
  const hardwareCost = HW_COST[hardware] ?? 0.08
  const total = Math.round((electricity + hardwareCost) * 100) / 100
  return { electricity, hardware: hardwareCost, total }
}

export function getTip(complexity, hardware, gridIntensity, accuracy, energy, efficiencyScore, co2) {
  const hwLabel = HARDWARE_OPTIONS.find(h => h.value === hardware)?.label || hardware
  const match = TIPS.find(t => t.check(complexity, hardware, gridIntensity, accuracy, energy, efficiencyScore, co2))
  return match
    ? match.text(complexity, hardware, gridIntensity, accuracy, energy, efficiencyScore, co2, hwLabel)
    : 'Adjust the controls to explore how model size, hardware choice, and grid mix shape environmental impact.'
}

export function calcEverything(complexity, hardwareFactor, gridIntensity, hardware) {
  const accuracy = calcAccuracy(complexity)
  const energy = calcEnergy(complexity, hardwareFactor)
  const chartEfficiency = calcChartEfficiency(energy)
  const efficiencyScore = calcEfficiencyScore(accuracy, energy)
  const co2 = calcCo2(energy, gridIntensity)
  const equivalency = getCo2Equivalency(co2)
  const cost = calcOperatingCost(energy, hardware)
  const tip = getTip(complexity, hardware, gridIntensity, accuracy, energy, efficiencyScore, co2)
  return { accuracy, energy, chartEfficiency, efficiencyScore, co2, equivalency, cost, tip }
}
