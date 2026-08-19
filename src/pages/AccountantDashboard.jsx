import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Card, Button, EmptyState, StatCard, Avatar, TealCard } from '../components/ui'
import ExpensesPanel from '../components/ExpensesPanel'
import { Wallet, CalendarClock, FlaskConical, TrendingUp } from 'lucide-react'

export default function AccountantDashboard() {
  const { employee } = useAuth()
  const canSeeExpenses = ['director', 'accountant'].includes(employee.role)
  const [tab, setTab] = useState('kassa')
  const [stats, setStats] = useState(null)
  const [completed, setCompleted] = useState([])
  const [paidApptIds, setPaidApptIds] = useState(new Set())
  const [labOrders, setLabOrders] = useState([])
  const [paidLabOrderIds, setPaidLabOrderIds] = useState(new Set())
  const [activeAppt, setActiveAppt] = useState(null)
  const [activeLabOrder, setActiveLabOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const today = new Date().toISOString().slice(0, 10)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const [statsData, apptData, paymentsData, labData, labPaymentsData] = await Promise.all([
        apiRequest('/stats/summary'),
        apiRequest(`/appointments?date=${today}&status=completed`),
        apiRequest(`/payments?from=${today}T00:00:00&type=consultation`),
        apiRequest('/lab-orders?status=completed'),
        apiRequest('/payments?type=lab'),
      ])
      setStats(statsData)
      setCompleted(apptData.appointments)
      setPaidApptIds(new Set(paymentsData.payments.map((p) => p.appointment_id).filter(Boolean)))
      setLabOrders(labData.lab_orders)
    setPaidLabOrderIds(new Set(labPaymentsData.payments.map((p) => p.lab_order_id).filter(Boolean)))
    } catch (e) {
      setLoadError(e.message)
    } finally {
      setLoading(false)
    }
  }, [today])

  useEffect(() => {
    load()
  }, [load])

  const unpaid = completed.filter((a) => !paidApptIds.has(a.id))
  const unpaidLab = labOrders.filter((o) => !paidLabOrderIds.has(o.id))

  if (tab === 'expenses' && canSeeExpenses) {
    return (
      <div>
        <TabRow tab={tab} setTab={setTab} canSeeExpenses={canSeeExpenses} />
        <ExpensesPanel />
      </div>
    )
  }

  return (
    <div>
      <TabRow tab={tab} setTab={setTab} canSeeExpenses={canSeeExpenses} />

      {stats && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <StatCard label="Bugünkü daxilolma" value={`${stats.today_total.toFixed(2)} ₼`} icon={Wallet} />
          <StatCard label="Aylıq daxilolma" value={`${stats.month_total.toFixed(2)} ₼`} icon={CalendarClock} />
        </div>
      )}
      {stats && canSeeExpenses && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl border border-black/[0.06] bg-surface p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-ink/60 mb-1">Aylıq xərc</div>
            <div className="font-display text-xl font-semibold text-danger tabular-nums">-{stats.month_expenses.toFixed(2)} ₼</div>
          </div>
          <div className="rounded-2xl border border-black/[0.06] bg-surface p-4">
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-ink/60 mb-1">
              <TrendingUp size={13} /> Aylıq xalis qazanc
            </div>
            <div className={`font-display text-xl font-semibold tabular-nums ${stats.month_net >= 0 ? 'text-success' : 'text-danger'}`}>
              {stats.month_net.toFixed(2)} ₼
            </div>
          </div>
        </div>
      )}

      <h2 className="font-display text-lg font-semibold text-ink mb-3">Ödənişi gözləyən müayinələr</h2>
      {loadError ? (
        <p className="text-danger text-sm mb-3">{loadError}</p>
      ) : loading ? (
        <p className="text-ink/60">Yüklənir…</p>
      ) : unpaid.length === 0 ? (
        <EmptyState title="Ödənişi gözləyən müayinə yoxdur" />
      ) : (
        <div className="space-y-2 mb-8">
          {unpaid.map((a) => (
            <TealCard key={a.id} className="flex items-center gap-3">
              <Avatar name={a.patient?.full_name} dark />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{a.patient?.full_name}</div>
                <div className="text-sm text-white/70">Həkim: {a.doctor?.full_name}</div>
              </div>
              <button onClick={() => setActiveAppt(a)} className="rounded-lg px-3.5 py-2 text-sm font-medium bg-white text-primary hover:bg-white/90 transition-colors">Ödəniş yaz</button>
            </TealCard>
          ))}
        </div>
      )}

      {!loading && unpaidLab.length > 0 && (
        <>
          <h2 className="font-display text-lg font-semibold text-ink mb-3 flex items-center gap-2">
            <FlaskConical size={18} className="text-primary" />
            Ödənişi gözləyən laboratoriya analizləri
          </h2>
          <div className="space-y-2 mb-8">
            {unpaidLab.map((o) => (
              <TealCard key={o.id} className="flex items-center gap-3">
                <Avatar name={o.patient?.full_name} dark />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{o.patient?.full_name}</div>
                  <div className="text-sm text-white/70 truncate">{o.tests}</div>
                </div>
                <button onClick={() => setActiveLabOrder(o)} className="rounded-lg px-3.5 py-2 text-sm font-medium bg-white text-primary hover:bg-white/90 transition-colors">Ödəniş yaz</button>
              </TealCard>
            ))}
          </div>
        </>
      )}

      {stats?.per_doctor?.length > 0 && (
        <>
          <h2 className="font-display text-lg font-semibold text-ink mb-3">Həkim üzrə breakdown (bu ay)</h2>
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

      {activeAppt && (
        <PaymentForm
          title={activeAppt.patient?.full_name}
          subtitle={`Həkim: ${activeAppt.doctor?.full_name}`}
          onClose={() => setActiveAppt(null)}
          onSaved={load}
          body={(amount, method) => ({
            appointment_id: activeAppt.id,
            patient_id: activeAppt.patient.id,
            doctor_id: activeAppt.doctor.id,
            amount: Number(amount),
            payment_method: method,
            type: 'consultation',
          })}
        />
      )}

      {activeLabOrder && (
        <PaymentForm
          title={activeLabOrder.patient?.full_name}
          subtitle={activeLabOrder.tests}
          onClose={() => setActiveLabOrder(null)}
          onSaved={load}
          body={(amount, method) => ({
            patient_id: activeLabOrder.patient.id,
            doctor_id: activeLabOrder.doctor.id,
            amount: Number(amount),
            payment_method: method,
            type: 'lab',
            lab_order_id: activeLabOrder.id,
          })}
        />
      )}
    </div>
  )
}

function TabRow({ tab, setTab, canSeeExpenses }) {
  if (!canSeeExpenses) return null
  return (
    <div className="flex gap-2 mb-6">
      <TabChip active={tab === 'kassa'} onClick={() => setTab('kassa')}>Kassa</TabChip>
      <TabChip active={tab === 'expenses'} onClick={() => setTab('expenses')}>Xərclər</TabChip>
    </div>
  )
}

function TabChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-primary text-white' : 'bg-surface text-ink/70 border border-black/10'
      }`}
    >
      {children}
    </button>
  )
}

function PaymentForm({ title, subtitle, onClose, onSaved, body }) {
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('cash')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await apiRequest('/payments', { method: 'POST', body: body(amount, method) })
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
        <h3 className="font-semibold text-ink mb-1">{title}</h3>
        <p className="text-sm text-ink/65 mb-4">{subtitle}</p>
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
