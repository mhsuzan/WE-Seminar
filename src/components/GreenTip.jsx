export default function GreenTip({ tip }) {
  return (
    <div className="rounded-2xl p-4 border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent">
      <div className="flex items-start gap-3">
        <span className="text-base leading-none mt-0.5 shrink-0" aria-hidden="true">&#128161;</span>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-emerald-300/80 font-semibold mb-1">Green tip</div>
          <p className="text-sm text-slate-300 leading-relaxed" aria-live="polite">{tip}</p>
        </div>
      </div>
    </div>
  )
}
