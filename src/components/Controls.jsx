import { HARDWARE_OPTIONS } from '../utils/calculations'

export default function Controls({ complexity, setComplexity, hardware, setHardware, gridIntensity, setGridIntensity }) {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="complexity-slider" className="block text-sm font-medium text-slate-300 mb-2">
          Model Complexity
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-16 text-right shrink-0">Edge</span>
          <div className="relative w-full">
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-2 rounded-full bg-emerald-500/40 pointer-events-none"
              style={{ width: `${complexity}%` }}
            />
            <input
              id="complexity-slider"
              type="range"
              min={1} max={100}
              value={complexity}
              onChange={e => setComplexity(Number(e.target.value))}
              aria-valuemin={1} aria-valuemax={100} aria-valuenow={complexity}
              aria-label="Model complexity slider"
              className="relative z-10"
            />
          </div>
          <span className="text-xs text-slate-500 w-10 shrink-0">LLM</span>
        </div>
        <div className="text-right text-emerald-400 font-mono text-sm mt-1">{complexity}</div>
      </div>

      <div>
        <label htmlFor="hardware-select" className="block text-sm font-medium text-slate-300 mb-2">
          Compute Hardware
        </label>
        <select
          id="hardware-select"
          value={hardware}
          onChange={e => setHardware(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%2394a3b8%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px_20px] bg-[right_12px_center] bg-no-repeat pr-9"
          aria-label="Compute hardware selection"
        >
          {HARDWARE_OPTIONS.map(hw => (
            <option key={hw.value} value={hw.value}>
              {hw.label} ({hw.factor}x)
            </option>
          ))}
        </select>
        <p className="text-xs text-slate-500 mt-1.5">
          {HARDWARE_OPTIONS.find(h => h.value === hardware)?.description}
        </p>
      </div>

      <div>
        <label htmlFor="grid-slider" className="block text-sm font-medium text-slate-300 mb-2">
          Grid Carbon Intensity
        </label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400 w-16 text-right shrink-0">Clean</span>
          <div className="relative w-full">
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-2 rounded-full bg-amber-500/40 pointer-events-none"
              style={{ width: `${((gridIntensity - 0.1) / 0.9) * 100}%` }}
            />
            <input
              id="grid-slider"
              type="range"
              min={0.1} max={1.0} step={0.05}
              value={gridIntensity}
              onChange={e => setGridIntensity(Number(e.target.value))}
              aria-valuemin={0.1} aria-valuemax={1.0} aria-valuenow={gridIntensity}
              aria-label="Grid carbon intensity slider"
              className="relative z-10"
            />
          </div>
          <span className="text-xs text-red-400 w-10 shrink-0">Coal</span>
        </div>
        <div className="text-right text-emerald-400 font-mono text-sm mt-1">{gridIntensity.toFixed(2)}</div>
      </div>
    </div>
  )
}
