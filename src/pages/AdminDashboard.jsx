import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { Card, StatCard } from '../components/ui'
import EmployeesPanel from '../components/EmployeesPanel'
import PatientsPanel from '../components/PatientsPanel'
import EmployeeDetail from '../components/EmployeeDetail'
import AttendanceAdmin from '../components/AttendanceAdmin'
import LabOverview from '../components/LabOverview'
import { Wallet, CalendarClock, Users, Stethoscope } from 'lucide-react'

export default function AdminDashboard() {
  const [tab, setTab] = useState('stats')
  const [viewDoctorId, setViewDoctorId] = useState(null)

  if (viewDoctorId) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setViewDoctorId(null)} className="text-sm text-ink/65 hover:text-ink mb-4">← Geri qayıt</button>
        <EmployeeDetail employeeId={viewDoctorId} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b border-black/10 overflow-x-auto">
        <TabButton active={tab === 'stats'} onClick={() => setTab('stats')}>Göstəricilər</TabButton>
        <TabButton active={tab === 'employees'} onClick={() => setTab('employees')}>Əməkdaşlar</TabButton>
        <TabButton active={tab === 'patients'} onClick={() => setTab('patients')}>Pasiyentlər</TabButton>
        <TabButton active={tab === 'lab'} onClick={() => setTab('lab')}>Laboratoriya</TabButton>
        <TabButton active={tab === 'attendance'} onClick={() => setTab('attendance')}>Davamiyyət</TabButton>
      </div>

      {tab === 'stats' && <StatsView onSelectDoctor={setViewDoctorId} />}
      {tab === 'employees' && <EmployeesPanel />}
      {tab === 'patients' && <PatientsPanel />}
      {tab === 'lab' && <LabOverview />}
      {tab === 'attendance' && <AttendanceAdmin />}
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? 'border-primary text-primary' : 'border-transparent text-ink/60 hover:text-ink/70'
      }`}
    >
      {children}
    </button>
  )
}

function StatsView({ onSelectDoctor }) {
  const [stats, setStats] = useState(null)
  const [employeeCount, setEmployeeCount] = useState(null)

  useEffect(() => {
    apiRequest('/stats/summary').then(setStats)
    apiRequest('/employees').then((d) => setEmployeeCount(d.employees.filter((e) => e.is_active).length))
  }, [])

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Bugünkü dövriyyə" value={`${stats ? stats.today_total.toFixed(2) : '—'} ₼`} icon={Wallet} />
        <StatCard label="Aylıq dövriyyə" value={`${stats ? stats.month_total.toFixed(2) : '—'} ₼`} icon={CalendarClock} />
        <StatCard label="Aktiv əməkdaş" value={employeeCount ?? '—'} icon={Users} />
      </div>

      <h2 className="font-display text-lg font-semibold text-ink mb-3">Həkim üzrə dövriyyə (bu ay)</h2>
      <Card>
        {stats?.per_doctor?.length ? (
          stats.per_doctor.map((d) => (
            <button
              key={d.doctor_id}
              onClick={() => onSelectDoctor(d.doctor_id)}
              className="w-full flex items-center gap-3 py-3 border-b last:border-0 border-black/5 text-left hover:opacity-70 transition-opacity"
            >
              <div className="w-8 h-8 shrink-0 rounded-full bg-primary-light text-primary flex items-center justify-center">
                <Stethoscope size={15} />
              </div>
              <span className="text-sm text-ink flex-1">{d.full_name}</span>
              <div className="text-right">
                <div className="text-sm font-medium text-ink tabular-nums">{d.month.toFixed(2)} ₼</div>
                <div className="text-xs text-ink/60 tabular-nums">bu gün: {d.today.toFixed(2)} ₼</div>
              </div>
            </button>
          ))
        ) : (
          <p className="text-sm text-ink/60 py-4">Hələ ödəniş qeydə alınmayıb.</p>
        )}
      </Card>
    </div>
  )
}
