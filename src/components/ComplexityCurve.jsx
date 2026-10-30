import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { useChartTheme } from '../theme'
import { calcAccuracy, calcEnergy } from '../utils/calculations'

function CurveTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-300 font-semibold mb-0.5">Complexity {label}</p>
      <p className="text-emerald-300">Accuracy: {d.accuracy}%</p>
      <p className="text-amber-300">Energy: {d.energy} kWh</p>
    </div>
  )
}

export default function ComplexityCurve({ complexity, hardwareFactor, onPick }) {
  const t = useChartTheme()
  const data = useMemo(() => {
    const rows = []
    for (let c = 1; c <= 100; c++) rows.push({ c, accuracy: calcAccuracy(c), energy: calcEnergy(c, hardwareFactor) })
    return rows
  }, [hardwareFactor])

  return (
    <ResponsiveContainer width="100%" height={t.fs(240)}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 4, bottom: 18, left: -8 }}
        onClick={e => e && e.activeLabel != null && onPick(Number(e.activeLabel))}
        style={{ cursor: 'pointer' }}
      >
        <CartesianGrid stroke={t.grid} vertical={false} />
        <XAxis
          dataKey="c" type="number" domain={[1, 100]} ticks={[1, 25, 50, 75, 100]}
          tick={{ fill: t.tick, fontSize: t.fs(11) }} axisLine={{ stroke: t.axis }} tickLine={false}
          label={{ value: 'Model complexity', position: 'bottom', fill: t.tick, fontSize: t.fs(11), offset: 2 }}
        />
        <YAxis yAxisId="acc" domain={[0, 100]} tick={{ fill: t.accentSoft, fontSize: t.fs(11) }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="en" orientation="right" tick={{ fill: t.amberSoft, fontSize: t.fs(11) }} axisLine={false} tickLine={false} />
        <Tooltip content={<CurveTooltip />} cursor={{ stroke: t.cursor }} />
        <ReferenceLine yAxisId="acc" x={complexity} stroke={t.labelActive} strokeDasharray="3 3" />
        <Line yAxisId="acc" type="monotone" dataKey="accuracy" stroke={t.accent} strokeWidth={2.5} dot={false} isAnimationActive={false} />
        <Line yAxisId="en" type="monotone" dataKey="energy" stroke={t.amber} strokeWidth={2} dot={false} strokeDasharray="5 3" isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
