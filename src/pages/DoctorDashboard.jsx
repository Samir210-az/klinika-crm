import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Card, StatusBadge, Button, EmptyState, Avatar } from '../components/ui'
import { FlaskConical, Printer } from 'lucide-react'

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await apiRequest('/appointments')
    const active = data.appointments.filter((a) => a.status === 'waiting' || a.status === 'in_progress')
    setAppointments(active)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (selected) {
    return <VisitDetail appointment={selected} onBack={() => { setSelected(null); load() }} />
  }

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-5">Bugünkü növbə</h1>
      {loading ? (
        <p className="text-ink/40">Yüklənir…</p>
      ) : appointments.length === 0 ? (
        <EmptyState title="Növbədə pasiyent yoxdur" hint="Resepşn yeni qəbul əlavə etdikdə burada görünəcək." />
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <Card key={a.id} className="flex items-center gap-3 cursor-pointer hover:border-primary/20 transition-colors" onClick={() => setSelected(a)}>
              <Avatar name={a.patient?.full_name} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink truncate">{a.patient?.full_name}</div>
                {a.complaint && <div className="text-sm text-ink/50 truncate">{a.complaint}</div>}
              </div>
              <StatusBadge status={a.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function VisitDetail({ appointment, onBack }) {
  const { employee } = useAuth()
  const [tab, setTab] = useState('diagnosis')
  const [diagnosis, setDiagnosis] = useState(appointment.diagnosis || '')
  const [notes, setNotes] = useState(appointment.notes || '')
  const [labTests, setLabTests] = useState('')
  const [labOrders, setLabOrders] = useState([])
  const [prescriptionText, setPrescriptionText] = useState('')
  const [savedPrescriptions, setSavedPrescriptions] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const loadPrescriptions = useCallback(async () => {
    const data = await apiRequest(`/prescriptions?appointment_id=${appointment.id}`)
    setSavedPrescriptions(data.prescriptions)
  }, [appointment.id])

  const loadLabOrders = useCallback(async () => {
    const data = await apiRequest(`/lab-orders?appointment_id=${appointment.id}`)
    setLabOrders(data.lab_orders)
  }, [appointment.id])

  useEffect(() => {
    loadPrescriptions()
    loadLabOrders()
  }, [loadPrescriptions, loadLabOrders])

  async function startVisit() {
    await apiRequest(`/appointments/${appointment.id}`, { method: 'PATCH', body: { status: 'in_progress' } })
    appointment.status = 'in_progress'
  }

  async function saveDiagnosis() {
    setSaving(true)
    try {
      await apiRequest(`/appointments/${appointment.id}`, { method: 'PATCH', body: { diagnosis, notes } })
    } finally {
      setSaving(false)
    }
  }

  async function orderLabTest() {
    if (!labTests.trim()) return
    setError(null)
    try {
      await apiRequest('/lab-orders', {
        method: 'POST',
        body: { appointment_id: appointment.id, patient_id: appointment.patient.id, tests: labTests },
      })
      setLabTests('')
      loadLabOrders()
    } catch (e) {
      setError(e.message)
    }
  }

  async function addPrescription() {
    if (!prescriptionText.trim()) return
    setError(null)
    try {
      await apiRequest('/prescriptions', {
        method: 'POST',
        body: { appointment_id: appointment.id, patient_id: appointment.patient.id, content: prescriptionText },
      })
      setPrescriptionText('')
      loadPrescriptions()
    } catch (e) {
      setError(e.message)
    }
  }

  function printPrescription() {
    const win = window.open('', '_blank', 'width=650,height=800')
    const items = savedPrescriptions.map((p) => `<p style="margin:0 0 10px;white-space:pre-wrap">${escapeHtml(p.content)}</p>`).join('')
    win.document.write(`
      <html>
        <head>
          <title>Resept — ${escapeHtml(appointment.patient.full_name)}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #16241f; }
            h1 { font-size: 18px; margin-bottom: 4px; }
            .meta { color: #666; font-size: 13px; margin-bottom: 24px; }
            .line { border-top: 1px solid #ddd; margin: 24px 0; }
          </style>
        </head>
        <body>
          <h1>Resept</h1>
          <div class="meta">
            Pasiyent: ${escapeHtml(appointment.patient.full_name)}<br/>
            Həkim: ${escapeHtml(employee.full_name)}<br/>
            Diaqnoz: ${escapeHtml(diagnosis || '—')}<br/>
            Tarix: ${new Date().toLocaleDateString('az-AZ')}
          </div>
          ${items}
          <div class="line"></div>
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  async function completeVisit() {
    setSaving(true)
    try {
      await apiRequest(`/appointments/${appointment.id}`, { method: 'PATCH', body: { status: 'completed', diagnosis, notes } })
      onBack()
    } finally {
      setSaving(false)
    }
  }

  const pendingLab = labOrders.filter((o) => o.status === 'pending')
  const completedLab = labOrders.filter((o) => o.status === 'completed')

  return (
    <div className="animate-fade-in pb-20">
      <button onClick={onBack} className="text-sm text-ink/50 hover:text-ink mb-4">← Növbəyə qayıt</button>

      <Card className="mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={appointment.patient.full_name} />
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-semibold text-ink truncate">{appointment.patient.full_name}</h2>
            {appointment.complaint && <p className="text-sm text-ink/50 mt-0.5">Şikayət: {appointment.complaint}</p>}
          </div>
          <StatusBadge status={appointment.status} />
        </div>
        {appointment.status === 'waiting' && (
          <Button className="mt-4 w-full" onClick={startVisit}>Müayinəyə başla</Button>
        )}
      </Card>

      <div className="flex gap-1 mb-4 border-b border-black/10">
        <TabButton active={tab === 'diagnosis'} onClick={() => setTab('diagnosis')}>Diaqnoz</TabButton>
        <TabButton active={tab === 'lab'} onClick={() => setTab('lab')}>
          Laboratoriya
          {pendingLab.length > 0 && <span className="ml-1.5 text-warning">●</span>}
          {completedLab.length > 0 && pendingLab.length === 0 && <span className="ml-1.5 text-success">●</span>}
        </TabButton>
        <TabButton active={tab === 'prescription'} onClick={() => setTab('prescription')}>Resept</TabButton>
      </div>

      {error && <p className="text-danger text-sm mb-3">{error}</p>}

      {tab === 'diagnosis' && (
        <Card className="mb-4">
          <label className="block text-sm font-medium text-ink/80 mb-1.5">Diaqnoz</label>
          <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3" />
          <label className="block text-sm font-medium text-ink/80 mb-1.5">Qeydlər</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3" />
          <Button variant="secondary" onClick={saveDiagnosis} disabled={saving}>Yadda saxla</Button>
        </Card>
      )}

      {tab === 'lab' && (
        <Card className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical size={16} className="text-primary" />
            <h3 className="font-medium text-ink">Laborator nəticələri</h3>
          </div>

          {completedLab.length === 0 && pendingLab.length === 0 && (
            <p className="text-sm text-ink/40 mb-3">Hələ analiz təyin edilməyib.</p>
          )}

          {completedLab.map((o) => (
            <div key={o.id} className="mb-3 rounded-lg bg-success/5 border border-success/15 px-3 py-2.5">
              <div className="text-xs font-medium text-success mb-1">Nəticə hazırdır — {o.tests}</div>
              <p className="text-sm text-ink whitespace-pre-wrap">{o.results}</p>
            </div>
          ))}
          {pendingLab.map((o) => (
            <div key={o.id} className="mb-3 rounded-lg bg-warning/5 border border-warning/15 px-3 py-2.5 text-sm text-warning">
              Gözlənilir: {o.tests}
            </div>
          ))}

          <div className="border-t border-black/5 pt-3 mt-3">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">Yeni analiz təyin et</label>
            <textarea
              value={labTests}
              onChange={(e) => setLabTests(e.target.value)}
              placeholder="Hansı analizlər lazımdır? (məs. Ümumi qan analizi, EKQ…)"
              rows={2}
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-2"
            />
            <Button variant="secondary" onClick={orderLabTest}>Laboratoriyaya göndər</Button>
          </div>
        </Card>
      )}

      {tab === 'prescription' && (
        <Card className="mb-4">
          <h3 className="font-medium text-ink mb-3">Resept</h3>
          {savedPrescriptions.map((p) => (
            <div key={p.id} className="text-sm bg-bg rounded-lg px-3 py-2 mb-2 whitespace-pre-wrap">{p.content}</div>
          ))}
          <textarea
            value={prescriptionText}
            onChange={(e) => setPrescriptionText(e.target.value)}
            placeholder="Dərman adı, dozası, istifadə qaydası…"
            rows={3}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-2"
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={addPrescription}>Reseptə əlavə et</Button>
            {savedPrescriptions.length > 0 && (
              <Button variant="ghost" onClick={printPrescription} className="flex items-center gap-1.5">
                <Printer size={14} /> Çap et
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-black/[0.06] p-4">
        <div className="max-w-5xl mx-auto">
          <Button onClick={completeVisit} disabled={saving} className="w-full py-3">
            {saving ? 'Yadda saxlanılır…' : 'Müayinə bitdi'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? 'border-primary text-primary' : 'border-transparent text-ink/40 hover:text-ink/70'
      }`}
    >
      {children}
    </button>
  )
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
