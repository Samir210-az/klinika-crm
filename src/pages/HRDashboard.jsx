import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { Card, Button, EmptyState } from '../components/ui'

const ROLE_LABELS = {
  reception: 'Resepşn',
  doctor: 'Həkim',
  nurse: 'Tibb bacısı',
  accountant: 'Mühasibatlıq',
  hr: 'Kadrlar şöbəsi',
  director: 'Direktor',
}

export default function HRDashboard() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await apiRequest('/employees')
    setEmployees(data.employees)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function toggleActive(emp) {
    await apiRequest(`/employees/${emp.id}`, { method: 'PATCH', body: { is_active: !emp.is_active } })
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-semibold text-ink">Əməkdaşlar</h1>
        <Button onClick={() => setShowForm(true)}>+ Yeni əməkdaş</Button>
      </div>

      {showForm && (
        <NewEmployeeForm
          doctors={employees.filter((e) => e.role === 'doctor')}
          onClose={() => setShowForm(false)}
          onCreated={load}
        />
      )}

      {loading ? (
        <p className="text-ink/40">Yüklənir…</p>
      ) : employees.length === 0 ? (
        <EmptyState title="Hələ əməkdaş yoxdur" />
      ) : (
        <div className="space-y-2">
          {employees.map((e) => (
            <Card key={e.id} className={`flex items-center justify-between ${!e.is_active ? 'opacity-50' : ''}`}>
              <div>
                <div className="font-medium text-ink">{e.full_name}</div>
                <div className="text-sm text-ink/50">
                  {ROLE_LABELS[e.role]} · {e.phone}
                  {e.role === 'doctor' && e.consultation_fee != null && <> · {Number(e.consultation_fee).toFixed(2)} ₼</>}
                </div>
              </div>
              <Button variant={e.is_active ? 'danger' : 'secondary'} onClick={() => toggleActive(e)}>
                {e.is_active ? 'Deaktiv et' : 'Aktivləşdir'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function NewEmployeeForm({ doctors, onClose, onCreated }) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [role, setRole] = useState('reception')
  const [department, setDepartment] = useState('')
  const [consultationFee, setConsultationFee] = useState('')
  const [supervisingDoctorId, setSupervisingDoctorId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await apiRequest('/employees', {
        method: 'POST',
        body: {
          full_name: fullName,
          phone,
          pin,
          role,
          department: department || null,
          consultation_fee: role === 'doctor' && consultationFee ? Number(consultationFee) : null,
          supervising_doctor_id: role === 'nurse' && supervisingDoctorId ? supervisingDoctorId : null,
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
    <Card className="mb-5 animate-fade-in">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ad Soyad" className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefon" className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <input required maxLength={6} inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} placeholder="PIN (4-6 rəqəm)" className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm">
            {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        <input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Şöbə/ixtisas (opsional)" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3" />

        {role === 'doctor' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">Qəbul haqqı (₼)</label>
            <input type="number" step="0.01" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} placeholder="Məsələn: 40" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
            <p className="text-xs text-ink/40 mt-1">Kassa ödəniş yazarkən default məbləğ kimi göstəriləcək.</p>
          </div>
        )}

        {role === 'nurse' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">Bağlı olduğu həkim</label>
            <select required value={supervisingDoctorId} onChange={(e) => setSupervisingDoctorId(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm">
              <option value="">Həkim seç…</option>
              {doctors.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
            </select>
          </div>
        )}

        {error && <p className="text-danger text-sm mb-3">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? 'Yadda saxlanılır…' : 'Əməkdaş yarat'}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Ləğv et</Button>
        </div>
      </form>
    </Card>
  )
}
