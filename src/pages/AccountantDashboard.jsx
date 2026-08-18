import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { Card, Button, EmptyState } from '../components/ui'

export default function AccountantDashboard() {
  const [stats, setStats] = useState(null)
  const [completed, setCompleted] = useState([])
  const [paidApptIds, setPaidApptIds] = useState(new Set())
  const [activeAppt, setActiveAppt] = useState(null)
  const [loading, setLoading] = useState(true)

  const today = new Date().toISOString().slice(0, 10)

  const load = useCallback(async () => {
    setLoading(true)
    const [statsData, apptData, paymentsData] = await Promise.all([
      apiRequest('/stats/summary'),
      apiRequest(`/appointments?date=${today}&status=completed`),
      apiRequest(`/payments?from=${today}T00:00:00`),
    ])
    setStats(statsData)
    setCompleted(apptData.appointments)
    setPaidApptIds(new Set(paymentsData.payments.map((p) => p.appointment_id).filter(Boolean)))
    setLoading(false)
  }, [today])

  useEffect(() => {
    load()
  }, [load])

  const unpaid = completed.filter((a) => !paidApptIds.has(a.id))

  return (
    <div>
      <h1 className="text-xl font-semibold text-ink mb-5">Kassa</h1>

      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card>
            <div className="text-sm text-ink/50 mb-1">Bugünkü daxilolma</div>
            <div className="text-2xl font-semibold text-ink">{stats.today_total.toFixed(2)} ₼</div>
          </Card>
          <Card>
            <div className="text-sm text-ink/50 mb-1">Aylıq daxilolma</div>
            <div className="text-2xl font-semibold text-ink">{stats.month_total.toFixed(2)} ₼</div>
          </Card>
        </div>
      )}

      <h2 className="font-medium text-ink mb-3">Ödənişi gözləyən müayinələr</h2>
      {loading ? (
        <p className="text-ink/40">Yüklənir…</p>
      ) : unpaid.length === 0 ? (
        <EmptyState title="Ödənişi gözləyən müayinə yoxdur" />
      ) : (
        <div className="space-y-2 mb-8">
          {unpaid.map((a) => (
            <Card key={a.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-ink">{a.patient?.full_name}</div>
                <div className="text-sm text-ink/50">Həkim: {a.doctor?.full_name}</div>
              </div>
              <Button onClick={() => setActiveAppt(a)}>Ödəniş yaz</Button>
            </Card>
          ))}
        </div>
      )}

      {stats?.per_doctor?.length > 0 && (
        <>
          <h2 className="font-medium text-ink mb-3">Həkim üzrə breakdown (bu ay)</h2>
          <Card>
            {stats.per_doctor.map((d) => (
              <div key={d.doctor_id} className="flex items-center justify-between py-2 border-b last:border-0 border-black/5">
                <span className="text-sm text-ink">{d.full_name}</span>
                <span className="text-sm text-ink/60">{d.month.toFixed(2)} ₼</span>
              </div>
            ))}
          </Card>
        </>
      )}

      {activeAppt && <PaymentForm appointment={activeAppt} onClose={() => setActiveAppt(null)} onSaved={load} />}
    </div>
  )
}

function PaymentForm({ appointment, onClose, onSaved }) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await apiRequest('/payments', {
        method: 'POST',
        body: {
          appointment_id: appointment.id,
          patient_id: appointment.patient.id,
          doctor_id: appointment.doctor.id,
          amount: Number(amount),
          payment_method: method,
        },
      })
      onSaved()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-5 z-20">
      <Card className="w-full max-w-sm animate-fade-in">
        <h3 className="font-semibold text-ink mb-1">{appointment.patient.full_name}</h3>
        <p className="text-sm text-ink/50 mb-4">Həkim: {appointment.doctor.full_name}</p>
        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-ink/80 mb-1.5">Məbləğ (₼)</label>
          <input required type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3" />
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3">
            <option value="cash">Nağd</option>
            <option value="card">Kart</option>
            <option value="transfer">Köçürmə</option>
          </select>
          {error && <p className="text-danger text-sm mb-3">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? 'Yadda saxlanılır…' : 'Təsdiqlə'}</Button>
            <Button type="button" variant="ghost" onClick={onClose}>Ləğv et</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
