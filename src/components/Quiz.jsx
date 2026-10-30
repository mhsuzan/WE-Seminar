import { useEffect, useState } from 'react'
import { calcScenario, hardwareInfo } from '../utils/calculations'

const METRIC = {
  co2: { label: 'CO₂ per hour', get: m => m.co2, fmt: v => `${v} kg` },
  cost: { label: 'cost per hour', get: m => m.cost.total, fmt: v => `€${v.toFixed(2)}` },
  efficiencyScore: { label: 'efficiency score', get: m => m.efficiencyScore, fmt: v => `${v}/100` },
}

const QUESTIONS = [
  {
    ask: 'Which emits more CO₂ per hour?', metric: 'co2', want: 'more',
    a: { name: 'A small model on an H100 in India', config: { complexity: 20, hardware: 'h100', gridIntensity: 0.71 } },
    b: { name: 'A large model on a plain CPU in France', config: { complexity: 80, hardware: 'cpu', gridIntensity: 0.06 } },
    why: 'A power-hungry GPU on a coal-heavy grid outweighs a model four times the size on nuclear-powered electricity.',
  },
  {
    ask: 'Which emits less CO₂ per hour?', metric: 'co2', want: 'less',
    a: { name: 'An A100 cloud GPU in Norway', config: { complexity: 60, hardware: 'cloud_gpu', gridIntensity: 0.03 } },
    b: { name: 'A mid-range gaming GPU in Germany', config: { complexity: 60, hardware: 'mid_gpu', gridIntensity: 0.38 } },
    why: 'The A100 draws twice the power, but Norway’s hydro grid is over ten times cleaner than Germany’s.',
  },
  {
    ask: 'Which gets the better efficiency score?', metric: 'efficiencyScore', want: 'more',
    a: { name: 'Complexity 60 on an H100', config: { complexity: 60, hardware: 'h100', gridIntensity: 0.37 } },
    b: { name: 'Complexity 100 on an H100', config: { complexity: 100, hardware: 'h100', gridIntensity: 0.37 } },
    why: 'The bigger model gains a few accuracy points but pays for them with two-thirds more energy.',
  },
  {
    ask: 'Which costs more to run per hour?', metric: 'cost', want: 'more',
    a: { name: 'A small model on a TPU v5p pod', config: { complexity: 40, hardware: 'tpu_v5', gridIntensity: 0.03 } },
    b: { name: 'A large model on a mid-range GPU', config: { complexity: 100, hardware: 'mid_gpu', gridIntensity: 0.71 } },
    why: 'TPU pods are expensive to rent and draw a lot of power even for a smaller model.',
  },
  {
    ask: 'Which emits more CO₂ per hour?', metric: 'co2', want: 'more',
    a: { name: 'A huge model on a tiny Edge TPU in South Africa', config: { complexity: 100, hardware: 'edge_tpu', gridIntensity: 0.9 } },
    b: { name: 'A small model on an A100 in the UK', config: { complexity: 30, hardware: 'cloud_gpu', gridIntensity: 0.21 } },
    why: 'Even an efficient chip adds up on a coal grid, though a model that big would also be far too slow on it.',
  },
]

function Option({ letter, option, state, onPick, value, metric }) {
  const styles = {
    idle: 'border-slate-700 hover:border-emerald-500/60 hover:bg-slate-800/60',
    right: 'border-emerald-500 bg-emerald-500/10',
    wrong: 'border-rose-500 bg-rose-500/10',
    other: 'border-slate-800 opacity-70',
  }
  const hw = hardwareInfo(option.config.hardware)
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={state !== 'idle'}
      className={`text-left rounded-xl border-2 p-4 transition-colors ${styles[state]}`}
    >
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center">{letter}</span>
        <span className="font-semibold text-slate-100">{option.name}</span>
      </div>
      <div className="mt-2 text-[0.6875rem] text-slate-500">
        Complexity {option.config.complexity} &middot; {hw.short} &middot; {option.config.gridIntensity.toFixed(2)} kg/kWh
      </div>
      {state !== 'idle' && (
        <div className="mt-2 font-mono text-lg font-bold text-slate-100">{metric.fmt(value)}</div>
      )}
    </button>
  )
}

export default function Quiz({ onClose, onApply }) {
  const [n, setN] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const done = n >= QUESTIONS.length

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const q = QUESTIONS[n]
  let body
  if (done) {
    body = (
      <div className="text-center py-6">
        <div className="text-5xl" aria-hidden="true">{score === QUESTIONS.length ? '\u{1F3C6}' : score >= 3 ? '\u{1F33F}' : '\u{1F331}'}</div>
        <p className="mt-3 text-2xl font-bold text-slate-100">{score} / {QUESTIONS.length}</p>
        <p className="mt-1 text-sm text-slate-400">
          {score === QUESTIONS.length ? 'Perfect. You think like a Green AI architect.' : 'Intuition often misses how much the grid matters. Try the guided tour to see why.'}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button type="button" onClick={() => { setN(0); setScore(0); setPicked(null) }} className="rounded-lg px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-200">Play again</button>
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950">Done</button>
        </div>
      </div>
    )
  } else {
    const metric = METRIC[q.metric]
    const va = metric.get(calcScenario(q.a.config))
    const vb = metric.get(calcScenario(q.b.config))
    const correct = (q.want === 'more') === (va > vb) ? 'a' : 'b'
    const state = key => (picked == null ? 'idle' : key === correct ? 'right' : key === picked ? 'wrong' : 'other')
    const pick = key => {
      setPicked(key)
      if (key === correct) setScore(s => s + 1)
    }
    const ratio = Math.max(va, vb) / Math.max(0.01, Math.min(va, vb))

    body = (
      <>
        <h3 className="text-xl font-bold text-slate-100">{q.ask}</h3>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <Option letter="A" option={q.a} state={state('a')} onPick={() => pick('a')} value={va} metric={metric} />
          <Option letter="B" option={q.b} state={state('b')} onPick={() => pick('b')} value={vb} metric={metric} />
        </div>
        {picked && (
          <div className="mt-4 animate-rise rounded-xl bg-slate-800/60 p-4">
            <p className={`font-semibold ${picked === correct ? 'text-emerald-300' : 'text-rose-300'}`}>
              {picked === correct ? 'Correct!' : `Not quite, it's ${correct.toUpperCase()}.`}
              <span className="text-slate-400 font-normal"> {ratio >= 1.1 ? `${ratio >= 10 ? Math.round(ratio) : ratio.toFixed(1)}× difference in ${metric.label}.` : ''}</span>
            </p>
            <p className="mt-1 text-sm text-slate-300">{q.why}</p>
            <div className="mt-3 flex flex-wrap gap-2 justify-between">
              <div className="flex gap-2 text-xs">
                <button type="button" onClick={() => { onApply(q.a.config); onClose() }} className="text-emerald-400 hover:text-emerald-300">Open A in dashboard</button>
                <button type="button" onClick={() => { onApply(q.b.config); onClose() }} className="text-emerald-400 hover:text-emerald-300">Open B in dashboard</button>
              </div>
              <button type="button" onClick={() => { setN(v => v + 1); setPicked(null) }} className="rounded-lg px-4 py-1.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950">
                {n === QUESTIONS.length - 1 ? 'See score' : 'Next question'}
              </button>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Green AI quiz"
        className="animate-rise w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-7 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-[0.6875rem] uppercase tracking-wider text-emerald-300 font-semibold">
            Green AI quiz {!done && <>&middot; question {n + 1} of {QUESTIONS.length} &middot; score {score}</>}
          </div>
          <button type="button" onClick={onClose} className="text-slate-500 hover:text-slate-200 text-xs" aria-label="Close quiz">Close &#10005;</button>
        </div>
        {body}
      </div>
    </div>
  )
}
