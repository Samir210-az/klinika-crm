import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { Card } from '../components/ui'
import EmployeesPanel from '../components/EmployeesPanel'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { employee } = useAuth()
  const [tab, setTab] = useState('stats')

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-black/10">
        <TabButton active={tab === 'stats'} onClick={() => setTab('stats')}>Göstəricilər</TabButton>
        <TabButton active={tab === 'employees'} onClick={() => setTab('employees')}>Əməkdaşlar</TabButton>
      </div>

      {tab === 'stats' ? <StatsView showFullTotals={employee.role === 'director' || employee.role === 'accountant'} /> : <EmployeesPanel />}
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-1 pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? 'border-primary text-primary' : 'border-transparent text-ink/40 hover:text-ink/70'
      }`}
    >
      {children}
    </button>
  )
}

function StatsView() {
  const [stats, setStats] = useState(null)
  const [employeeCount, setEmployeeCount] = useState(null)

  useEffect(() => {
    apiRequest('/stats/summary').then(setStats)
    apiRequest('/employees').then((d) => setEmployeeCount(d.employees.filter((e) => e.is_active).length))
  }, [])

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <div className="text-sm text-ink/50 mb-1">Bugünkü dövriyyə</div>
          <div className="text-2xl font-semibold text-ink">{stats ? stats.today_total.toFixed(2) : '—'} ₼</div>
        </Card>
        <Card>
          <div className="text-sm text-ink/50 mb-1">Aylıq dövriyyə</div>
          <div className="text-2xl font-semibold text-ink">{stats ? stats.month_total.toFixed(2) : '—'} ₼</div>
        </Card>
        <Card>
          <div className="text-sm text-ink/50 mb-1">Aktiv əməkdaş</div>
          <div className="text-2xl font-semibold text-ink">{employeeCount ?? '—'}</div>
        </Card>
      </div>

      <h2 className="font-medium text-ink mb-3">Həkim üzrə dövriyyə (bu ay)</h2>
      <Card>
        {stats?.per_doctor?.length ? (
          stats.per_doctor.map((d) => (
            <div key={d.doctor_id} className="flex items-center justify-between py-2.5 border-b last:border-0 border-black/5">
              <span className="text-sm text-ink">{d.full_name}</span>
              <div className="text-right">
                <div className="text-sm font-medium text-ink">{d.month.toFixed(2)} ₼</div>
                <div className="text-xs text-ink/40">bu gün: {d.today.toFixed(2)} ₼</div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-ink/40 py-4">Hələ ödəniş qeydə alınmayıb.</p>
        )}
      </Card>
    </div>
  )
}
