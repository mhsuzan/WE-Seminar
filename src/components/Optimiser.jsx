import { useMemo, useState } from 'react'
import { findGreenest, hardwareInfo, GRID_REGIONS, calcScenario } from '../utils/calculations'

function regionName(g) {
  return GRID_REGIONS.find(r => Math.abs(r.value - g) < 0.005)?.label
}

function Toggle({ options, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-slate-800/70 p-0.5 text-[0.6875rem]">
      {options.map(o => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`px-2.5 py-1 rounded-md transition-colors ${value === o.value ? 'bg-slate-900 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function Optimiser({ current, onApply }) {
  const [minAccuracy, setMinAccuracy] = useState(85)
  const [scope, setScope] = useState('any')
  const [objective, setObjective] = useState('co2')

  const now = calcScenario(current)
  const best = useMemo(() => findGreenest({
    minAccuracy,
    objective,
    grids: scope === 'any' ? [...new Set([...GRID_REGIONS.map(r => r.value), current.gridIntensity])] : [current.gridIntensity],
  }), [minAccuracy, objective, scope, current.gridIntensity])

  const m = best?.metrics
  const co2Ratio = m && m.co2 > 0 ? now.co2 / m.co2 : null
  const costSaved = m ? now.cost.total - m.cost.total : 0
  const meetsNow = now.accuracy >= minAccuracy
  const region = best && regionName(best.config.gridIntensity)
  const isCurrent = best &&
    best.config.complexity === current.complexity &&
    best.config.hardware === current.hardware &&
    Math.abs(best.config.gridIntensity - current.gridIntensity) < 0.005

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="min-acc" className="text-sm font-medium text-slate-300">I need at least</label>
          <span className="font-mono text-sm text-emerald-300 tabular-nums">{minAccuracy}% accuracy</span>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-2 rounded-full bg-slate-800 pointer-events-none" />
          <div className="absolute top-1/2 -translate-y-1/2 left-0 h-2 rounded-full pointer-events-none bg-gradient-to-r from-emerald-500/60 to-cyan-500/60" style={{ width: `${((minAccuracy - 50) / 45) * 100}%` }} />
          <input id="min-acc" type="range" min={50} max={95} step={1} value={minAccuracy} onChange={e => setMinAccuracy(Number(e.target.value))} className="relative z-10" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Toggle label="Grid" value={scope} onChange={setScope} options={[{ value: 'any', label: 'Any country' }, { value: 'mine', label: 'Keep my grid' }]} />
        <Toggle label="Minimise" value={objective} onChange={setObjective} options={[{ value: 'co2', label: 'Lowest CO₂' }, { value: 'cost', label: 'Lowest cost' }]} />
      </div>

      {best && (
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] p-4">
          <div className="text-[0.6875rem] uppercase tracking-wider text-emerald-300/80 font-semibold">Best setup</div>
          <div className="mt-1 text-base font-semibold text-slate-100">
            Complexity {best.config.complexity} on {hardwareInfo(best.config.hardware).label}
          </div>
          <div className="text-xs text-slate-400">
            {region ? `${region} grid` : 'Your grid'} ({best.config.gridIntensity.toFixed(2)} kg/kWh)
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-slate-900/60 py-2">
              <div className="text-[0.6875rem] text-slate-500">Accuracy</div>
              <div className="font-mono font-semibold text-slate-100">{m.accuracy}%</div>
            </div>
            <div className="rounded-lg bg-slate-900/60 py-2">
              <div className="text-[0.6875rem] text-slate-500">CO&#8322;/hr</div>
              <div className="font-mono font-semibold text-emerald-300">{m.co2} kg</div>
            </div>
            <div className="rounded-lg bg-slate-900/60 py-2">
              <div className="text-[0.6875rem] text-slate-500">Cost/hr</div>
              <div className="font-mono font-semibold text-slate-100">&euro;{m.cost.total.toFixed(2)}</div>
            </div>
          </div>

          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            {isCurrent
              ? 'Your current setup is already the best one for this target.'
              : <>
                  {co2Ratio && co2Ratio > 1.05
                    ? <>That is <strong className="text-emerald-300">{co2Ratio >= 10 ? Math.round(co2Ratio) : co2Ratio.toFixed(1)}&times; less CO&#8322;</strong> than your current setup</>
                    : <>CO&#8322; is about the same as your current setup</>}
                  {costSaved > 0.005 && <> and saves <strong className="text-slate-100">&euro;{costSaved.toFixed(2)}/hr</strong></>}
                  {meetsNow ? '.' : <>, and unlike your current setup ({now.accuracy}%), it meets the accuracy target.</>}
                </>}
          </p>

          {!isCurrent && (
            <button
              type="button"
              onClick={() => onApply(best.config)}
              className="mt-3 w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold py-2 transition-colors"
            >
              Use this setup
            </button>
          )}
        </div>
      )}
      <p className="text-[0.6875rem] text-slate-500 leading-relaxed">
        Searches every chip, model size and grid, picks the smallest model that hits the target, and skips
        chips too small to serve it in real time.
      </p>
    </div>
  )
}
