import { useEffect, useState } from 'react'
import { calcScenario } from '../utils/calculations'

const SMALL = { complexity: 8, hardware: 'ane', gridIntensity: 0.2 }
const BIG = { complexity: 90, hardware: 'h100', gridIntensity: 0.37 }
const DIRTY = { complexity: 70, hardware: 'h100', gridIntensity: 0.9 }
const FINAL = { complexity: 70, hardware: 'inferentia', gridIntensity: 0.03 }

const x = n => (n >= 10 ? Math.round(n) : n.toFixed(1))

const STEPS = [
  {
    title: 'Meet the dashboard',
    config: { complexity: 45, hardware: 'cpu', gridIntensity: 0.5 },
    text: m => `A mid-size model on an ordinary CPU, on an average grid: ${m.energy} kWh and ${m.co2} kg CO₂ every hour, at ${m.accuracy}% accuracy. Every number on the page reacts to the configuration controls.`,
  },
  {
    title: 'Start small: AI on the device',
    config: SMALL,
    text: m => `A tiny model on a phone's neural engine uses just ${m.energy} kWh an hour. The catch: it only reaches ${m.accuracy}% accuracy. Small is green, but not always good enough.`,
  },
  {
    title: 'Scale up to a large model',
    config: BIG,
    text: m => `Now a large model on an NVIDIA H100 on a US-average grid: ${m.accuracy}% accurate, but ${m.energy} kWh and ${m.co2} kg CO₂ every hour, about ${x(m.co2 / calcScenario(SMALL).co2)}× the edge model.`,
  },
  {
    title: 'Diminishing returns',
    config: { ...BIG, complexity: 70 },
    text: m => {
      const big = calcScenario(BIG)
      return `Shrinking from complexity 90 to 70 costs only ${big.accuracy - m.accuracy} accuracy points but cuts energy by ${Math.round((1 - m.energy / big.energy) * 100)}%. Past the knee of the curve, extra size buys very little.`
    },
  },
  {
    title: 'Same model, dirty grid',
    config: DIRTY,
    text: m => `Move the same setup to a coal-heavy grid like South Africa's and emissions jump to ${m.co2} kg CO₂ an hour. Nothing about the model changed.`,
  },
  {
    title: 'Same model, clean grid',
    config: { ...DIRTY, gridIntensity: 0.03 },
    text: m => `On Norway's hydro-powered grid it is ${m.co2} kg CO₂ an hour: ${x(calcScenario(DIRTY).co2 / m.co2)}× less than on coal. Where you run matters as much as what you run.`,
  },
  {
    title: 'Right-size the hardware',
    config: FINAL,
    text: m => `Swap the training-class H100 for an inference chip (AWS Inferentia2): energy falls to ${m.energy} kWh and cost to €${m.cost.total.toFixed(2)}/hr, at the same ${m.accuracy}% accuracy.`,
  },
  {
    title: 'The takeaway',
    config: FINAL,
    text: m => `From the big model on a coal grid to this setup, CO₂ dropped ${x(calcScenario(DIRTY).co2 / m.co2)}× with ${m.accuracy}% accuracy still on the table. Green AI is a design choice: right-size the model, pick efficient hardware, and run it on a clean grid at a clean time.`,
  },
]

export default function Tour({ onApply, onClose }) {
  const [i, setI] = useState(0)
  const step = STEPS[i]
  const m = calcScenario(step.config)
  const last = i === STEPS.length - 1

  useEffect(() => {
    onApply(step.config)
  }, [i]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onKey(e) {
      if (e.target.closest?.('input, select, textarea')) return
      if (e.key === 'ArrowRight') setI(n => Math.min(STEPS.length - 1, n + 1))
      else if (e.key === 'ArrowLeft') setI(n => Math.max(0, n - 1))
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5 pointer-events-none">
      <div
        role="dialog"
        aria-label="Guided tour"
        className="animate-rise pointer-events-auto mx-auto max-w-2xl rounded-2xl border border-emerald-500/30 bg-slate-900/95 backdrop-blur-md shadow-2xl shadow-black/40 p-5"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-[0.6875rem] uppercase tracking-wider text-emerald-300 font-semibold">
            Guided tour &middot; {i + 1} of {STEPS.length}
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-200 text-xs" aria-label="Close tour">
            Close &#10005;
          </button>
        </div>
        <h3 className="mt-1.5 text-lg font-bold text-slate-100">{step.title}</h3>
        <p className="mt-1.5 text-sm text-slate-300 leading-relaxed" aria-live="polite">{step.text(m)}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            {STEPS.map((_, n) => (
              <button
                key={n}
                type="button"
                tabIndex={-1}
                onClick={() => setI(n)}
                className={`h-1.5 rounded-full transition-all ${n === i ? 'w-6 bg-emerald-400' : 'w-1.5 bg-slate-700 hover:bg-slate-600'}`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setI(n => n - 1)}
              disabled={i === 0}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => (last ? onClose() : setI(n => n + 1))}
              className="rounded-lg px-4 py-1.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
            >
              {last ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
        <p className="mt-3 text-[0.6875rem] text-slate-500 hidden sm:block">Tip: use the &larr; &rarr; arrow keys while presenting, Esc to close.</p>
      </div>
    </div>
  )
}
