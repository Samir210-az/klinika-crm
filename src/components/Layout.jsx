import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const ROLE_LABELS = {
  reception: 'Resepşn',
  doctor: 'Həkim',
  nurse: 'Tibb bacısı',
  accountant: 'Mühasibatlıq',
  hr: 'Kadrlar şöbəsi',
  director: 'Direktor',
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
      <header className="bg-surface border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-primary font-medium">
              {ROLE_LABELS[employee?.role] || employee?.role}
            </div>
            <div className="text-lg font-semibold text-ink">{employee?.full_name}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-ink/50 hover:text-danger transition-colors"
          >
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
