export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface rounded-2xl border border-black/[0.06] shadow-[0_1px_2px_rgba(16,36,32,0.04),0_8px_24px_-16px_rgba(16,36,32,0.12)] p-5 ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, sublabel, icon: Icon }) {
  return (
    <Card className="relative overflow-hidden">
      {Icon && <Icon size={18} className="absolute top-5 right-5 text-primary/30" strokeWidth={1.75} />}
      <div className="text-xs font-medium uppercase tracking-wide text-ink/40 mb-2">{label}</div>
      <div className="font-display text-3xl font-semibold text-ink tabular-nums">{value}</div>
      {sublabel && <div className="text-xs text-ink/40 mt-1">{sublabel}</div>}
    </Card>
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
    <div className="text-center py-14 text-ink/40">
      <p className="font-medium text-ink/60">{title}</p>
      {hint && <p className="text-sm mt-1">{hint}</p>}
    </div>
  )
}
