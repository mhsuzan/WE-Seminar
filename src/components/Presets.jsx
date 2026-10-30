import { PRESETS } from '../hooks/useGreenAIConfig'

export default function Presets({ current, onApply, onReset }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map(p => {
          const active = current.complexity === p.complexity &&
            current.hardware === p.hardware &&
            Math.abs(current.gridIntensity - p.gridIntensity) < 0.005
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onApply(p)}
              aria-pressed={active}
              className={`text-left px-3 py-2.5 rounded-xl transition-all duration-200 ${
                active
                  ? 'bg-emerald-500/15 ring-1 ring-emerald-500/40'
                  : 'bg-slate-800/70 hover:bg-slate-800 ring-1 ring-transparent hover:ring-slate-700'
              }`}
            >
              <div className={`text-xs font-semibold flex items-center gap-1.5 ${active ? 'text-emerald-300' : 'text-slate-200'}`}>
                <span aria-hidden="true">{p.icon}</span>
                {p.label}
              </div>
              <div className="text-[0.6875rem] text-slate-500 mt-0.5">{p.desc}</div>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="mt-3 text-[0.6875rem] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reset to defaults
      </button>
    </div>
  )
}
