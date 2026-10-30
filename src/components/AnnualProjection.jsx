import { calcAnnual, TREE_KG_PER_YEAR } from '../utils/calculations'

function fmt(n, unit) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M ${unit}`
  if (n >= 1e4) return `${(n / 1e3).toFixed(1)}k ${unit}`
  return `${Math.round(n).toLocaleString()} ${unit}`
}

export default function AnnualProjection({ energy, co2, cost, hoursPerDay }) {
  const a = calcAnnual(energy, co2, cost, hoursPerDay)
  const tonnes = a.co2Kg / 1000
  const items = [
    { label: 'Energy / year', value: fmt(a.energyKwh, 'kWh'), color: 'text-amber-300' },
    { label: 'CO₂ / year', value: tonnes >= 1 ? `${tonnes.toFixed(1)} t` : fmt(a.co2Kg, 'kg'), color: 'text-rose-300' },
    { label: 'Cost / year', value: `€${fmt(a.cost, '').trim()}`, color: 'text-slate-100' },
    { label: 'Trees to offset', value: a.trees.toLocaleString(), color: 'text-emerald-300' },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(i => (
          <div key={i.label} className="bg-slate-800/50 rounded-xl px-3 py-3">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider">{i.label}</div>
            <div className={`mt-0.5 text-lg font-bold font-mono tabular-nums ${i.color}`}>{i.value}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">
        Running {hoursPerDay} h/day for 365 days ({a.hours.toLocaleString()} h).
        A mature tree absorbs about {TREE_KG_PER_YEAR} kg CO&#8322; a year.
      </p>
    </div>
  )
}
