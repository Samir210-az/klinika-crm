import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { Card, Button, EmptyState } from '../components/ui'
import { Clock, CalendarPlus } from 'lucide-react'

const TYPE_LABELS = { vacation: 'Məzuniyyət', sick: 'Xəstəlik', other: 'Digər' }
const STATUS_LABELS = { pending: 'Gözləyir', approved: 'Təsdiqlənib', rejected: 'Rədd edilib' }
const STATUS_STYLES = { pending: 'text-warning', approved: 'text-success', rejected: 'text-danger' }

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })
}

export default function MyAttendance() {
  const [today, setToday] = useState(null)
  const [history, setHistory] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [toggling, setToggling] = useState(false)
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [att, leave] = await Promise.all([
      apiRequest('/attendance/mine'),
      apiRequest('/leave-requests'),
    ])
    setToday(att.today)
    setHistory(att.history)
    setLeaveRequests(leave.leave_requests)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleToggle() {
    setToggling(true)
    try {
      await apiRequest('/attendance/toggle', { method: 'POST' })
      load()
    } finally {
      setToggling(false)
    }
  }

  const buttonLabel = !today?.check_in_at
    ? 'İşə başla'
    : !today?.check_out_at
    ? 'İşi bitir'
    : 'Bugün tamamlandı'

  return (
    <div>
      <h1 className="font-display text-xl font-semibold text-ink mb-5">Davamiyyətim</h1>

      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-light text-primary flex items-center justify-center">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-sm text-ink/65">Bugün</div>
            <div className="text-sm text-ink">
              Giriş: <span className="font-medium">{formatTime(today?.check_in_at)}</span>
              {'  ·  '}
              Çıxış: <span className="font-medium">{formatTime(today?.check_out_at)}</span>
            </div>
            {today?.late_minutes > 0 && (
              <div className="text-xs text-warning mt-0.5">{today.late_minutes} dəqiqə gecikmə</div>
            )}
          </div>
        </div>
        <Button
          onClick={handleToggle}
          disabled={toggling || (today?.check_in_at && today?.check_out_at)}
          className="w-full py-3"
        >
          {toggling ? 'Yadda saxlanılır…' : buttonLabel}
        </Button>
      </Card>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-semibold text-ink">Məzuniyyət sorğuları</h2>
        <Button variant="secondary" onClick={() => setShowLeaveForm(true)} className="flex items-center gap-1.5">
          <CalendarPlus size={15} /> Sorğu göndər
        </Button>
      </div>

      {showLeaveForm && <LeaveRequestForm onClose={() => setShowLeaveForm(false)} onCreated={load} />}

      {leaveRequests.length === 0 ? (
        <EmptyState title="Hələ sorğu göndərilməyib" />
      ) : (
        <div className="space-y-2 mb-8">
          {leaveRequests.map((l) => (
            <Card key={l.id} className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-ink">
                  {new Date(l.start_date).toLocaleDateString('az-AZ')} — {new Date(l.end_date).toLocaleDateString('az-AZ')}
                </div>
                <div className="text-xs text-ink/60">{TYPE_LABELS[l.type]}{l.reason && ` · ${l.reason}`}</div>
              </div>
              <span className={`text-xs font-medium ${STATUS_STYLES[l.status]}`}>{STATUS_LABELS[l.status]}</span>
            </Card>
          ))}
        </div>
      )}

      <h2 className="font-display text-lg font-semibold text-ink mb-3">Son qeydlər</h2>
      {loading ? (
        <p className="text-ink/60">Yüklənir…</p>
      ) : history.length === 0 ? (
        <EmptyState title="Hələ davamiyyət qeydi yoxdur" />
      ) : (
        <div className="space-y-1.5">
          {history.map((h) => (
            <div key={h.work_date} className="flex items-center justify-between text-sm py-2 border-b border-black/5 last:border-0">
              <span className="text-ink/70">{new Date(h.work_date).toLocaleDateString('az-AZ')}</span>
              <span className="text-ink tabular-nums">{formatTime(h.check_in_at)} – {formatTime(h.check_out_at)}</span>
              {h.late_minutes > 0 && <span className="text-warning text-xs">{h.late_minutes} dəq. gecikmə</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function LeaveRequestForm({ onClose, onCreated }) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [type, setType] = useState('vacation')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await apiRequest('/leave-requests', { method: 'POST', body: { start_date: startDate, end_date: endDate, type, reason } })
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mb-4 animate-fade-in">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs text-ink/65 mb-1">Başlanğıc</label>
            <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-ink/65 mb-1">Bitmə</label>
            <input required type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm" />
          </div>
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3">
          <option value="vacation">Məzuniyyət</option>
          <option value="sick">Xəstəlik</option>
          <option value="other">Digər</option>
        </select>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Səbəb (opsional)" rows={2} className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm mb-3" />
        {error && <p className="text-danger text-sm mb-3">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? 'Göndərilir…' : 'Sorğu göndər'}</Button>
          <Button type="button" variant="ghost" onClick={onClose}>Ləğv et</Button>
        </div>
      </form>
    </Card>
  )
}
