import { useState } from 'react'
import useGreenAIConfig from './hooks/useGreenAIConfig'
import usePinnedScenarios, { MAX_PINS } from './hooks/usePinnedScenarios'
import { calcScenario } from './utils/calculations'
import Card from './components/Card'
import Controls from './components/Controls'
import Metrics from './components/Metrics'
import TradeoffChart from './components/TradeoffChart'
import ComplexityCurve from './components/ComplexityCurve'
import HardwareComparison from './components/HardwareComparison'
import AnnualProjection from './components/AnnualProjection'
import ScenarioCompare from './components/ScenarioCompare'
import HowItWorks from './components/HowItWorks'
import Presets from './components/Presets'
import GreenTip from './components/GreenTip'

function ShareButton() {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt('Copy this link:', window.location.href)
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/30 px-3 py-1.5 text-xs font-semibold transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        {copied
          ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          : <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />}
      </svg>
      <span aria-live="polite">{copied ? 'Copied' : <>Share<span className="hidden sm:inline"> this setup</span></>}</span>
    </button>
  )
}

export default function App() {
  const {
    complexity, setComplexity,
    hardware, setHardware,
    gridIntensity, setGridIntensity,
    hoursPerDay, setHoursPerDay,
    hardwareFactor, applyPreset, reset,
    accuracy, energy, chartEfficiency, efficiencyScore, co2,
    equivalency, cost, tip,
  } = useGreenAIConfig()
  const { pins, pin, unpin, clear } = usePinnedScenarios()

  const current = { complexity, hardware, gridIntensity }
  const pinPoints = pins.map(p => {
    const m = calcScenario(p)
    return { ...p, accuracy: m.accuracy, efficiency: m.chartEfficiency }
  })
  const pinFull = pins.length >= MAX_PINS

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60rem_30rem_at_20%_-10%,rgba(52,211,153,0.10),transparent),radial-gradient(50rem_25rem_at_90%_0%,rgba(34,211,238,0.07),transparent)]" />

      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 text-lg font-bold shrink-0" aria-hidden="true">&#9851;</div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">Green AI Trade-off Dashboard</h1>
              <p className="text-[11px] text-slate-500 truncate">Modeling Green AI in System Architecture</p>
            </div>
          </div>
          <ShareButton />
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 max-w-3xl">
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            The same AI model can emit <span className="text-emerald-300 font-semibold">50&times; more CO&#8322;</span> depending
            on its size, the chip it runs on and the grid that powers it. Move the controls and watch accuracy,
            energy, emissions and cost respond.
          </p>
        </div>

        <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-6 items-start">
          <aside className="space-y-5 lg:sticky lg:top-20">
            <Card title="Configuration">
              <Controls
                complexity={complexity} setComplexity={setComplexity}
                hardware={hardware} setHardware={setHardware}
                gridIntensity={gridIntensity} setGridIntensity={setGridIntensity}
                hoursPerDay={hoursPerDay} setHoursPerDay={setHoursPerDay}
              />
            </Card>
            <Card title="Quick presets" dot="bg-amber-400">
              <Presets current={current} onApply={applyPreset} onReset={reset} />
            </Card>
          </aside>

          <div className="space-y-5 min-w-0">
            <Metrics accuracy={accuracy} energy={energy} efficiencyScore={efficiencyScore} co2={co2} equivalency={equivalency} cost={cost} />

            <GreenTip tip={tip} />

            <Card
              title="Trade-off space"
              dot="bg-violet-400"
              subtitle="Where this setup lands between accuracy and energy efficiency."
              action={
                <button
                  type="button"
                  onClick={() => pin(current)}
                  disabled={pinFull}
                  className="shrink-0 inline-flex items-center gap-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors"
                  title={pinFull ? `Up to ${MAX_PINS} scenarios` : 'Pin this configuration to compare'}
                >
                  <span aria-hidden="true">&#128204;</span> Pin to compare
                </button>
              }
            >
              <TradeoffChart accuracy={accuracy} efficiency={chartEfficiency} pins={pinPoints} />
            </Card>

            <div className="grid xl:grid-cols-2 gap-5">
              <Card
                title="Diminishing returns"
                dot="bg-emerald-400"
                subtitle="Accuracy (solid) vs energy (dashed) as the model grows. Click to set complexity."
              >
                <ComplexityCurve complexity={complexity} hardwareFactor={hardwareFactor} onPick={setComplexity} />
              </Card>
              <Card
                title="Hardware comparison"
                dot="bg-cyan-400"
                subtitle="CO₂ per hour for this model on every chip. Click a bar to switch."
              >
                <HardwareComparison complexity={complexity} gridIntensity={gridIntensity} hardware={hardware} onPick={setHardware} />
              </Card>
            </div>

            <div className="grid xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-5">
              <Card title="Yearly footprint" dot="bg-rose-400" subtitle="Projected from your daily usage.">
                <AnnualProjection energy={energy} co2={co2} cost={cost} hoursPerDay={hoursPerDay} />
              </Card>
              <Card
                title="Compare scenarios"
                dot="bg-fuchsia-400"
                subtitle={`${pins.length}/${MAX_PINS} pinned`}
                action={pins.length > 0 && (
                  <button type="button" onClick={clear} className="text-[11px] text-slate-500 hover:text-slate-300">Clear all</button>
                )}
              >
                <ScenarioCompare current={current} pins={pins} onApply={applyPreset} onUnpin={unpin} />
              </Card>
            </div>

            <Card title="How the model works" dot="bg-cyan-400">
              <HowItWorks />
            </Card>
          </div>
        </div>
      </main>

      <footer className="relative border-t border-slate-800/80 mt-10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Green AI Trade-off Dashboard</span>
          <span>
            Project by <span className="text-slate-200 font-semibold">Nishat Ahmed Samrin</span>
          </span>
        </div>
      </footer>
    </div>
  )
}
