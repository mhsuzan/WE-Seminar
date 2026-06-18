import useGreenAIConfig from './hooks/useGreenAIConfig'
import Controls from './components/Controls'
import Metrics from './components/Metrics'
import TradeoffChart from './components/TradeoffChart'
import Presets from './components/Presets'
import GreenTip from './components/GreenTip'

export default function App() {
  const {
    complexity, setComplexity,
    hardware, setHardware,
    gridIntensity, setGridIntensity,
    applyPreset, reset,
    accuracy, energy, chartEfficiency, efficiencyScore, co2,
    equivalency, cost, tip,
  } = useGreenAIConfig()

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 relative">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(52,211,153,0.06)_0%,_transparent_60%)]" />

      <header className="relative border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 text-xl drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">&#9851;</span>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Green AI Trade-off Dashboard
            </h1>
          </div>
          <span className="text-xs text-slate-500 hidden sm:block">Modeling Green AI in System Architecture</span>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-80 xl:w-96 shrink-0 space-y-5">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 border border-slate-700/50 rounded-2xl p-5 shadow-lg">
              <h2 className="text-sm font-medium text-slate-300 mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                Configuration
              </h2>
              <Controls
                complexity={complexity}
                setComplexity={setComplexity}
                hardware={hardware}
                setHardware={setHardware}
                gridIntensity={gridIntensity}
                setGridIntensity={setGridIntensity}
              />
            </div>

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 border border-slate-700/50 rounded-2xl p-5 shadow-lg">
              <Presets
                current={{ complexity, hardware, gridIntensity }}
                onApply={applyPreset}
                onReset={reset}
              />
            </div>

            <GreenTip tip={tip} />

            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 border border-slate-700/50 rounded-2xl p-5 shadow-lg">
              <h2 className="text-sm font-medium text-slate-300 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                Telemetry
              </h2>
              <Metrics accuracy={accuracy} energy={energy} efficiencyScore={efficiencyScore} co2={co2} equivalency={equivalency} cost={cost} />
            </div>
          </aside>

          <section className="flex-1 min-w-0">
            <TradeoffChart accuracy={accuracy} efficiency={chartEfficiency} />
          </section>
        </div>
      </main>

      <footer className="relative border-t border-slate-800/80 mt-8 py-4 text-center text-xs text-slate-600">
        Green AI Trade-off Dashboard &mdash; Interactive simulation for educational purposes
      </footer>
    </div>
  )
}
