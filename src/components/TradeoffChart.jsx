import { useChartTheme } from '../theme'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, Label, LabelList } from 'recharts'

const QUADRANTS = [
  { x1: 0, x2: 50, y1: 50, y2: 100, fill: '#f87171', label: 'Accurate but power-hungry' },
  { x1: 50, x2: 100, y1: 50, y2: 100, fill: '#4ade80', label: 'Sweet spot' },
  { x1: 0, x2: 50, y1: 0, y2: 50, fill: '#fb923c', label: 'Worst of both' },
  { x1: 50, x2: 100, y1: 0, y2: 50, fill: '#fbbf24', label: 'Lean but less accurate' },
]

export const PIN_COLORS = ['#a78bfa', '#f472b6', '#38bdf8', '#fbbf24']

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-200 font-semibold mb-0.5">{d.name}</p>
      <p className="text-emerald-300">Accuracy: {d.accuracy}%</p>
      <p className="text-cyan-300">Energy efficiency: {d.efficiency}/100</p>
    </div>
  )
}

function currentQuadrant(accuracy, efficiency) {
  const x = efficiency >= 50 ? 1 : 0
  const y = accuracy >= 50 ? 0 : 2
  return y + x
}

export default function TradeoffChart({ accuracy, efficiency, pins = [] }) {
  const t = useChartTheme()
  const activeQ = currentQuadrant(accuracy, efficiency)
  const current = [{ accuracy, efficiency, name: 'Current' }]

  return (
    <div>
      <ResponsiveContainer width="100%" height={t.fs(360)}>
        <ScatterChart margin={{ top: 10, right: 16, bottom: 28, left: 4 }}>
          {QUADRANTS.map((q, i) => (
            <ReferenceArea
              key={i}
              x1={q.x1} x2={q.x2} y1={q.y1} y2={q.y2}
              fill={q.fill}
              fillOpacity={activeQ === i ? 0.22 : 0.07}
              stroke="none"
            >
              <Label
                value={q.label}
                position="center"
                fill={activeQ === i ? t.labelActive : t.label}
                fontSize={t.fs(11)}
                fontWeight={activeQ === i ? 600 : 400}
              />
            </ReferenceArea>
          ))}

          <ReferenceLine x={50} stroke={t.axis} strokeDasharray="4 4" />
          <ReferenceLine y={50} stroke={t.axis} strokeDasharray="4 4" />

          <XAxis
            type="number" dataKey="efficiency" domain={[0, 100]} name="Efficiency"
            tick={{ fill: t.tick, fontSize: t.fs(11) }}
            axisLine={{ stroke: t.axis }}
            tickLine={{ stroke: t.axis }}
            label={{ value: 'Energy efficiency →', position: 'bottom', fill: t.tick, fontSize: t.fs(11), offset: 10 }}
          />
          <YAxis
            type="number" dataKey="accuracy" domain={[0, 100]} name="Accuracy"
            tick={{ fill: t.tick, fontSize: t.fs(11) }}
            axisLine={{ stroke: t.axis }}
            tickLine={{ stroke: t.axis }}
            width={44}
            label={{ value: 'Model accuracy →', angle: -90, position: 'insideLeft', fill: t.tick, fontSize: t.fs(11), offset: 12, style: { textAnchor: 'middle' } }}
          />
          <ZAxis range={[110]} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: t.cursor }} />

          {pins.map((p, i) => (
            <Scatter
              key={p.id}
              data={[{ accuracy: p.accuracy, efficiency: p.efficiency, name: p.name, tag: p.name.replace('Scenario ', '') }]}
              fill={PIN_COLORS[i % PIN_COLORS.length]}
              fillOpacity={0.35}
              stroke={PIN_COLORS[i % PIN_COLORS.length]}
              strokeWidth={2}
              isAnimationActive={false}
            >
              <LabelList dataKey="tag" position="top" fill={PIN_COLORS[i % PIN_COLORS.length]} fontSize={t.fs(11)} fontWeight={600} offset={9} />
            </Scatter>
          ))}

          <Scatter data={current} fill="#4ade80" stroke={t.dotStroke} strokeWidth={3} animationDuration={400} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}
