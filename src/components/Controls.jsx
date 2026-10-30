import { HARDWARE_OPTIONS, GRID_REGIONS, GRID_MIN, GRID_MAX, hardwareInfo } from '../utils/calculations'

const SELECT_ARROW = "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat"

function Slider({ id, label, value, display, min, max, step, onChange, left, right, fill }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label htmlFor={id} className="text-sm font-medium text-slate-300">{label}</label>
        <span className="font-mono text-sm text-emerald-300 tabular-nums">{display}</span>
      </div>
      <div className="relative">
        <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-2 rounded-full bg-slate-800 pointer-events-none" />
        <div
          className={`absolute top-1/2 -translate-y-1/2 left-0 h-2 rounded-full pointer-events-none ${fill}`}
          style={{ width: `${pct}%` }}
        />
        <input
          id={id}
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="relative z-10"
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[0.6875rem]">
        {left}
        {right}
      </div>
    </div>
  )
}

export default function Controls({
  complexity, setComplexity,
  hardware, setHardware,
  gridIntensity, setGridIntensity,
  hoursPerDay, setHoursPerDay,
}) {
  return (
    <div className="space-y-6">
      <Slider
        id="complexity-slider"
        label="Model complexity"
        value={complexity}
        display={complexity}
        min={1} max={100} step={1}
        onChange={setComplexity}
        fill="bg-gradient-to-r from-emerald-500/60 to-cyan-500/60"
        left={<span className="text-slate-500">Edge model</span>}
        right={<span className="text-slate-500">Large LLM</span>}
      />

      <div>
        <label htmlFor="hardware-select" className="block text-sm font-medium text-slate-300 mb-2">
          Compute hardware
        </label>
        <select
          id="hardware-select"
          value={hardware}
          onChange={e => setHardware(e.target.value)}
          className={`w-full bg-slate-800 border border-slate-700 rounded-xl pl-3 pr-9 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 cursor-pointer appearance-none ${SELECT_ARROW}`}
        >
          {HARDWARE_OPTIONS.map(hw => (
            <option key={hw.value} value={hw.value}>
              {hw.label} ({hw.factor}x)
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1.5">{hardwareInfo(hardware).description}</p>
        {complexity > hardwareInfo(hardware).maxComplexity && (
          <p className="text-xs text-amber-300 mt-1.5 flex gap-1.5">
            <span aria-hidden="true">&#9888;</span>
            <span>
              A complexity-{complexity} model is too big for {hardwareInfo(hardware).short} to serve in real time
              (about {hardwareInfo(hardware).maxComplexity} max).
            </span>
          </p>
        )}
      </div>

      <div>
        <Slider
          id="grid-slider"
          label="Grid carbon intensity"
          value={gridIntensity}
          display={`${gridIntensity.toFixed(2)} kg/kWh`}
          min={GRID_MIN} max={GRID_MAX} step={0.01}
          onChange={setGridIntensity}
          fill="bg-gradient-to-r from-emerald-500/60 via-amber-500/60 to-rose-500/60"
          left={<span className="text-emerald-400">Renewables</span>}
          right={<span className="text-rose-400">Coal</span>}
        />
        <div className="mt-3">
          <p className="text-[0.6875rem] text-slate-500 mb-1.5">Or pick a country grid (approx. annual average):</p>
          <div className="flex flex-wrap gap-1.5">
            {GRID_REGIONS.map(r => {
              const active = Math.abs(r.value - gridIntensity) < 0.005
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setGridIntensity(r.value)}
                  title={`${r.value} kg CO₂/kWh`}
                  className={`px-2 py-1 rounded-lg text-[0.6875rem] transition-colors ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <Slider
        id="usage-slider"
        label="Daily usage"
        value={hoursPerDay}
        display={`${hoursPerDay} h/day`}
        min={1} max={24} step={1}
        onChange={setHoursPerDay}
        fill="bg-gradient-to-r from-violet-500/60 to-fuchsia-500/60"
        left={<span className="text-slate-500">1 h</span>}
        right={<span className="text-slate-500">24/7</span>}
      />
    </div>
  )
}
