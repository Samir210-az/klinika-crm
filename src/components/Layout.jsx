import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import { Avatar } from './ui'
import Logo from './Logo'
import { LogOut, Clock, MessageCircle } from 'lucide-react'

const ROLE_LABELS = {
  reception: 'Resepşn',
  doctor: 'Həkim',
  nurse: 'Tibb bacısı',
  accountant: 'Mühasibatlıq',
  hr: 'Kadrlar şöbəsi',
  director: 'Direktor',
  laborant: 'Laborant',
}

export default function Layout({ children, fullHeight = false }) {
  const { employee, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [totalUnread, setTotalUnread] = useState(0)

  const loadUnread = useCallback(async () => {
    try {
      const data = await apiRequest('/messages/unread')
      setTotalUnread(Object.values(data.counts).reduce((s, n) => s + n, 0))
    } catch {
      // sakitcə keç
    }
  }, [])

  useEffect(() => {
    loadUnread()
    const t = setInterval(loadUnread, 15000)
    return () => clearInterval(t)
  }, [loadUnread])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-bg overflow-hidden">
      <header className="shrink-0 bg-surface border-b border-black/[0.06] z-10">
        <div className="max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={26} className="shrink-0" />
            <div className="w-px h-8 bg-black/[0.06] hidden sm:block" />
            <Avatar name={employee?.full_name} />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-primary font-semibold">
                {ROLE_LABELS[employee?.role] || employee?.role}
              </div>
              <div className="text-[15px] font-semibold text-ink leading-tight">{employee?.full_name}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              to="/chat"
              className={`relative flex items-center gap-1.5 text-sm rounded-xl p-2.5 transition-colors ${
                location.pathname === '/chat' ? 'text-primary bg-primary-light' : 'text-ink hover:bg-black/[0.04]'
              }`}
            >
              <MessageCircle size={22} strokeWidth={2} />
              <span className="hidden sm:inline">Söhbət</span>
              {totalUnread > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[10px] font-medium flex items-center justify-center">
                  {totalUnread > 9 ? '9+' : totalUnread}
                </span>
              )}
            </Link>
            <Link
              to="/attendance"
              className={`flex items-center gap-1.5 text-sm rounded-xl p-2.5 transition-colors ${
                location.pathname === '/attendance' ? 'text-primary bg-primary-light' : 'text-ink hover:bg-black/[0.04]'
              }`}
            >
              <Clock size={22} strokeWidth={2} />
              <span className="hidden sm:inline">Davamiyyət</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-ink rounded-xl p-2.5 hover:bg-danger/10 hover:text-danger transition-colors"
            >
              <LogOut size={22} strokeWidth={2} />
              <span className="hidden sm:inline">Çıxış</span>
            </button>
          </div>
        </div>
      </header>

      {fullHeight ? (
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col">{children}</main>
      ) : (
        <main className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-5 py-6">{children}</div>
          <footer className="max-w-5xl mx-auto px-5 py-6 text-center">
            <a
              href="https://instagram.com/securtiy_group"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ink/50 hover:text-ink/65 transition-colors"
            >
              By securtiy_group
            </a>
          </footer>
        </main>
      )}
    </div>
  )
}
