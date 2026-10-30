import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, CartesianGrid } from 'recharts'
import { useChartTheme } from '../theme'
import { HOURLY_PROFILE, windowHours, windowFactor, greenestStart } from '../utils/calculations'

const hh = h => `${String(h).padStart(2, '0')}:00`

function HourTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-200 font-semibold mb-0.5">{hh(d.h)}{d.inWindow ? ' · running' : ''}</p>
      <p className="text-rose-300">{d.co2} kg CO&#8322; per hour of running</p>
      <p className="text-slate-500">Grid {d.grid} kg/kWh</p>
    </div>
  )
}

// Contiguous [start, end) ranges of the running window, split where it wraps past midnight.
function windowRanges(start, hours) {
  if (hours >= 24) return [[0, 23]]
  const end = start + hours
  return end <= 24 ? [[start, end - 1]] : [[start, 23], [0, end - 25]]
}

export default function TimeOfDay({ co2, gridIntensity, hoursPerDay, startHour, setStartHour }) {
  const t = useChartTheme()
  const running = new Set(windowHours(startHour, hoursPerDay))
  const data = useMemo(() => HOURLY_PROFILE.map((m, h) => ({
    h,
    co2: Math.round(co2 * m * 100) / 100,
    grid: (gridIntensity * m).toFixed(2),
    inWindow: running.has(h),
  })), [co2, gridIntensity, startHour, hoursPerDay]) // eslint-disable-line react-hooks/exhaustive-deps

  const best = greenestStart(hoursPerDay)
  const mine = co2 * windowFactor(startHour, hoursPerDay) * hoursPerDay
  const greenest = co2 * windowFactor(best, hoursPerDay) * hoursPerDay
  const saving = mine > 0 ? 1 - greenest / mine : 0

  return (
    <div>
      <ResponsiveContainer width="100%" height={t.fs(200)}>
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="todFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={t.rose} stopOpacity={0.35} />
              <stop offset="100%" stopColor={t.rose} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={t.grid} vertical={false} />
          {windowRanges(startHour, hoursPerDay).map(([a, b]) => (
            <ReferenceArea key={a} x1={a} x2={b} fill={t.accent} fillOpacity={0.14} stroke="none" />
          ))}
          <XAxis dataKey="h" type="number" domain={[0, 23]} ticks={[0, 6, 12, 18, 23]} tickFormatter={hh}
            tick={{ fill: t.tick, fontSize: t.fs(11) }} axisLine={{ stroke: t.axis }} tickLine={false} />
          <YAxis tick={{ fill: t.tick, fontSize: t.fs(11) }} axisLine={false} tickLine={false} />
          <Tooltip content={<HourTooltip />} cursor={{ stroke: t.cursor }} />
          <Area type="monotone" dataKey="co2" stroke={t.rose} strokeWidth={2} fill="url(#todFill)" isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-3">
        <div className="flex items-baseline justify-between mb-2">
          <label htmlFor="start-hour" className="text-sm font-medium text-slate-300">Start running at</label>
          <span className="font-mono text-sm text-emerald-300 tabular-nums">
            {hh(startHour)}{hoursPerDay < 24 && ` – ${hh((startHour + hoursPerDay) % 24)}`}
          </span>
        </div>
        <div className="relative">
          <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-2 rounded-full bg-slate-800 pointer-events-none" />
          <div className="absolute top-1/2 -translate-y-1/2 left-0 h-2 rounded-full pointer-events-none bg-gradient-to-r from-rose-500/50 to-amber-500/50" style={{ width: `${(startHour / 23) * 100}%` }} />
          <input id="start-hour" type="range" min={0} max={23} step={1} value={startHour}
            onChange={e => setStartHour(Number(e.target.value))} className="relative z-10" />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-800/50 px-3 py-2.5">
        <p className="text-xs text-slate-400 leading-relaxed">
          {hoursPerDay >= 24
            ? 'Running 24/7 there is no cleaner time to move to. Fewer hours a day lets you chase the clean midday hours.'
            : saving < 0.005
              ? <>You already run in the cleanest {hoursPerDay}-hour window: <span className="font-mono text-slate-200">{mine.toFixed(1)} kg</span> CO&#8322;/day.</>
              : <>Your window: <span className="font-mono text-slate-200">{mine.toFixed(1)} kg</span>/day. Starting at {hh(best)} instead: <span className="font-mono text-emerald-300">{greenest.toFixed(1)} kg</span>/day, <strong className="text-emerald-300">{Math.round(saving * 100)}% less</strong>.</>}
        </p>
        {hoursPerDay < 24 && saving >= 0.005 && (
          <button type="button" onClick={() => setStartHour(best)}
            className="shrink-0 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 ring-1 ring-emerald-500/30 px-2.5 py-1.5 text-xs font-semibold transition-colors">
            Shift to {hh(best)}
          </button>
        )}
      </div>
      <p className="mt-2 text-[0.6875rem] text-slate-500">Illustrative daily curve for a grid with solar power: cleanest around midday, dirtiest at the evening peak.</p>
    </div>
  )
}
