import AnimatedNumber from './AnimatedNumber'

const GOOD = { text: 'text-emerald-300', bar: 'bg-emerald-400', ring: 'border-emerald-500/25' }
const MID = { text: 'text-amber-300', bar: 'bg-amber-400', ring: 'border-amber-500/25' }
const BAD = { text: 'text-rose-300', bar: 'bg-rose-400', ring: 'border-rose-500/25' }

function tone(value, type) {
  switch (type) {
    case 'energy': return value > 200 ? BAD : value > 50 ? MID : GOOD
    case 'co2': return value > 100 ? BAD : value > 25 ? MID : GOOD
    case 'accuracy': return value >= 80 ? GOOD : value >= 40 ? MID : BAD
    case 'efficiency': return value >= 60 ? GOOD : value >= 30 ? MID : BAD
    default: return MID
  }
}

export default function Metrics({ accuracy, energy, efficiencyScore, co2, equivalency, cost }) {
  const cards = [
    { label: 'Energy', val: energy, unit: 'kWh', type: 'energy', decimals: 1, bar: Math.min(100, energy / 8), note: 'per hour of operation' },
    { label: 'CO₂ emissions', val: co2, unit: 'kg', type: 'co2', decimals: 1, bar: Math.min(100, co2 / 8), note: `≈ ${equivalency.value.toLocaleString()} ${equivalency.unit}` },
    { label: 'Accuracy', val: accuracy, unit: '%', type: 'accuracy', decimals: 0, bar: accuracy, note: 'modelled task accuracy' },
    { label: 'Efficiency score', val: efficiencyScore, unit: '/100', type: 'efficiency', decimals: 0, bar: efficiencyScore, note: '45% accuracy · 55% energy' },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {cards.map(c => {
          const t = tone(c.val, c.type)
          return (
            <div key={c.label} className={`bg-slate-900/60 border ${t.ring} rounded-2xl p-4 transition-colors duration-300`}>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">{c.label}</div>
              <div className={`mt-1 text-2xl sm:text-3xl font-bold font-mono tabular-nums ${t.text}`}>
                <AnimatedNumber value={c.val} decimals={c.decimals} />
                <span className="text-sm font-normal text-slate-500 ml-1">{c.unit}</span>
              </div>
              <div className="mt-3 h-1 rounded-full bg-slate-800 overflow-hidden">
                <div className={`h-full rounded-full ${t.bar} transition-all duration-500`} style={{ width: `${Math.max(2, c.bar)}%` }} />
              </div>
              <div className="mt-2 text-[11px] text-slate-500 leading-tight truncate" title={c.note}>{c.note}</div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-slate-500">
        <span>Estimated running cost</span>
        <span className="text-slate-200 font-mono font-semibold">&euro;{cost.total.toFixed(2)}/hr</span>
        <span className="text-slate-600">
          (energy &euro;{cost.electricity.toFixed(2)} + hardware &euro;{cost.hardware.toFixed(2)})
        </span>
      </div>
    </div>
  )
}
