import { useMemo } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ResponsiveContainer, ReferenceArea, ReferenceLine, Label } from 'recharts'

const QUADRANTS = [
  { x1: 0, x2: 50, y1: 50, y2: 100, fill: '#f87171', opacity: 0.15, label: 'High Acc\nLow Eff' },
  { x1: 50, x2: 100, y1: 50, y2: 100, fill: '#4ade80', opacity: 0.15, label: 'High Acc\nHigh Eff' },
  { x1: 0, x2: 50, y1: 0, y2: 50, fill: '#fb923c', opacity: 0.15, label: 'Low Acc\nLow Eff' },
  { x1: 50, x2: 100, y1: 0, y2: 50, fill: '#fbbf24', opacity: 0.15, label: 'Low Acc\nHigh Eff' },
]

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-emerald-300 font-medium">Accuracy: {d.accuracy}%</p>
      <p className="text-cyan-300">Efficiency: {d.efficiency}/100</p>
    </div>
  )
}

function currentQuadrant(accuracy, efficiency) {
  const x = efficiency >= 50 ? 1 : 0
  const y = accuracy >= 50 ? 1 : 0
  return y * 2 + x
}

export default function TradeoffChart({ accuracy, efficiency }) {
  const data = useMemo(() => [{ accuracy, efficiency }], [accuracy, efficiency])
  const activeQ = currentQuadrant(accuracy, efficiency)

  return (
    <div>
      <h2 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-violet-400" />
        Trade-off Space
      </h2>
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-800/20 border border-slate-700/50 rounded-xl p-2">
        <ResponsiveContainer width="100%" height={380}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 30, left: 40 }}>
            <rect x={0} y={0} width="100%" height="100%" fill="#0f172a" rx={8} />

            {QUADRANTS.map((q, i) => (
              <ReferenceArea
                key={i}
                x1={q.x1} x2={q.x2} y1={q.y1} y2={q.y2}
                fill={q.fill}
                fillOpacity={activeQ === i ? 0.28 : q.opacity}
              >
                <Label
                  value={q.label}
                  position="center"
                  fill="#64748b"
                  fontSize={10}
                  fontWeight={activeQ === i ? 500 : 400}
                />
              </ReferenceArea>
            ))}

            <ReferenceLine x={50} stroke="#334155" strokeDasharray="4 4" strokeWidth={1} />
            <ReferenceLine y={50} stroke="#334155" strokeDasharray="4 4" strokeWidth={1} />

            <XAxis
              type="number" dataKey="efficiency" domain={[0, 100]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              label={{ value: 'Energy Efficiency', position: 'bottom', fill: '#94a3b8', fontSize: 11, offset: 10 }}
            />
            <YAxis
              type="number" dataKey="accuracy" domain={[0, 100]}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={{ stroke: '#334155' }}
              label={{ value: 'Model Accuracy', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11, offset: 10 }}
            />
            <ZAxis range={[130]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

            <Scatter data={data} shape="circle" animationDuration={400} isAnimationActive>
              <Cell fill="#4ade80" stroke="#34d399" strokeWidth={3} />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
