import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { Card, Button, EmptyState, Avatar, TealCard } from '../components/ui'
import { FlaskConical } from 'lucide-react'

export default function LabDashboard() {
  const [orders, setOrders] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await apiRequest('/lab-orders?status=pending')
    setOrders(data.lab_orders)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (selected) {
    return <LabOrderDetail order={selected} onBack={() => { setSelected(null); load() }} />
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-5">Analiz gözləyən pasiyentlər</h1>
      {loading ? (
        <p className="text-ink/60">Yüklənir…</p>
      ) : orders.length === 0 ? (
        <EmptyState title="Gözləyən analiz yoxdur" hint="Həkim analiz təyin etdikdə burada görünəcək." />
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <TealCard key={o.id} className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelected(o)}>
              <Avatar name={o.patient?.full_name} dark />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{o.patient?.full_name}</div>
                <div className="text-sm text-white/70 truncate">{o.tests}</div>
              </div>
              <FlaskConical size={18} className="text-white/50 shrink-0" />
            </TealCard>
          ))}
        </div>
      )}
    </div>
  )
}

function LabOrderDetail({ order, onBack }) {
  const [results, setResults] = useState(order.results || '')
  const [saving, setSaving] = useState(false)

  async function complete() {
    setSaving(true)
    try {
      await apiRequest(`/lab-orders/${order.id}`, { method: 'PATCH', body: { results, status: 'completed' } })
      onBack()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="text-sm text-ink/65 hover:text-ink mb-4">← Siyahıya qayıt</button>

      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={order.patient?.full_name} />
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">{order.patient?.full_name}</h2>
            <p className="text-sm text-ink/65">Həkim: {order.doctor?.full_name}</p>
          </div>
        </div>
      </Card>

      <Card className="mb-4">
        <div className="text-sm font-medium text-ink/80 mb-1.5">Təyin edilmiş analizlər</div>
        <p className="text-sm text-ink whitespace-pre-wrap bg-bg rounded-lg px-3 py-2.5">{order.tests}</p>
      </Card>

      <Card className="mb-4">
        <label className="block text-sm font-medium text-ink/80 mb-1.5">Nəticə</label>
        <textarea
          value={results}
          onChange={(e) => setResults(e.target.value)}
          rows={6}
          placeholder="Analiz nəticələrini bura yaz…"
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
        />
      </Card>

      <Button onClick={complete} disabled={saving || !results.trim()} className="w-full py-3">
        {saving ? 'Yadda saxlanılır…' : 'Nəticəni yadda saxla və həkimə göndər'}
      </Button>
    </div>
  )
}
