export default function Card({ title, dot = 'bg-emerald-400', subtitle, action, className = '', children }) {
  return (
    <section className={`bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] ${className}`}>
      {title && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              {title}
            </h2>
            {subtitle && <p className="text-xs text-slate-500 mt-1 ml-4">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
