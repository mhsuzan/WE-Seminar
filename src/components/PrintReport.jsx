import { calcAnnual, calcScenario, hardwareInfo, GRID_REGIONS, calcTrainingKwh } from '../utils/calculations'
import { fmt, everydayEquivalents } from './AnnualProjection'

const hh = h => `${String(h).padStart(2, '0')}:00`

// Print-only one-page summary. Uses the fixed-colour .rpt styles in index.css, not the theme.
export default function PrintReport({ config, metrics, hoursPerDay, startHour, gridFactor, pins }) {
  const { complexity, hardware, gridIntensity } = config
  const m = metrics
  const a = calcAnnual(m.energy, m.co2, m.cost, hoursPerDay, gridFactor)
  const region = GRID_REGIONS.find(r => Math.abs(r.value - gridIntensity) < 0.005)?.label
  const trainingT = (calcTrainingKwh(complexity) * gridIntensity) / 1000
  const date = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })

  const scenarios = [{ name: 'Current', ...config }, ...pins]

  return (
    <div className="print-only rpt">
      <h1>Green AI Trade-off Summary</h1>
      <div className="muted">Modeling Green AI in System Architecture &middot; {date}</div>

      <h2>Configuration</h2>
      <table>
        <tbody>
          <tr><td>Model complexity</td><td>{complexity} / 100</td></tr>
          <tr><td>Compute hardware</td><td>{hardwareInfo(hardware).label} ({hardwareInfo(hardware).factor}x)</td></tr>
          <tr><td>Grid carbon intensity</td><td>{gridIntensity.toFixed(2)} kg CO&#8322;/kWh{region ? ` (${region})` : ''}</td></tr>
          <tr><td>Daily usage</td><td>{hoursPerDay} h/day{hoursPerDay < 24 ? `, ${hh(startHour)}–${hh((startHour + hoursPerDay) % 24)}` : ''}</td></tr>
        </tbody>
      </table>

      <h2>Per hour of operation</h2>
      <div className="grid">
        <div className="box"><div className="lbl">Energy</div><div className="val">{m.energy} kWh</div></div>
        <div className="box"><div className="lbl">CO&#8322;</div><div className="val">{m.co2} kg</div></div>
        <div className="box"><div className="lbl">Accuracy</div><div className="val">{m.accuracy}%</div></div>
        <div className="box"><div className="lbl">Efficiency</div><div className="val">{m.efficiencyScore}/100</div></div>
      </div>
      <p className="muted">Running cost &euro;{m.cost.total.toFixed(2)}/hr (energy &euro;{m.cost.electricity.toFixed(2)} + hardware &euro;{m.cost.hardware.toFixed(2)}).</p>

      <h2>Per year</h2>
      <div className="grid">
        <div className="box"><div className="lbl">Energy</div><div className="val">{fmt(a.energyKwh, 'kWh')}</div></div>
        <div className="box"><div className="lbl">CO&#8322;</div><div className="val">{(a.co2Kg / 1000).toFixed(1)} t</div></div>
        <div className="box"><div className="lbl">Cost</div><div className="val">&euro;{fmt(a.cost)}</div></div>
        <div className="box"><div className="lbl">Trees to offset</div><div className="val">{a.trees.toLocaleString()}</div></div>
      </div>
      <p>
        That is about {everydayEquivalents(a).map(e => `${fmt(e.value)} ${e.label}`).join(', ')}.
        Training the model once adds roughly {trainingT.toFixed(trainingT < 10 ? 1 : 0)} t CO&#8322;.
      </p>

      {pins.length > 0 && (
        <>
          <h2>Scenario comparison</h2>
          <table>
            <thead>
              <tr><th>Scenario</th><th>Setup</th><th>Accuracy</th><th>Energy</th><th>CO&#8322;</th><th>Efficiency</th><th>Cost</th></tr>
            </thead>
            <tbody>
              {scenarios.map(s => {
                const sm = calcScenario(s)
                return (
                  <tr key={s.name}>
                    <td><strong>{s.name}</strong></td>
                    <td>C{s.complexity} &middot; {hardwareInfo(s.hardware).short} &middot; {s.gridIntensity.toFixed(2)}</td>
                    <td>{sm.accuracy}%</td>
                    <td>{sm.energy} kWh</td>
                    <td>{sm.co2} kg</td>
                    <td>{sm.efficiencyScore}/100</td>
                    <td>&euro;{sm.cost.total.toFixed(2)}/hr</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      <h2>Recommendation</h2>
      <div className="tip">{m.tip}</div>

      <footer>
        <span>Green AI Trade-off Dashboard &middot; seminar.codinzy.com</span>
        <span>Project by <strong>Nishat Ahmed Samrin</strong></span>
      </footer>
    </div>
  )
}
