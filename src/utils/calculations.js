// maxComplexity: largest model the chip can serve in real time (used by the optimiser and a warning).
export const HARDWARE_OPTIONS = [
  { label: 'Apple Neural Engine', short: 'ANE', value: 'ane', maxComplexity: 40, factor: 0.3, description: 'On-device AI chip' },
  { label: 'NPU (AI Boost)', short: 'NPU', value: 'npu', maxComplexity: 45, factor: 0.35, description: 'Integrated laptop NPU' },
  { label: 'Edge TPU', short: 'Edge TPU', value: 'edge_tpu', maxComplexity: 35, factor: 0.5, description: 'Low power AI accelerator' },
  { label: 'ARM CPU (M-series)', short: 'ARM CPU', value: 'arm_cpu', maxComplexity: 60, factor: 0.6, description: 'Apple Silicon efficiency cores' },
  { label: 'Standard CPU', short: 'CPU', value: 'cpu', maxComplexity: 70, factor: 1.0, description: 'General-purpose processor' },
  { label: 'AWS Inferentia2', short: 'Inferentia2', value: 'inferentia', maxComplexity: 90, factor: 1.8, description: 'Cloud inference chip' },
  { label: 'Mid-range GPU', short: 'Mid GPU', value: 'mid_gpu', maxComplexity: 85, factor: 2.5, description: 'Consumer RTX-class GPU' },
  { label: 'Cloud GPU (A100)', short: 'A100', value: 'cloud_gpu', maxComplexity: 100, factor: 5.0, description: 'High-throughput AI GPU' },
  { label: 'NVIDIA H100', short: 'H100', value: 'h100', maxComplexity: 100, factor: 6.5, description: 'Current-gen AI training GPU' },
  { label: 'TPU v5p', short: 'TPU v5p', value: 'tpu_v5', maxComplexity: 100, factor: 8.0, description: 'Google TPU pod' },
]

export const GRID_MIN = 0.02
export const GRID_MAX = 1.0

// Approximate annual-average grid intensity (kg CO₂ per kWh). Real values shift year to year.
export const GRID_REGIONS = [
  { label: 'Norway', value: 0.03 },
  { label: 'France', value: 0.06 },
  { label: 'UK', value: 0.21 },
  { label: 'EU avg', value: 0.25 },
  { label: 'USA', value: 0.37 },
  { label: 'Germany', value: 0.38 },
  { label: 'Bangladesh', value: 0.57 },
  { label: 'China', value: 0.58 },
  { label: 'India', value: 0.71 },
  { label: 'South Africa', value: 0.9 },
]

export const MAX_ENERGY = 800
export const ELECTRICITY_PRICE = 0.40 // € per kWh
export const TREE_KG_PER_YEAR = 21 // CO₂ absorbed by one mature tree per year

const HW_COST = {
  ane: 0, npu: 0, edge_tpu: 0.10, arm_cpu: 0,
  cpu: 0.08, inferentia: 0.65, mid_gpu: 0.30,
  cloud_gpu: 2.50, h100: 3.50, tpu_v5: 4.00,
}

export function hardwareInfo(value) {
  return HARDWARE_OPTIONS.find(h => h.value === value) || HARDWARE_OPTIONS[4]
}

const TIPS = [
  {
    check: (c, h, g) => g > 0.7,
    text: (c, h, g) =>
      `Your grid is coal-heavy (${g.toFixed(2)} kg/kWh). Scheduling in regions with hydro or solar could cut CO₂ by 80%+ without changing hardware.`,
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
  if (km < 2) {
    const phones = Math.round(co2 / 0.008)
    return { value: phones || 1, unit: 'smartphone charges' }
  }
  return { value: km, unit: 'km driven (petrol car)' }
}

export function calcOperatingCost(energy, hardware) {
  const electricity = Math.round(energy * ELECTRICITY_PRICE * 100) / 100
  const hardwareCost = HW_COST[hardware] ?? 0.08
  const total = Math.round((electricity + hardwareCost) * 100) / 100
  return { electricity, hardware: hardwareCost, total }
}

export function getTip(complexity, hardware, gridIntensity, accuracy, energy, efficiencyScore, co2) {
  const hwLabel = hardwareInfo(hardware).label
  const match = TIPS.find(t => t.check(complexity, hardware, gridIntensity, accuracy, energy, efficiencyScore, co2))
  return match
    ? match.text(complexity, hardware, gridIntensity, accuracy, energy, efficiencyScore, co2, hwLabel)
    : 'Adjust the controls to explore how model size, hardware choice, and grid mix shape environmental impact.'
}

// Yearly totals for a workload that runs `hoursPerDay` every day.
// gridFactor scales CO₂ for the time of day it runs (see windowFactor).
export function calcAnnual(energy, co2, cost, hoursPerDay, gridFactor = 1) {
  const hours = hoursPerDay * 365
  const co2Kg = co2 * gridFactor * hours
  return {
    hours,
    energyKwh: energy * hours,
    co2Kg,
    cost: cost.total * hours,
    trees: Math.ceil(co2Kg / TREE_KG_PER_YEAR),
  }
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

export function calcScenario({ complexity, hardware, gridIntensity }) {
  return calcEverything(complexity, hardwareInfo(hardware).factor, gridIntensity, hardware)
}

// ---- Time of day ---------------------------------------------------------
// Illustrative daily shape of a grid with solar: cleanest around midday, dirtiest at the evening peak.
// Multipliers average to 1, so the slider value stays the daily mean.
export const HOURLY_PROFILE = (() => {
  const raw = Array.from({ length: 24 }, (_, h) =>
    1 - 0.35 * Math.exp(-((h - 13) ** 2) / 18) + 0.15 * Math.exp(-((h - 19.5) ** 2) / 8))
  const mean = raw.reduce((a, b) => a + b, 0) / 24
  return raw.map(r => r / mean)
})()

export function windowHours(startHour, hoursPerDay) {
  return Array.from({ length: hoursPerDay }, (_, i) => (startHour + i) % 24)
}

export function windowFactor(startHour, hoursPerDay) {
  const hrs = windowHours(startHour, hoursPerDay)
  return hrs.reduce((a, h) => a + HOURLY_PROFILE[h], 0) / hrs.length
}

export function greenestStart(hoursPerDay) {
  let best = 0
  for (let s = 1; s < 24; s++) {
    if (windowFactor(s, hoursPerDay) < windowFactor(best, hoursPerDay) - 1e-9) best = s
  }
  return best
}

// ---- Training vs usage ---------------------------------------------------
// One-off training energy, assumed on an A100-class cluster. Complexity 100 lands near
// GPT-3's published estimate (~1,287 MWh), so the scale is roughly right.
export const GPT3_TRAINING_KWH = 1287000

export function calcTrainingKwh(complexity) {
  return Math.round(250 * complexity ** 1.8)
}

// ---- Everyday equivalents ------------------------------------------------
export const EQUIVALENTS = {
  flightKg: 1000, // one passenger, Dhaka → London, one way (approx.)
  carKgPerKm: 0.25,
  phoneChargeKg: 0.008,
  homeKwhPerYear: 3600, // typical European household electricity use
}

// ---- Optimiser -----------------------------------------------------------
// Cheapest-in-CO₂ (or cost) setup that still reaches `minAccuracy`, respecting each chip's capacity.
export function findGreenest({ minAccuracy, grids, objective = 'co2' }) {
  let best = null
  for (const hw of HARDWARE_OPTIONS) {
    let complexity = null
    for (let c = 1; c <= hw.maxComplexity; c++) {
      if (calcAccuracy(c) >= minAccuracy) { complexity = c; break }
    }
    if (complexity === null) continue
    for (const g of grids) {
      const cfg = { complexity, hardware: hw.value, gridIntensity: g }
      const m = calcScenario(cfg)
      const score = objective === 'cost' ? [m.cost.total, m.co2] : [m.co2, m.cost.total]
      if (!best || score[0] < best.score[0] || (score[0] === best.score[0] && score[1] < best.score[1])) {
        best = { config: cfg, metrics: m, score }
      }
    }
  }
  return best
}
