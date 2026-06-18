import AnimatedNumber from './AnimatedNumber'

function threshold(value, type) {
  switch (type) {
    case 'energy':
      return value > 200 ? 'text-rose-400 border-rose-500/30' : value > 50 ? 'text-amber-400 border-amber-500/30' : 'text-emerald-400 border-emerald-500/30'
    case 'co2':
      return value > 100 ? 'text-rose-400 border-rose-500/30' : value > 25 ? 'text-amber-400 border-amber-500/30' : 'text-emerald-400 border-emerald-500/30'
    case 'accuracy':
      return value >= 80 ? 'text-emerald-400 border-emerald-500/30' : value >= 40 ? 'text-amber-400 border-amber-500/30' : 'text-rose-400 border-rose-500/30'
    case 'efficiency':
      return value >= 60 ? 'text-emerald-400 border-emerald-500/30' : value >= 30 ? 'text-amber-400 border-amber-500/30' : 'text-rose-400 border-rose-500/30'
    default:
      return 'text-slate-300 border-slate-500/30'
  }
}

export default function Metrics({ accuracy, energy, efficiencyScore, co2, equivalency, cost }) {
  const cards = [
    { label: 'Total Energy', val: energy, unit: 'kWh', type: 'energy', decimals: 1 },
    { label: 'CO\u2082 Emissions', val: co2, unit: 'kg', type: 'co2', decimals: 1 },
    { label: 'Model Accuracy', val: accuracy, unit: '%', type: 'accuracy', decimals: 0 },
    { label: 'Efficiency Score', val: efficiencyScore, unit: '/100', type: 'efficiency', decimals: 0 },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map(c => {
          const colors = threshold(c.val, c.type)
          return (
            <div key={c.label} className={`bg-gradient-to-br from-slate-800/60 to-slate-800/30 border ${colors} rounded-xl p-4 text-center transition-all duration-300`}>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{c.label}</div>
              <div className={`text-2xl font-bold font-mono ${colors.split(' ')[0]}`}>
                <AnimatedNumber value={c.val} decimals={c.decimals} />
                <span className="text-sm font-normal text-slate-500 ml-1">{c.unit}</span>
              </div>
              {c.label === 'CO\u2082 Emissions' && equivalency && (
                <div className="mt-2 text-[10px] text-slate-500 leading-tight">
                  &#127758; Same as {equivalency.value.toLocaleString()} {equivalency.unit}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {cost && (
        <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-500 text-center leading-relaxed">
          <span className="text-slate-400">&#128176;</span> Est. cost:&nbsp;
          <span className="text-slate-300 font-mono">&euro;{cost.total.toFixed(2)}/hr</span>
          <span className="text-slate-600"> &middot; energy &euro;{cost.electricity.toFixed(2)} + hardware &euro;{cost.hardware.toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}
