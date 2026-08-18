export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-surface rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(16,36,32,0.04),0_8px_24px_-16px_rgba(16,36,32,0.12)] p-5 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, sublabel, icon: Icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary text-white p-5 shadow-[0_8px_24px_-12px_rgba(31,95,91,0.5)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(120% 90% at 100% 0%, rgba(255,255,255,0.14), transparent 55%), radial-gradient(90% 70% at 0% 100%, rgba(0,0,0,0.18), transparent 60%)',
        }}
      />
      {Icon && <Icon size={18} className="absolute top-5 right-5 text-white/50" strokeWidth={1.75} />}
      <div className="relative text-xs font-medium uppercase tracking-wide text-white/70 mb-2">{label}</div>
      <div className="relative font-display text-3xl font-semibold tabular-nums">{value}</div>
      {sublabel && <div className="relative text-xs text-white/60 mt-1">{sublabel}</div>}
    </div>
  )
}

const STATUS_STYLES = {
  waiting: 'bg-warning/10 text-warning',
  in_progress: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
}

const STATUS_LABELS = {
  waiting: 'Gözləyir',
  in_progress: 'Müayinədə',
  completed: 'Tamamlandı',
  cancelled: 'Ləğv edilib',
}

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status] || 'bg-black/5'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-primary-light text-primary hover:bg-primary/15',
    danger: 'bg-danger/10 text-danger hover:bg-danger/20',
    ghost: 'text-ink/60 hover:bg-black/5',
  }
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Avatar({ name }) {
  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
    : '?'
  return (
    <div className="w-9 h-9 shrink-0 rounded-full bg-primary-light text-primary font-display font-semibold text-sm flex items-center justify-center">
      {initials}
    </div>
  )
}

export function EmptyState({ title, hint }) {
  return (
    <div className="text-center py-14 text-ink/60">
      <p className="font-medium text-ink/60">{title}</p>
      {hint && <p className="text-sm mt-1">{hint}</p>}
    </div>
  )
}
