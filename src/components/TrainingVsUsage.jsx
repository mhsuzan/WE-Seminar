import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from 'recharts'
import { useChartTheme } from '../theme'
import { calcTrainingKwh, GPT3_TRAINING_KWH } from '../utils/calculations'

const MONTHS = 36
const DAYS_PER_MONTH = 365 / 12

function tonnes(kg) {
  return kg >= 1000 ? `${(kg / 1000).toFixed(kg >= 100000 ? 0 : 1)} t` : `${Math.round(kg)} kg`
}

function MonthTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-200 font-semibold mb-0.5">After {d.month} month{d.month === 1 ? '' : 's'}</p>
      <p className="text-violet-300">Training: {tonnes(d.training)}</p>
      <p className="text-amber-300">Usage: {tonnes(d.usage)}</p>
    </div>
  )
}

export default function TrainingVsUsage({ complexity, gridIntensity, co2, hoursPerDay, gridFactor }) {
  const t = useChartTheme()
  const trainingKwh = calcTrainingKwh(complexity)
  const trainingKg = trainingKwh * gridIntensity
  const usagePerDay = co2 * gridFactor * hoursPerDay
  const crossMonths = usagePerDay > 0 ? trainingKg / (usagePerDay * DAYS_PER_MONTH) : Infinity

  const data = useMemo(() => Array.from({ length: MONTHS + 1 }, (_, month) => ({
    month,
    training: Math.round(trainingKg),
    usage: Math.round(usagePerDay * DAYS_PER_MONTH * month),
  })), [trainingKg, usagePerDay])

  const gpt3Pct = (trainingKwh / GPT3_TRAINING_KWH) * 100

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-xl bg-slate-800/50 px-3 py-2.5">
          <div className="text-[0.6875rem] text-slate-500 uppercase tracking-wider">Training (once)</div>
          <div className="font-mono font-bold text-violet-300 text-lg">{tonnes(trainingKg)}</div>
          <div className="text-[0.6875rem] text-slate-500">{Math.round(trainingKwh / 1000).toLocaleString()} MWh</div>
        </div>
        <div className="rounded-xl bg-slate-800/50 px-3 py-2.5">
          <div className="text-[0.6875rem] text-slate-500 uppercase tracking-wider">Usage overtakes it</div>
          <div className="font-mono font-bold text-amber-300 text-lg">
            {crossMonths > MONTHS ? `> ${MONTHS / 12} years` : crossMonths < 1 ? `${Math.max(1, Math.round(crossMonths * DAYS_PER_MONTH))} days` : `${crossMonths.toFixed(1)} months`}
          </div>
          <div className="text-[0.6875rem] text-slate-500">{tonnes(usagePerDay * 365)} CO&#8322; a year of use</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={t.fs(190)}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 14, left: -4 }}>
          <CartesianGrid stroke={t.grid} vertical={false} />
          <XAxis dataKey="month" type="number" domain={[0, MONTHS]} ticks={[0, 12, 24, 36]} tickFormatter={m => (m ? `${m / 12}y` : '0')}
            tick={{ fill: t.tick, fontSize: t.fs(11) }} axisLine={{ stroke: t.axis }} tickLine={false}
            label={{ value: 'Time in production', position: 'bottom', fill: t.tick, fontSize: t.fs(11), offset: 0 }} />
          <YAxis tickFormatter={v => (v >= 1000 ? `${Math.round(v / 1000)}t` : v)} tick={{ fill: t.tick, fontSize: t.fs(11) }} axisLine={false} tickLine={false} />
          <Tooltip content={<MonthTooltip />} cursor={{ stroke: t.cursor }} />
          {crossMonths <= MONTHS && <ReferenceLine x={crossMonths} stroke={t.labelActive} strokeDasharray="3 3" />}
          <Area type="monotone" dataKey="training" stackId="a" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.25} isAnimationActive={false} />
          <Area type="monotone" dataKey="usage" stackId="a" stroke={t.amber} fill={t.amber} fillOpacity={0.25} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>

      <p className="mt-2 text-[0.6875rem] text-slate-500 leading-relaxed">
        Training is a one-off cost, assumed on an A100-class cluster on the same grid. For scale, it is {gpt3Pct < 1 ? gpt3Pct.toFixed(2) : Math.round(gpt3Pct)}% of
        GPT-3&rsquo;s estimated 1,287 MWh. Usage keeps adding up for as long as the model runs.
      </p>
    </div>
  )
}
