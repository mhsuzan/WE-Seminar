import { calcScenario, hardwareInfo } from '../utils/calculations'
import { PIN_COLORS } from './TradeoffChart'

const ROWS = [
  { key: 'accuracy', label: 'Accuracy', unit: '%', better: 'high' },
  { key: 'energy', label: 'Energy', unit: ' kWh', better: 'low' },
  { key: 'co2', label: 'CO₂', unit: ' kg', better: 'low' },
  { key: 'efficiencyScore', label: 'Efficiency', unit: '/100', better: 'high' },
  { key: 'cost', label: 'Cost', unit: '/hr', better: 'low', get: m => m.cost.total, prefix: '€' },
]

export default function ScenarioCompare({ current, pins, onApply, onUnpin }) {
  const columns = [
    { id: 'current', name: 'Current', color: '#4ade80', config: current },
    ...pins.map((p, i) => ({ id: p.id, name: p.name, color: PIN_COLORS[i % PIN_COLORS.length], config: p, pin: p })),
  ].map(col => ({ ...col, m: calcScenario(col.config) }))

  if (!pins.length) {
    return (
      <p className="text-sm text-slate-500">
        Pin the current configuration to compare it side by side with others. Pinned scenarios also
        appear on the trade-off chart.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm min-w-[480px]">
        <thead>
          <tr className="text-left">
            <th className="px-2 pb-3 font-normal text-[11px] text-slate-500 uppercase tracking-wider w-24" />
            {columns.map(col => (
              <th key={col.id} className="px-2 pb-3 align-top">
                <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: col.color }} />
                  {col.name}
                </div>
                <div className="text-[11px] font-normal text-slate-500 mt-0.5 leading-snug">
                  C{col.config.complexity} &middot; {hardwareInfo(col.config.hardware).short} &middot; {col.config.gridIntensity.toFixed(2)}
                </div>
                {col.pin && (
                  <div className="flex gap-2 mt-1.5 text-[11px] font-normal">
                    <button type="button" onClick={() => onApply(col.pin)} className="text-emerald-400 hover:text-emerald-300">Load</button>
                    <button type="button" onClick={() => onUnpin(col.pin.id)} className="text-slate-500 hover:text-rose-300">Remove</button>
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(r => {
            const vals = columns.map(col => (r.get ? r.get(col.m) : col.m[r.key]))
            const best = r.better === 'high' ? Math.max(...vals) : Math.min(...vals)
            return (
              <tr key={r.key} className="border-t border-slate-800">
                <td className="px-2 py-2 text-slate-400 text-xs">{r.label}</td>
                {vals.map((v, i) => (
                  <td key={columns[i].id} className={`px-2 py-2 font-mono tabular-nums ${v === best ? 'text-emerald-300 font-semibold' : 'text-slate-300'}`}>
                    {r.prefix}{r.key === 'cost' ? v.toFixed(2) : v}{r.unit}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-2 px-1 text-[11px] text-slate-500">Best value in each row is highlighted.</p>
    </div>
  )
}
