import { MAX_ENERGY, ELECTRICITY_PRICE } from '../utils/calculations'

const STEPS = [
  {
    title: 'Accuracy',
    formula: 'accuracy = 97 / (1 + e^(−0.08 · (complexity − 38)))',
    text: 'A sigmoid curve: bigger models help a lot at first, then gains flatten out past roughly 80% complexity.',
  },
  {
    title: 'Energy',
    formula: 'energy = complexity × hardware factor',
    text: 'Energy scales linearly with model size, multiplied by how power-hungry the chosen hardware is (0.3x for a neural engine up to 8x for a TPU pod).',
  },
  {
    title: 'CO₂',
    formula: 'CO₂ = energy × grid intensity',
    text: 'The same kWh emits very different amounts of CO₂ depending on how the local grid generates electricity.',
  },
  {
    title: 'Efficiency score',
    formula: `score = 0.45 · accuracy + 0.55 · (100 − energy / ${MAX_ENERGY} · 100)`,
    text: 'A single number that rewards accuracy but weighs energy use slightly more.',
  },
  {
    title: 'Cost',
    formula: `cost = energy × €${ELECTRICITY_PRICE.toFixed(2)}/kWh + hardware rental`,
    text: 'Electricity plus a typical hourly rate for the hardware (zero for chips you already own).',
  },
]

export default function HowItWorks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {STEPS.map((s, i) => (
        <div key={s.title} className="bg-slate-800/40 rounded-xl p-4 min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] flex items-center justify-center">{i + 1}</span>
            {s.title}
          </div>
          <code className="block mt-2 text-[11px] text-cyan-300/90 bg-slate-950/60 rounded-lg px-2.5 py-1.5 overflow-x-auto whitespace-nowrap">{s.formula}</code>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">{s.text}</p>
        </div>
      ))}
      <div className="bg-slate-800/40 rounded-xl p-4 sm:col-span-2">
        <p className="text-xs text-slate-400 leading-relaxed">
          This is a generalised model built to show the <em>shape</em> of the trade-offs, not the exact
          footprint of any specific model. Energy and cost are per hour of operation; the yearly
          projection multiplies them by your daily usage.
        </p>
      </div>
    </div>
  )
}
