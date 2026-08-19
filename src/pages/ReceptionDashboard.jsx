import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { Card, StatusBadge, Button, EmptyState, Avatar, TealCard } from '../components/ui'

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  const load = useCallback(async () => {
    setLoading(true)
    const [apptData, doctorData] = await Promise.all([
      apiRequest(`/appointments?date=${today}`),
      apiRequest('/employees?role=doctor'),
    ])
    setAppointments(apptData.appointments)
    setDoctors(doctorData.employees)
    setLoading(false)
  }, [today])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-xl font-semibold text-ink">Bugünkü qəbullar</h1>
        <Button onClick={() => setShowForm(true)}>+ Yeni qəbul</Button>
      </div>

      {showForm && (
        <NewAppointmentForm doctors={doctors} onClose={() => setShowForm(false)} onCreated={load} />
      )}

      {loading ? (
        <p className="text-ink/60">Yüklənir…</p>
      ) : appointments.length === 0 ? (
        <EmptyState title="Bu gün üçün qəbul yoxdur" hint="Yeni qəbul əlavə et." />
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <TealCard key={a.id} className="flex items-center gap-3">
              <Avatar name={a.patient?.full_name} dark />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{a.patient?.full_name}</div>
                <div className="text-sm text-white/70">Həkim: {a.doctor?.full_name}</div>
              </div>
              <StatusBadge status={a.status} />
            </TealCard>
          ))}
        </div>
      )}
    </div>
  )
}

function NewAppointmentForm({ doctors, onClose, onCreated }) {
  const [mode, setMode] = useState('existing')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [complaint, setComplaint] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (mode !== 'existing' || query.trim().length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(async () => {
      const data = await apiRequest(`/patients?q=${encodeURIComponent(query)}`)
      setResults(data.patients)
    }, 300)
    return () => clearTimeout(t)
  }, [query, mode])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      let patientId = selectedPatient?.id
      if (mode === 'new') {
        const { patient } = await apiRequest('/patients', { method: 'POST', body: { full_name: newName, phone: newPhone } })
        patientId = patient.id
      }
      if (!patientId) throw new Error('Pasiyent seçilməlidir.')
      if (!doctorId) throw new Error('Həkim seçilməlidir.')

      await apiRequest('/appointments', { method: 'POST', body: { patient_id: patientId, doctor_id: doctorId, complaint } })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mb-5 animate-fade-in">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 mb-4">
          <button type="button" onClick={() => setMode('existing')} className={`text-sm px-3 py-1.5 rounded-lg ${mode === 'existing' ? 'bg-primary text-white' : 'bg-black/5 text-ink/60'}`}>
            Mövcud pasiyent
          </button>
          <button type="button" onClick={() => setMode('new')} className={`text-sm px-3 py-1.5 rounded-lg ${mode === 'new' ? 'bg-primary text-white' : 'bg-black/5 text-ink/60'}`}>
            Yeni pasiyent
          </button>
        </div>

        {mode === 'existing' ? (
          <div className="mb-4">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedPatient(null) }}
              placeholder="Pasiyent adı ilə axtar…"
              className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
            />
            {results.length > 0 && !selectedPatient && (
              <div className="mt-1 border border-black/10 rounded-lg overflow-hidden">
                {results.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => { setSelectedPatient(p); setQuery(p.full_name); setResults([]) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 border-b last:border-0 border-black/5"
                  >
                    {p.full_name} {p.phone && <span className="text-ink/60">— {p.phone}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <input required value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ad Soyad" className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
            <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Telefon" className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
          </div>
        )}

        <select required value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3">
          <option value="">Həkim seç…</option>
          {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
        </select>

        <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Şikayət (opsional)" rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3" />

        {error && <p className="text-danger text-sm mb-3">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? 'Yadda saxlanılır…' : 'Qəbul yarat'}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Ləğv et</Button>
        </div>
      </form>
    </Card>
  )
}
