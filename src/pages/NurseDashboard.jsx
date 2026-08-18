import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { Card, StatusBadge, Button, EmptyState, Avatar } from '../components/ui'

export default function NurseDashboard() {
  const [doctorId, setDoctorId] = useState(null)
  const [doctorName, setDoctorName] = useState('')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const me = await apiRequest('/me')
    if (!me.employee.supervising_doctor_id) {
      setLoading(false)
      return
    }
    setDoctorId(me.employee.supervising_doctor_id)
    const data = await apiRequest('/appointments')
    setAppointments(data.appointments)
    if (data.appointments[0]) setDoctorName(data.appointments[0].doctor?.full_name || '')
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (!loading && !doctorId) {
    return <EmptyState title="Sizə bağlı həkim təyin edilməyib" hint="Kadrlar şöbəsi ilə əlaqə saxlayın." />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink">Növbə</h1>
          {doctorName && <p className="text-sm text-ink/50">Həkim: {doctorName}</p>}
        </div>
        <Button onClick={() => setShowForm(true)}>+ Pasiyent əlavə et</Button>
      </div>

      {showForm && <AddPatientForm doctorId={doctorId} onClose={() => setShowForm(false)} onCreated={load} />}

      {loading ? (
        <p className="text-ink/40">Yüklənir…</p>
      ) : appointments.length === 0 ? (
        <EmptyState title="Bu gün üçün pasiyent yoxdur" />
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <Card key={a.id} className="flex items-center gap-3">
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

function AddPatientForm({ doctorId, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [complaint, setComplaint] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const { patient } = await apiRequest('/patients', { method: 'POST', body: { full_name: name, phone } })
      await apiRequest('/appointments', { method: 'POST', body: { patient_id: patient.id, doctor_id: doctorId, complaint } })
      onCreated()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mb-5 animate-fade-in">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon" className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
        </div>
        <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="Şikayət (opsional)" rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3" />
        {error && <p className="text-danger text-sm mb-3">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? 'Yadda saxlanılır…' : 'Əlavə et'}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Ləğv et</Button>
        </div>
      </form>
    </Card>
  )
}
