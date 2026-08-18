import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Avatar } from './ui'
import { LogOut } from 'lucide-react'

const ROLE_LABELS = {
  reception: 'Resepşn',
  doctor: 'Həkim',
  nurse: 'Tibb bacısı',
  accountant: 'Mühasibatlıq',
  hr: 'Kadrlar şöbəsi',
  director: 'Direktor',
  laborant: 'Laborant',
}

export default function Layout({ children }) {
  const { employee, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-black/[0.06] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={employee?.full_name} />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">
                {ROLE_LABELS[employee?.role] || employee?.role}
              </div>
              <div className="text-[15px] font-semibold text-ink leading-tight">{employee?.full_name}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-ink/50 hover:text-danger transition-colors"
          >
            <LogOut size={15} />
            Çıxış
          </button>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-5 py-6">{children}</main>

      <footer className="max-w-5xl mx-auto px-5 py-6 text-center">
        <a
          href="https://instagram.com/securtiy_group"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-ink/30 hover:text-ink/50 transition-colors"
        >
          By securtiy_group
        </a>
      </footer>
    </div>
  )
}
