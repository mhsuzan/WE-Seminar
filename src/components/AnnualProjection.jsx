import { calcAnnual, TREE_KG_PER_YEAR, EQUIVALENTS } from '../utils/calculations'

export function fmt(n, unit = '') {
  const s = n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e4 ? `${(n / 1e3).toFixed(1)}k` : n >= 10 ? Math.round(n).toLocaleString() : n.toFixed(1)
  return unit ? `${s} ${unit}` : s
}

export function everydayEquivalents(a) {
  return [
    { icon: '✈️', value: a.co2Kg / EQUIVALENTS.flightKg, label: 'flights Dhaka → London', note: 'one passenger, one way' },
    { icon: '\u{1F3E0}', value: a.energyKwh / EQUIVALENTS.homeKwhPerYear, label: 'homes powered for a year', note: 'European household electricity' },
    { icon: '\u{1F697}', value: a.co2Kg / EQUIVALENTS.carKgPerKm, label: 'km in a petrol car', note: '' },
    { icon: '\u{1F4F1}', value: a.co2Kg / EQUIVALENTS.phoneChargeKg, label: 'smartphone charges', note: '' },
  ]
}

export default function AnnualProjection({ energy, co2, cost, hoursPerDay, gridFactor }) {
  const a = calcAnnual(energy, co2, cost, hoursPerDay, gridFactor)
  const tonnes = a.co2Kg / 1000
  const items = [
    { label: 'Energy / year', value: fmt(a.energyKwh, 'kWh'), color: 'text-amber-300' },
    { label: 'CO₂ / year', value: tonnes >= 1 ? `${tonnes.toFixed(1)} t` : fmt(a.co2Kg, 'kg'), color: 'text-rose-300' },
    { label: 'Cost / year', value: `€${fmt(a.cost)}`, color: 'text-slate-100' },
    { label: 'Trees to offset', value: a.trees.toLocaleString(), color: 'text-emerald-300' },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(i => (
          <div key={i.label} className="bg-slate-800/50 rounded-xl px-3 py-3">
            <div className="text-[0.6875rem] text-slate-500 uppercase tracking-wider">{i.label}</div>
            <div className={`mt-0.5 text-lg font-bold font-mono tabular-nums ${i.color}`}>{i.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-[0.6875rem] uppercase tracking-wider text-slate-500 font-semibold">In everyday terms, that's about</div>
      <ul className="mt-2 grid grid-cols-2 gap-2">
        {everydayEquivalents(a).map(e => (
          <li key={e.label} className="flex items-center gap-2.5 rounded-xl border border-slate-800 px-3 py-2" title={e.note || undefined}>
            <span className="text-xl leading-none" aria-hidden="true">{e.icon}</span>
            <div className="min-w-0">
              <div className="font-mono font-bold text-slate-100 tabular-nums">{fmt(e.value)}</div>
              <div className="text-[0.6875rem] text-slate-500 leading-tight">{e.label}</div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-[0.6875rem] text-slate-500 leading-relaxed">
        Running {hoursPerDay} h/day for 365 days ({a.hours.toLocaleString()} h) in your chosen time window.
        A mature tree absorbs about {TREE_KG_PER_YEAR} kg CO&#8322; a year; a Dhaka&ndash;London flight is roughly 1 t per passenger.
      </p>
    </div>
  )
}
