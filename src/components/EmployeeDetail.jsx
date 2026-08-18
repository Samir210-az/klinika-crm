import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { Card, StatusBadge, Avatar, EmptyState, StatCard } from './ui'
import { Wallet, CalendarClock, Stethoscope } from 'lucide-react'

const ROLE_LABELS = {
  reception: 'Resepşn',
  doctor: 'Həkim',
  nurse: 'Tibb bacısı',
  accountant: 'Mühasibatlıq',
  hr: 'Kadrlar şöbəsi',
  director: 'Direktor',
  laborant: 'Laborant',
}

export default function EmployeeDetail({ employeeId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiRequest(`/employees/${employeeId}`).then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [employeeId])

  if (loading) return <p className="text-ink/60">Yüklənir…</p>
  if (!data) return <EmptyState title="Əməkdaş tapılmadı" />

  const { employee, appointments, today_revenue, month_revenue } = data
  const today = new Date().toISOString().slice(0, 10)
  const todayCount = appointments.filter((a) => a.scheduled_at.slice(0, 10) === today).length
  const monthPrefix = today.slice(0, 7)
  const monthCount = appointments.filter((a) => a.scheduled_at.slice(0, 7) === monthPrefix).length

  return (
    <div>
      <Card className="mb-4 flex items-center gap-3">
        <Avatar name={employee.full_name} />
        <div>
          <div className="font-display text-lg font-semibold text-ink">{employee.full_name}</div>
          <div className="text-sm text-ink/65">
            {ROLE_LABELS[employee.role]}
            {employee.department && ` · ${employee.department}`}
            {' · '}{employee.phone}
          </div>
        </div>
      </Card>

      {employee.role === 'doctor' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard label="Bugünkü qəbul" value={todayCount} icon={CalendarClock} />
          <StatCard label="Bu ay qəbul" value={monthCount} icon={Stethoscope} />
          <StatCard label="Bugünkü dövriyyə" value={`${today_revenue.toFixed(2)} ₼`} icon={Wallet} />
          <StatCard label="Aylıq dövriyyə" value={`${month_revenue.toFixed(2)} ₼`} icon={Wallet} />
        </div>
      )}

      <h2 className="font-display text-lg font-semibold text-ink mb-3">Qəbul tarixçəsi</h2>
      {appointments.length === 0 ? (
        <EmptyState title="Hələ qəbul olmayıb" />
      ) : (
        <div className="space-y-2">
          {appointments.map((a) => (
            <Card key={a.id} className="flex items-center gap-3">
              <Avatar name={a.patient?.full_name} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-ink truncate">{a.patient?.full_name}</div>
                <div className="text-xs text-ink/60">{new Date(a.scheduled_at).toLocaleDateString('az-AZ')}</div>
                {a.diagnosis && <div className="text-sm text-ink/60 mt-0.5 truncate">{a.diagnosis}</div>}
              </div>
              <StatusBadge status={a.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
