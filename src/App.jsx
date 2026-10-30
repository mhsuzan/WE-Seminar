import { useState, useCallback } from 'react'
import useGreenAIConfig from './hooks/useGreenAIConfig'
import usePinnedScenarios, { MAX_PINS } from './hooks/usePinnedScenarios'
import { calcScenario, windowFactor } from './utils/calculations'
import { useThemeSettings } from './theme'
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
import Optimiser from './components/Optimiser'
import TimeOfDay from './components/TimeOfDay'
import TrainingVsUsage from './components/TrainingVsUsage'
import Tour from './components/Tour'
import Quiz from './components/Quiz'
import PrintReport from './components/PrintReport'

const ICONS = {
  tour: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  quiz: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  print: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
  presenter: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4',
  sun: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
  moon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  link: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
  check: 'M5 13l4 4L19 7',
}

function HeaderButton({ icon, label, onClick, active, primary, wide, desktopOnly }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      aria-label={label}
      className={`${desktopOnly ? 'hidden sm:inline-flex' : 'inline-flex'} shrink-0 whitespace-nowrap items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold ring-1 transition-colors ${
        primary
          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 ring-emerald-500/30'
          : active
            ? 'bg-slate-800 text-emerald-300 ring-emerald-500/40'
            : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 ring-slate-800'
      }`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[icon]} />
      </svg>
      <span className={wide ? 'hidden sm:inline' : 'hidden xl:inline'}>{label}</span>
    </button>
  )
}

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
  return <HeaderButton icon={copied ? 'check' : 'link'} label={copied ? 'Copied' : 'Share'} onClick={copy} primary wide />
}

export default function App() {
  const {
    complexity, setComplexity,
    hardware, setHardware,
    gridIntensity, setGridIntensity,
    hoursPerDay, setHoursPerDay,
    startHour, setStartHour,
    hardwareFactor, applyPreset, reset,
    accuracy, energy, chartEfficiency, efficiencyScore, co2,
    equivalency, cost, tip,
  } = useGreenAIConfig()
  const { pins, pin, unpin, clear } = usePinnedScenarios()
  const { theme, setTheme, presenter, setPresenter } = useThemeSettings()
  const [touring, setTouring] = useState(false)
  const [quizzing, setQuizzing] = useState(false)

  const closeTour = useCallback(() => setTouring(false), [])
  const closeQuiz = useCallback(() => setQuizzing(false), [])

  const current = { complexity, hardware, gridIntensity }
  const gridFactor = windowFactor(startHour, hoursPerDay)
  const pinPoints = pins.map(p => {
    const m = calcScenario(p)
    return { ...p, accuracy: m.accuracy, efficiency: m.chartEfficiency }
  })
  const pinFull = pins.length >= MAX_PINS

  return (
    <>
      <div className="no-print min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60rem_30rem_at_20%_-10%,rgba(52,211,153,0.10),transparent),radial-gradient(50rem_25rem_at_90%_0%,rgba(34,211,238,0.07),transparent)]" />

        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="hidden min-[400px]:flex w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-white text-lg font-bold shrink-0 items-center justify-center" aria-hidden="true">&#9851;</div>
              <div className="min-w-0">
                <h1 className="text-[0.9375rem] sm:text-lg font-bold tracking-tight truncate">Green AI Trade-off<span className="hidden sm:inline"> Dashboard</span></h1>
                <p className="hidden sm:block text-[0.6875rem] text-slate-500 truncate">Modeling Green AI in System Architecture</p>
              </div>
            </div>
            <nav className="flex items-center gap-1.5" aria-label="Tools">
              <HeaderButton icon="tour" label="Guided tour" onClick={() => { setQuizzing(false); setTouring(true) }} active={touring} />
              <HeaderButton icon="quiz" label="Quiz" onClick={() => { setTouring(false); setQuizzing(true) }} active={quizzing} />
              <HeaderButton icon="print" label="Print summary" onClick={() => window.print()} desktopOnly />
              <HeaderButton icon="presenter" label="Presenter mode" onClick={() => setPresenter(!presenter)} active={presenter} desktopOnly />
              <HeaderButton icon={theme === 'light' ? 'moon' : 'sun'} label={theme === 'light' ? 'Dark theme' : 'Light theme'} onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
              <ShareButton />
            </nav>
          </div>
        </header>

        <main className={`relative max-w-[1720px] mx-auto px-4 sm:px-6 py-6 sm:py-8 ${touring ? 'pb-72' : ''}`}>
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <p className="max-w-3xl text-sm sm:text-base text-slate-400 leading-relaxed">
              The same AI model can emit <span className="text-emerald-300 font-semibold">over 100&times; more CO&#8322;</span> depending
              on its size, the chip it runs on, the grid that powers it and when it runs. Move the controls and watch
              accuracy, energy, emissions and cost respond.
            </p>
            {!touring && (
              <button
                type="button"
                onClick={() => setTouring(true)}
                className="self-start md:self-auto shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 text-sm font-semibold transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.tour} />
                </svg>
                Start the guided tour
              </button>
            )}
          </div>

          <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] 2xl:grid-cols-[400px_minmax(0,1fr)] gap-6 items-start">
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

              <div className="grid 2xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-5 items-start">
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
                <Card title="Greenest setup finder" dot="bg-emerald-400" subtitle="Tell it the accuracy you need; it finds the cleanest way to get there.">
                  <Optimiser current={current} onApply={applyPreset} />
                </Card>
              </div>

              <div className="grid xl:grid-cols-2 gap-5">
                <Card title="Diminishing returns" dot="bg-emerald-400" subtitle="Accuracy (solid) vs energy (dashed) as the model grows. Click to set complexity.">
                  <ComplexityCurve complexity={complexity} hardwareFactor={hardwareFactor} onPick={setComplexity} />
                </Card>
                <Card title="Hardware comparison" dot="bg-cyan-400" subtitle="CO₂ per hour for this model on every chip. Click a bar to switch.">
                  <HardwareComparison complexity={complexity} gridIntensity={gridIntensity} hardware={hardware} onPick={setHardware} />
                </Card>
              </div>

              <div className="grid xl:grid-cols-2 gap-5">
                <Card title="Time of day" dot="bg-rose-400" subtitle="Grid carbon changes through the day. The green band is when you run.">
                  <TimeOfDay co2={co2} gridIntensity={gridIntensity} hoursPerDay={hoursPerDay} startHour={startHour} setStartHour={setStartHour} />
                </Card>
                <Card title="Training vs usage" dot="bg-violet-400" subtitle="Training happens once; running the model never stops adding up.">
                  <TrainingVsUsage complexity={complexity} gridIntensity={gridIntensity} co2={co2} hoursPerDay={hoursPerDay} gridFactor={gridFactor} />
                </Card>
              </div>

              <div className="grid xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-5">
                <Card title="Yearly footprint" dot="bg-rose-400" subtitle="Projected from your daily usage and time window.">
                  <AnnualProjection energy={energy} co2={co2} cost={cost} hoursPerDay={hoursPerDay} gridFactor={gridFactor} />
                </Card>
                <Card
                  title="Compare scenarios"
                  dot="bg-fuchsia-400"
                  subtitle={`${pins.length}/${MAX_PINS} pinned`}
                  action={pins.length > 0 && (
                    <button type="button" onClick={clear} className="text-[0.6875rem] text-slate-500 hover:text-slate-300">Clear all</button>
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
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>Green AI Trade-off Dashboard</span>
            <span>
              Project by <span className="text-slate-200 font-semibold">Nishat Ahmed Samrin</span>
            </span>
          </div>
        </footer>

        {touring && <Tour onApply={applyPreset} onClose={closeTour} />}
        {quizzing && <Quiz onApply={applyPreset} onClose={closeQuiz} />}
      </div>

      <PrintReport
        config={current}
        metrics={{ accuracy, energy, efficiencyScore, co2, cost, tip }}
        hoursPerDay={hoursPerDay}
        startHour={startHour}
        gridFactor={gridFactor}
        pins={pins}
      />
    </>
  )
}
