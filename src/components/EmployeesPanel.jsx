import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { Card, Button, EmptyState, Avatar, TealCard } from './ui'
import EmployeeDetail from './EmployeeDetail'
import { Trash2, Plus } from 'lucide-react'

const ROLE_LABELS = {
  reception: 'Resepşn',
  doctor: 'Həkim',
  nurse: 'Tibb bacısı',
  accountant: 'Mühasibatlıq',
  hr: 'Kadrlar şöbəsi',
  director: 'Direktor',
  laborant: 'Laborant',
}

const DOCTOR_SPECIALTIES = [
  'Terapevt',
  'Pediatr',
  'Kardioloq',
  'Nevroloq',
  'Psixiatr',
  'Psixoloq',
  'Endokrinoloq',
  'Qastroenteroloq',
  'Dermatoloq',
  'Nevropatoloq',
  'Otorinolarinqoloq (LOR)',
  'Oftalmoloq',
  'Ginekoloq',
  'Uroloq',
  'Cərrah',
  'Ortoped-travmatoloq',
  'Stomatoloq',
  'Loqoped',
  'Reabilitoloq',
  'Digər',
]

export default function EmployeesPanel() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

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

  async function handleDelete(emp) {
    if (!confirm(`${emp.full_name} silinsin? Bu əməliyyat geri qaytarıla bilməz.`)) return
    setDeletingId(emp.id)
    setError(null)
    try {
      await apiRequest(`/employees/${emp.id}`, { method: 'DELETE' })
      setEmployees((prev) => prev.filter((e) => e.id !== emp.id))
    } catch (e) {
      setError(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {selectedId && (
        <div className="animate-fade-in mb-6">
          <button onClick={() => setSelectedId(null)} className="text-sm text-ink/65 hover:text-ink mb-4">← Siyahıya qayıt</button>
          <EmployeeDetail employeeId={selectedId} />
        </div>
      )}

      {!selectedId && (
      <>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display text-xl font-semibold text-ink">Əməkdaşlar</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-1.5">
          <Plus size={15} /> Yeni əməkdaş
        </Button>
      </div>

      {showForm && (
        <NewEmployeeForm
          doctors={employees.filter((e) => e.role === 'doctor')}
          onClose={() => setShowForm(false)}
          onCreated={load}
        />
      )}

      {error && <p className="text-danger text-sm mb-3">{error}</p>}

      {loading ? (
        <p className="text-ink/60">Yüklənir…</p>
      ) : employees.length === 0 ? (
        <EmptyState title="Hələ əməkdaş yoxdur" />
      ) : (
        <div className="space-y-2">
          {employees.map((e) => (
            <TealCard key={e.id} className={`flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity ${!e.is_active ? 'opacity-50' : ''}`} onClick={() => setSelectedId(e.id)}>
              <Avatar name={e.full_name} dark />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{e.full_name}</div>
                <div className="text-sm text-white/70 truncate">
                  {ROLE_LABELS[e.role]}
                  {e.role === 'doctor' && e.department && <> · {e.department}</>}
                  {' · '}{e.phone}
                  {e.role === 'doctor' && e.consultation_fee != null && <> · {Number(e.consultation_fee).toFixed(2)} ₼</>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(ev) => { ev.stopPropagation(); toggleActive(e) }}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    e.is_active ? 'bg-white/15 hover:bg-white/25' : 'bg-white text-primary hover:bg-white/90'
                  }`}
                >
                  {e.is_active ? 'Deaktiv et' : 'Aktivləşdir'}
                </button>
                <button
                  onClick={(ev) => { ev.stopPropagation(); handleDelete(e) }}
                  disabled={deletingId === e.id}
                  className="rounded-lg p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </TealCard>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  )
}

function NewEmployeeForm({ doctors, onClose, onCreated }) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [role, setRole] = useState('reception')
  const [specialty, setSpecialty] = useState(DOCTOR_SPECIALTIES[0])
  const [customSpecialty, setCustomSpecialty] = useState('')
  const [consultationFee, setConsultationFee] = useState('')
  const [supervisingDoctorId, setSupervisingDoctorId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const department =
        role === 'doctor' ? (specialty === 'Digər' ? customSpecialty : specialty) : null

      await apiRequest('/employees', {
        method: 'POST',
        body: {
          full_name: fullName,
          phone,
          pin,
          role,
          department,
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
          <input required maxLength={12} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="PIN (4-12 simvol)" className="rounded-lg border border-black/10 px-3 py-2 text-sm" />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-black/10 px-3 py-2 text-sm">
            {Object.entries(ROLE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        {role === 'doctor' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">İxtisas</label>
            <select value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm">
              {DOCTOR_SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {specialty === 'Digər' && (
              <input
                value={customSpecialty}
                onChange={(e) => setCustomSpecialty(e.target.value)}
                placeholder="İxtisası yaz…"
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mt-2"
              />
            )}
          </div>
        )}

        {role === 'doctor' && (
          <div className="mb-3">
            <label className="block text-sm font-medium text-ink/80 mb-1.5">Qəbul haqqı (₼)</label>
            <input type="number" step="0.01" value={consultationFee} onChange={(e) => setConsultationFee(e.target.value)} placeholder="Məsələn: 40" className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
            <p className="text-xs text-ink/60 mt-1">Kassa ödəniş yazarkən default məbləğ kimi göstəriləcək.</p>
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
