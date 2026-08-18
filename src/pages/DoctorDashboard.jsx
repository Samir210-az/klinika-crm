import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Card, StatusBadge, Button, EmptyState } from '../components/ui'

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
      <h1 className="text-xl font-semibold text-ink mb-5">Bugünkü növbə</h1>
      {loading ? (
        <p className="text-ink/40">Yüklənir…</p>
      ) : appointments.length === 0 ? (
        <EmptyState title="Növbədə pasiyent yoxdur" hint="Resepşn yeni qəbul əlavə etdikdə burada görünəcək." />
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <Card key={a.id} className="flex items-center justify-between cursor-pointer hover:border-primary/30" >
              <div onClick={() => setSelected(a)} className="flex-1">
                <div className="font-medium text-ink">{a.patient?.full_name}</div>
                {a.complaint && <div className="text-sm text-ink/50">{a.complaint}</div>}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={a.status} />
                <Button variant="secondary" onClick={() => setSelected(a)}>Aç</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function VisitDetail({ appointment, onBack }) {
  const { employee } = useAuth()
  const [diagnosis, setDiagnosis] = useState(appointment.diagnosis || '')
  const [notes, setNotes] = useState(appointment.notes || '')
  const [prescriptionText, setPrescriptionText] = useState('')
  const [savedPrescriptions, setSavedPrescriptions] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const loadPrescriptions = useCallback(async () => {
    const data = await apiRequest(`/prescriptions?appointment_id=${appointment.id}`)
    setSavedPrescriptions(data.prescriptions)
  }, [appointment.id])

  useEffect(() => {
    loadPrescriptions()
  }, [loadPrescriptions])

  async function startVisit() {
    await apiRequest(`/appointments/${appointment.id}`, { method: 'PATCH', body: { status: 'in_progress' } })
    appointment.status = 'in_progress'
  }

  async function saveNotes() {
    setSaving(true)
    try {
      await apiRequest(`/appointments/${appointment.id}`, { method: 'PATCH', body: { diagnosis, notes } })
    } finally {
      setSaving(false)
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

  return (
    <div className="animate-fade-in">
      <button onClick={onBack} className="text-sm text-ink/50 hover:text-ink mb-4">← Növbəyə qayıt</button>

      <Card className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">{appointment.patient.full_name}</h2>
            {appointment.complaint && <p className="text-sm text-ink/50 mt-0.5">Şikayət: {appointment.complaint}</p>}
          </div>
          <StatusBadge status={appointment.status} />
        </div>
        {appointment.status === 'waiting' && (
          <Button className="mt-4" onClick={startVisit}>Müayinəyə başla</Button>
        )}
      </Card>

      <Card className="mb-4">
        <label className="block text-sm font-medium text-ink/80 mb-1.5">Diaqnoz</label>
        <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3" />
        <label className="block text-sm font-medium text-ink/80 mb-1.5">Qeydlər</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3" />
        <Button variant="secondary" onClick={saveNotes} disabled={saving}>Yadda saxla</Button>
      </Card>

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
        {error && <p className="text-danger text-sm mb-2">{error}</p>}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={addPrescription}>Reseptə əlavə et</Button>
          {savedPrescriptions.length > 0 && <Button variant="ghost" onClick={printPrescription}>Çap et</Button>}
        </div>
      </Card>

      <Button onClick={completeVisit} disabled={saving} className="w-full py-3">
        {saving ? 'Yadda saxlanılır…' : 'Müayinə bitdi'}
      </Button>
    </div>
  )
}

function escapeHtml(str) {
  const div = document.createElement('div')
  div.textContent = str
  return div.innerHTML
}
