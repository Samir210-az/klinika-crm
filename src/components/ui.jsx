export function Card({ children, className = '' }) {
  return (
    <div className={`bg-surface rounded-2xl border border-black/5 shadow-sm p-5 ${className}`}>
      {children}
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
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[status] || 'bg-black/5'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-primary-light text-primary hover:bg-primary/20',
    danger: 'bg-danger/10 text-danger hover:bg-danger/20',
    ghost: 'text-ink/60 hover:bg-black/5',
  }
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
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
