import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { Avatar, EmptyState, TealCard } from './ui'
import { FlaskConical } from 'lucide-react'

export default function LabOverview() {
  const [pending, setPending] = useState([])
  const [completed, setCompleted] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiRequest('/lab-orders?status=pending'),
      apiRequest('/lab-orders?status=completed'),
    ]).then(([p, c]) => {
      setPending(p.lab_orders)
      setCompleted(c.lab_orders.slice(0, 20))
      setLoading(false)
    })
  }, [])

  if (loading) return <p className="text-ink/60">Yüklənir…</p>

  return (
    <div>
      <h2 className="font-display text-lg font-semibold text-ink mb-3">Gözləyən analizlər</h2>
      {pending.length === 0 ? (
        <EmptyState title="Gözləyən analiz yoxdur" />
      ) : (
        <div className="space-y-2 mb-8">
          {pending.map((o) => (
            <TealCard key={o.id} className="flex items-center gap-3">
              <Avatar name={o.patient?.full_name} dark />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{o.patient?.full_name}</div>
                <div className="text-sm text-white/70 truncate">{o.tests} · Həkim: {o.doctor?.full_name}</div>
              </div>
              <FlaskConical size={16} className="text-[#f0d9a0] shrink-0" />
            </TealCard>
          ))}
        </div>
      )}

      <h2 className="font-display text-lg font-semibold text-ink mb-3">Son tamamlananlar</h2>
      {completed.length === 0 ? (
        <EmptyState title="Hələ tamamlanmış analiz yoxdur" />
      ) : (
        <div className="space-y-2">
          {completed.map((o) => (
            <TealCard key={o.id} className="flex items-center gap-3">
              <Avatar name={o.patient?.full_name} dark />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{o.patient?.full_name}</div>
                <div className="text-sm text-white/70 truncate">{o.tests} · Həkim: {o.doctor?.full_name}</div>
              </div>
              <FlaskConical size={16} className="text-[#a8e0c8] shrink-0" />
            </TealCard>
          ))}
        </div>
      )}
    </div>
  )
}
