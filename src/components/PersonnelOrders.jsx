import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Button, EmptyState, TealCard } from './ui'
import { FileText, Plus, Printer } from 'lucide-react'

const TYPE_LABELS = {
  hire: 'İşə qəbul',
  terminate: 'İşdən azad etmə',
  promotion: 'Vəzifə dəyişikliyi',
  other: 'Digər',
}

export default function PersonnelOrders() {
  const [orders, setOrders] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const [ordersData, employeesData] = await Promise.all([
      apiRequest('/personnel-orders'),
      apiRequest('/employees'),
    ])
    setOrders(ordersData.orders)
    setEmployees(employeesData.employees)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-xl font-semibold text-ink">Əmrlər</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-1.5">
          <Plus size={15} /> Yeni əmr
        </Button>
      </div>

      {showForm && <NewOrderForm employees={employees} onClose={() => setShowForm(false)} onCreated={load} />}

      {loading ? (
        <p className="text-ink/60">Yüklənir…</p>
      ) : orders.length === 0 ? (
        <EmptyState title="Hələ əmr yoxdur" hint="İşə qəbul, işdən azad etmə və digər əmrləri bura yaz." />
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
            <TealCard key={o.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{o.employee_name}</div>
                  <div className="text-sm text-white/70">
                    {TYPE_LABELS[o.order_type]}
                    {o.position && ` · ${o.position}`}
                    {' · '}{new Date(o.order_date).toLocaleDateString('az-AZ')}
                    {o.order_number && ` · № ${o.order_number}`}
                  </div>
                  {o.details && <div className="text-sm text-white/80 mt-1">{o.details}</div>}
                  <div className="text-xs text-white/50 mt-1">Verdi: {o.issuer?.full_name || '—'}</div>
                </div>
                <button
                  onClick={() => printOrder(o)}
                  className="rounded-lg p-2 bg-white/10 hover:bg-white/20 transition-colors shrink-0"
                >
                  <Printer size={15} />
                </button>
              </div>
            </TealCard>
          ))}
        </div>
      )}
    </div>
  )
}

function printOrder(o) {
  const win = window.open('', '_blank', 'width=650,height=800')
  win.document.write(`
    <html>
      <head>
        <title>Əmr — ${escapeHtml(o.employee_name)}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #16241f; }
          .letterhead { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
          .brand { font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase; color: #1f5f5b; font-weight: 600; }
          h1 { font-size: 18px; margin-bottom: 20px; }
          .row { margin-bottom: 10px; font-size: 14px; }
          .label { color: #666; }
          .line { border-top: 1px solid #ddd; margin: 32px 0 8px; }
          .sig { font-size: 13px; color: #666; }
        </style>
      </head>
      <body>
        <div class="letterhead">
          <svg width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50" cy="87" rx="15" ry="3.5" fill="#b8863b" opacity="0.9" />
            <rect x="47" y="52" width="6" height="34" rx="2" fill="#b8863b" />
            <path d="M28 33 C28 33 27 48 33 54 C38 59 45 60 50 60 C55 60 62 59 67 54 C73 48 72 33 72 33 Z" fill="#b8863b" />
            <ellipse cx="50" cy="33" rx="22" ry="6.5" fill="#b8863b" />
            <path d="M38 84 C30 80 30 72 38 68 C48 63 48 56 39 52 C29 48 30 40 40 37 C50 34 51 27 44 23" stroke="#1f5f5b" stroke-width="4.2" stroke-linecap="round" fill="none" />
            <path d="M44 23 C41 20 41 15 45 13 C49 11 54 13 54 17 C54 20 51 22 47 22 Z" fill="#1f5f5b" />
          </svg>
          <span class="brand">Klinika CRM · Kadrlar şöbəsi</span>
        </div>
        <h1>ƏMR${o.order_number ? ` № ${escapeHtml(o.order_number)}` : ''}</h1>
        <div class="row"><span class="label">Növ:</span> ${escapeHtml(TYPE_LABELS[o.order_type])}</div>
        <div class="row"><span class="label">Əməkdaş:</span> ${escapeHtml(o.employee_name)}</div>
        ${o.position ? `<div class="row"><span class="label">Vəzifə:</span> ${escapeHtml(o.position)}</div>` : ''}
        <div class="row"><span class="label">Tarix:</span> ${new Date(o.order_date).toLocaleDateString('az-AZ')}</div>
        ${o.details ? `<div class="row"><span class="label">Əsas/qeyd:</span> ${escapeHtml(o.details)}</div>` : ''}
        <div class="line"></div>
        <div class="sig">İmza: ${escapeHtml(o.issuer?.full_name || '')}</div>
      </body>
    </html>
  `)
  win.document.close()
  win.focus()
  win.print()
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str || ''
  return div.innerHTML
}

function NewOrderForm({ employees, onClose, onCreated }) {
  const [orderType, setOrderType] = useState('hire')
  const [mode, setMode] = useState('existing')
  const [employeeId, setEmployeeId] = useState('')
  const [employeeName, setEmployeeName] = useState('')
  const [position, setPosition] = useState('')
  const [orderNumber, setOrderNumber] = useState('')
  const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10))
  const [details, setDetails] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  function selectEmployee(id) {
    setEmployeeId(id)
    const emp = employees.find((e) => e.id === id)
    if (emp) setEmployeeName(emp.full_name)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const name = mode === 'existing' ? employeeName : employeeName
      if (!name.trim()) throw new Error('Əməkdaş adı tələb olunur.')

      await apiRequest('/personnel-orders', {
        method: 'POST',
        body: {
          employee_id: mode === 'existing' ? employeeId || null : null,
          employee_name: name,
          order_type: orderType,
          order_number: orderNumber || null,
          order_date: orderDate,
          position: position || null,
          details: details || null,
        },
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-5 z-20">
      <div className="bg-surface rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-5 animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-primary" />
          <h3 className="font-display text-lg font-semibold text-ink">Yeni əmr</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3">
            {Object.entries(TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>

          {orderType === 'terminate' || orderType === 'promotion' ? (
            <select
              required
              value={employeeId}
              onChange={(e) => selectEmployee(e.target.value)}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3"
            >
              <option value="">Əməkdaş seç…</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.full_name}</option>)}
            </select>
          ) : (
            <input
              required
              value={employeeName}
              onChange={(e) => { setEmployeeName(e.target.value); setEmployeeId('') }}
              placeholder="Ad Soyad"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3"
            />
          )}

          <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Vəzifə (opsional)" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3" />

          <div className="grid grid-cols-2 gap-3 mb-3">
            <input value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="Əmr № (opsional)" className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
            <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
          </div>

          <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Əsas/qeyd (opsional)" rows={3} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3" />

          {orderType === 'terminate' && (
            <p className="text-xs text-warning mb-3">Bu əmr yaradıldıqda seçilmiş əməkdaş avtomatik deaktiv olunacaq.</p>
          )}

          {error && <p className="text-danger text-sm mb-3">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={saving}>{saving ? 'Yadda saxlanılır…' : 'Əmri yarat'}</Button>
            <Button type="button" variant="ghost" onClick={onClose}>Ləğv et</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
