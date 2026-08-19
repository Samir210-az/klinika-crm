import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { Card, StatCard, TealCard } from '../components/ui'
import EmployeesPanel from '../components/EmployeesPanel'
import PatientsPanel from '../components/PatientsPanel'
import EmployeeDetail from '../components/EmployeeDetail'
import AttendanceAdmin from '../components/AttendanceAdmin'
import LabOverview from '../components/LabOverview'
import AccountantDashboard from './AccountantDashboard'
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
      <div className="relative -mx-5 px-5 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabButton active={tab === 'stats'} onClick={() => setTab('stats')}>Göstəricilər</TabButton>
          <TabButton active={tab === 'kassa'} onClick={() => setTab('kassa')}>Kassa</TabButton>
          <TabButton active={tab === 'employees'} onClick={() => setTab('employees')}>Əməkdaşlar</TabButton>
          <TabButton active={tab === 'patients'} onClick={() => setTab('patients')}>Pasiyentlər</TabButton>
          <TabButton active={tab === 'lab'} onClick={() => setTab('lab')}>Laboratoriya</TabButton>
          <TabButton active={tab === 'attendance'} onClick={() => setTab('attendance')}>Davamiyyət</TabButton>
        </div>
        <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-bg to-transparent" />
      </div>

      {tab === 'stats' && <StatsView onSelectDoctor={setViewDoctorId} />}
      {tab === 'kassa' && <AccountantDashboard />}
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
      className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-primary text-white' : 'bg-surface text-ink/70 border border-black/10'
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
      {stats?.per_doctor?.length ? (
        <div className="space-y-2">
          {stats.per_doctor.map((d) => (
            <TealCard
              key={d.doctor_id}
              className="cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onSelectDoctor(d.doctor_id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 shrink-0 rounded-full bg-white/15 flex items-center justify-center">
                  <Stethoscope size={16} />
                </div>
                <span className="flex-1 font-medium">{d.full_name}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">{d.month.toFixed(2)} ₼</div>
                  <div className="text-xs text-white/70 tabular-nums">bu gün: {d.today.toFixed(2)} ₼</div>
                </div>
              </div>
            </TealCard>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-ink/60 py-2">Hələ ödəniş qeydə alınmayıb.</p>
        </Card>
      )}
    </div>
  )
}
