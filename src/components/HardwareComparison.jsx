import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useChartTheme } from '../theme'
import { HARDWARE_OPTIONS, calcEnergy, calcCo2 } from '../utils/calculations'

function HwTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-200 font-semibold mb-0.5">{d.label}</p>
      <p className="text-amber-300">Energy: {d.energy} kWh</p>
      <p className="text-rose-300">CO&#8322;: {d.co2} kg</p>
      <p className="text-slate-500 mt-1">Click to switch</p>
    </div>
  )
}

export default function HardwareComparison({ complexity, gridIntensity, hardware, onPick }) {
  const t = useChartTheme()
  const data = useMemo(() => HARDWARE_OPTIONS.map(h => {
    const energy = calcEnergy(complexity, h.factor)
    return { value: h.value, label: h.label, short: h.short, energy, co2: calcCo2(energy, gridIntensity) }
  }), [complexity, gridIntensity])

  return (
    <ResponsiveContainer width="100%" height={t.fs(300)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}>
        <XAxis type="number" tick={{ fill: t.tick, fontSize: t.fs(11) }} axisLine={{ stroke: t.axis }} tickLine={false} unit=" kg" />
        <YAxis type="category" dataKey="short" width={t.fs(78)} tick={{ fill: t.tickStrong, fontSize: t.fs(11) }} axisLine={false} tickLine={false} />
        <Tooltip content={<HwTooltip />} cursor={{ fill: t.cursorFill }} />
        <Bar dataKey="co2" radius={[0, 6, 6, 0]} onClick={d => onPick(d.value)} style={{ cursor: 'pointer' }} isAnimationActive={false}>
          {data.map(d => (
            <Cell key={d.value} fill={d.value === hardware ? t.accent : t.bar} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
