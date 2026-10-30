import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
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
  const data = useMemo(() => {
    const rows = []
    for (let c = 1; c <= 100; c++) rows.push({ c, accuracy: calcAccuracy(c), energy: calcEnergy(c, hardwareFactor) })
    return rows
  }, [hardwareFactor])

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 4, bottom: 18, left: -8 }}
        onClick={e => e && e.activeLabel != null && onPick(Number(e.activeLabel))}
        style={{ cursor: 'pointer' }}
      >
        <CartesianGrid stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="c" type="number" domain={[1, 100]} ticks={[1, 25, 50, 75, 100]}
          tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false}
          label={{ value: 'Model complexity', position: 'bottom', fill: '#94a3b8', fontSize: 11, offset: 2 }}
        />
        <YAxis yAxisId="acc" domain={[0, 100]} tick={{ fill: '#6ee7b7', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="en" orientation="right" tick={{ fill: '#fcd34d', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CurveTooltip />} cursor={{ stroke: '#475569' }} />
        <ReferenceLine yAxisId="acc" x={complexity} stroke="#e2e8f0" strokeDasharray="3 3" />
        <Line yAxisId="acc" type="monotone" dataKey="accuracy" stroke="#34d399" strokeWidth={2.5} dot={false} isAnimationActive={false} />
        <Line yAxisId="en" type="monotone" dataKey="energy" stroke="#fbbf24" strokeWidth={2} dot={false} strokeDasharray="5 3" isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
