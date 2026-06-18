import { PRESETS } from '../hooks/useGreenAIConfig'

export default function Presets({ current, onApply, onReset }) {
  return (
    <div>
      <h2 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        Quick Presets
      </h2>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(p => {
          const active = current.complexity === p.complexity &&
            current.hardware === p.hardware &&
            Math.abs(current.gridIntensity - p.gridIntensity) < 0.05
          return (
            <button
              key={p.label}
              onClick={() => onApply(p)}
              className={`group flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                active
                  ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 shadow-sm'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200 hover:shadow-sm'
              }`}
              title={p.desc}
              aria-label={`Apply preset: ${p.label} — ${p.desc}`}
            >
              <span className="text-sm">{p.icon}</span>
              <span>{p.label}</span>
            </button>
          )
        })}
      </div>

      <button
        onClick={onReset}
        className="mt-3 text-[11px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
        aria-label="Reset all controls to defaults"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset to defaults
      </button>
    </div>
  )
}
