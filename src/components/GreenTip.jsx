export default function GreenTip({ tip }) {
  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 border border-slate-700/50 rounded-2xl p-4 shadow-lg">
      <div className="flex items-start gap-2.5">
        <span className="text-emerald-400 text-sm mt-0.5 shrink-0">&#128161;</span>
        <p className="text-xs text-slate-400 leading-relaxed">{tip}</p>
      </div>
    </div>
  )
}
