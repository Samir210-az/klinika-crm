import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { Card, Button, EmptyState, Avatar } from './ui'
import { Settings2, Check, X } from 'lucide-react'

const DAY_LABELS = ['Bazar', 'Bazar ertəsi', 'Çərşənbə axşamı', 'Çərşənbə', 'Cümə axşamı', 'Cümə', 'Şənbə']
const TYPE_LABELS = { vacation: 'Məzuniyyət', sick: 'Xəstəlik', other: 'Digər' }

export default function AttendanceAdmin() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [report, setReport] = useState([])
  const [pendingLeaves, setPendingLeaves] = useState([])
  const [scheduleFor, setScheduleFor] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [reportData, leaveData] = await Promise.all([
      apiRequest(`/attendance/report?month=${month}`),
      apiRequest('/leave-requests?status=pending'),
    ])
    setReport(reportData.report)
    setPendingLeaves(leaveData.leave_requests)
    setLoading(false)
  }, [month])

  useEffect(() => {
    load()
  }, [load])

  async function reviewLeave(id, status) {
    await apiRequest(`/leave-requests/${id}`, { method: 'PATCH', body: { status } })
    load()
  }

  if (scheduleFor) {
    return <ScheduleEditor employee={scheduleFor} onClose={() => { setScheduleFor(null); load() }} />
  }

  return (
    <div>
      {pendingLeaves.length > 0 && (
        <>
          <h2 className="font-display text-lg font-semibold text-ink mb-3">Gözləyən məzuniyyət sorğuları</h2>
          <div className="space-y-2 mb-8">
            {pendingLeaves.map((l) => (
              <Card key={l.id} className="flex items-center gap-3">
                <Avatar name={l.employee?.full_name} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-ink truncate">{l.employee?.full_name}</div>
                  <div className="text-xs text-ink/50">
                    {TYPE_LABELS[l.type]} · {new Date(l.start_date).toLocaleDateString('az-AZ')} — {new Date(l.end_date).toLocaleDateString('az-AZ')}
                    {l.reason && ` · ${l.reason}`}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button variant="secondary" onClick={() => reviewLeave(l.id, 'approved')} className="!px-2.5"><Check size={15} /></Button>
                  <Button variant="danger" onClick={() => reviewLeave(l.id, 'rejected')} className="!px-2.5"><X size={15} /></Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-semibold text-ink">Aylıq hesabat</h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-ink/40">Yüklənir…</p>
      ) : report.length === 0 ? (
        <EmptyState title="Əməkdaş tapılmadı" />
      ) : (
        <div className="space-y-2">
          {report.map((r) => (
            <Card key={r.employee_id} className="flex items-center gap-3">
              <Avatar name={r.full_name} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink truncate">{r.full_name}</div>
                {r.has_schedule ? (
                  <div className="text-xs text-ink/50 mt-0.5">
                    <span className="text-success">{r.present_days} gəldi</span>
                    {r.late_days > 0 && <span className="text-warning"> · {r.late_days} gecikdi</span>}
                    {r.absent_days > 0 && <span className="text-danger"> · {r.absent_days} gəlmədi</span>}
                    {r.on_leave_days > 0 && <span className="text-ink/40"> · {r.on_leave_days} icazəli</span>}
                  </div>
                ) : (
                  <div className="text-xs text-ink/30 mt-0.5">Qrafik təyin edilməyib</div>
                )}
              </div>
              <Button variant="ghost" onClick={() => setScheduleFor(r)} className="!px-2.5 shrink-0">
                <Settings2 size={15} />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function ScheduleEditor({ employee, onClose }) {
  const [days, setDays] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    apiRequest(`/schedules?employee_id=${employee.employee_id}`).then((d) => {
      const map = {}
      d.schedule.forEach((s) => { map[s.day_of_week] = { start_time: s.start_time.slice(0, 5), end_time: s.end_time.slice(0, 5) } })
      setDays(map)
      setLoading(false)
    })
  }, [employee.employee_id])

  function toggleDay(dow) {
    setDays((prev) => {
      const next = { ...prev }
      if (next[dow]) delete next[dow]
      else next[dow] = { start_time: '09:00', end_time: '18:00' }
      return next
    })
  }

  function updateTime(dow, field, value) {
    setDays((prev) => ({ ...prev, [dow]: { ...prev[dow], [field]: value } }))
  }

  async function save() {
    setSaving(true)
    try {
      const payload = Object.entries(days).map(([dow, t]) => ({ day_of_week: Number(dow), start_time: t.start_time, end_time: t.end_time }))
      await apiRequest('/schedules', { method: 'PUT', body: { employee_id: employee.employee_id, days: payload } })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <button onClick={onClose} className="text-sm text-ink/50 hover:text-ink mb-4">← Geri qayıt</button>

      <Card className="mb-4 flex items-center gap-3">
        <Avatar name={employee.full_name} />
        <div className="font-display text-lg font-semibold text-ink">{employee.full_name}</div>
      </Card>

      {loading ? (
        <p className="text-ink/40">Yüklənir…</p>
      ) : (
        <Card className="mb-4">
          <p className="text-sm text-ink/50 mb-4">İş günlərini seç və saatları təyin et.</p>
          {DAY_LABELS.map((label, dow) => (
            <div key={dow} className="flex items-center gap-3 py-2.5 border-b last:border-0 border-black/5">
              <button
                onClick={() => toggleDay(dow)}
                className={`w-5 h-5 rounded shrink-0 border-2 flex items-center justify-center transition-colors ${
                  days[dow] ? 'bg-primary border-primary' : 'border-black/20'
                }`}
              >
                {days[dow] && <Check size={13} className="text-white" />}
              </button>
              <span className="text-sm text-ink flex-1">{label}</span>
              {days[dow] && (
                <div className="flex items-center gap-1.5">
                  <input type="time" value={days[dow].start_time} onChange={(e) => updateTime(dow, 'start_time', e.target.value)} className="rounded-lg border border-black/10 px-2 py-1 text-sm" />
                  <span className="text-ink/30">–</span>
                  <input type="time" value={days[dow].end_time} onChange={(e) => updateTime(dow, 'end_time', e.target.value)} className="rounded-lg border border-black/10 px-2 py-1 text-sm" />
                </div>
              )}
            </div>
          ))}
        </Card>
      )}

      <Button onClick={save} disabled={saving} className="w-full py-3">
        {saving ? 'Yadda saxlanılır…' : 'Qrafiki yadda saxla'}
      </Button>
    </div>
  )
}
