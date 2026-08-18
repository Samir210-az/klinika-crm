import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { Card, Avatar } from '../components/ui'
import { CheckCircle2, LogIn } from 'lucide-react'

const ROLE_LABELS = {
  reception: 'Resepşn',
  doctor: 'Həkim',
  nurse: 'Tibb bacısı',
  accountant: 'Mühasibatlıq',
  hr: 'Kadrlar şöbəsi',
  director: 'Direktor',
  laborant: 'Laborant',
}

export default function Kiosk() {
  const [employees, setEmployees] = useState([])
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)

  useEffect(() => {
    apiRequest('/employees/public').then((d) => setEmployees(d.employees))
  }, [])

  if (result) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <Card className="w-full max-w-sm text-center animate-fade-in">
          <CheckCircle2 size={40} className="text-success mx-auto mb-3" />
          <h2 className="font-display text-xl font-semibold text-ink mb-1">{result.employee_name}</h2>
          <p className="text-sm text-ink/60 mb-6">
            {result.action === 'checked_in' && 'İşə başlama vaxtı qeydə alındı.'}
            {result.action === 'checked_out' && 'İşdən çıxma vaxtı qeydə alındı.'}
            {result.action === 'already_done' && 'Bu gün üçün artıq giriş və çıxış qeydə alınıb.'}
          </p>
          <button
            onClick={() => { setResult(null); setSelected(null) }}
            className="w-full rounded-xl bg-primary text-white font-medium py-3"
          >
            Bağla
          </button>
        </Card>
      </div>
    )
  }

  if (selected) {
    return <PinEntry employee={selected} onCancel={() => setSelected(null)} onDone={setResult} />
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8 pt-6">
          <div className="text-xs tracking-[0.2em] uppercase text-primary font-semibold mb-2">Klinika CRM</div>
          <h1 className="font-display text-2xl font-semibold text-ink">Davamiyyət</h1>
          <p className="text-sm text-ink/50 mt-1">Adını seç və PIN-lə təsdiqlə</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {employees.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelected(e)}
              className="bg-surface rounded-2xl border border-black/[0.06] shadow-sm p-4 flex flex-col items-center gap-2 hover:border-primary/30 transition-colors"
            >
              <Avatar name={e.full_name} />
              <div className="text-center">
                <div className="text-sm font-medium text-ink">{e.full_name}</div>
                <div className="text-xs text-ink/40">{ROLE_LABELS[e.role]}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function PinEntry({ employee, onCancel, onDone }) {
  const [pin, setPin] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const data = await apiRequest('/attendance/kiosk', { method: 'POST', body: { employee_id: employee.id, pin } })
      onDone(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-sm animate-fade-in">
        <div className="flex flex-col items-center mb-5">
          <Avatar name={employee.full_name} />
          <div className="text-lg font-medium text-ink mt-2">{employee.full_name}</div>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="password"
            required
            maxLength={12}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="w-full rounded-xl border border-black/10 bg-bg px-4 py-3 mb-4 text-center text-lg tracking-[0.3em] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          {error && <p className="text-danger text-sm mb-3 text-center">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-medium py-3 disabled:opacity-60"
          >
            <LogIn size={16} /> {saving ? 'Yoxlanılır…' : 'Təsdiqlə'}
          </button>
          <button type="button" onClick={onCancel} className="w-full text-sm text-ink/50 mt-3">
            Ləğv et
          </button>
        </form>
      </Card>
    </div>
  )
}
