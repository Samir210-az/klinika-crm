import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { apiRequest } from '../lib/api'
import { Avatar } from './ui'
import Logo from './Logo'
import { getInstallPrompt, triggerInstall, isIos, isStandalone } from '../lib/pwaInstall'
import { LogOut, Clock, MessageCircle, Download } from 'lucide-react'

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
  const [canInstall, setCanInstall] = useState(false)
  const [showIosHint, setShowIosHint] = useState(false)

  useEffect(() => {
    if (isStandalone()) return
    if (getInstallPrompt() || isIos()) setCanInstall(true)
    const onAvailable = () => setCanInstall(true)
    window.addEventListener('pwa-install-available', onAvailable)
    return () => window.removeEventListener('pwa-install-available', onAvailable)
  }, [])

  async function handleInstall() {
    if (isIos()) {
      setShowIosHint(true)
      return
    }
    await triggerInstall()
    setCanInstall(false)
  }

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
      <header className="shrink-0 bg-primary z-10 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(120% 140% at 10% 0%, rgba(255,255,255,0.10), transparent 55%), radial-gradient(90% 120% at 100% 100%, rgba(0,0,0,0.15), transparent 60%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={40} serpentColor="#ffffff" cupColor="#e8c078" className="shrink-0" />
            <div className="w-px h-8 bg-white/15 hidden sm:block" />
            <Avatar name={employee?.full_name} dark />
            <div>
              <div className="text-[11px] uppercase tracking-wider text-white/70 font-semibold">
                {ROLE_LABELS[employee?.role] || employee?.role}
              </div>
              <div className="text-[15px] font-semibold text-white leading-tight">{employee?.full_name}</div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link
              to="/chat"
              className={`relative flex items-center gap-1.5 text-sm rounded-xl p-2.5 transition-colors ${
                location.pathname === '/chat' ? 'bg-white/20 text-white' : 'text-white/85 hover:bg-white/10'
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
                location.pathname === '/attendance' ? 'bg-white/20 text-white' : 'text-white/85 hover:bg-white/10'
              }`}
            >
              <Clock size={22} strokeWidth={2} />
              <span className="hidden sm:inline">Davamiyyət</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-white/85 rounded-xl p-2.5 hover:bg-white/10 hover:text-white transition-colors"
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
          <footer className="bg-primary py-6 text-center mt-4">
            {canInstall && (
              <button
                onClick={handleInstall}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3.5 py-1.5 mb-3 transition-colors"
              >
                <Download size={13} /> Tətbiqi telefona yüklə
              </button>
            )}
            <div>
              <a
                href="https://instagram.com/securtiy_group"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/70 hover:text-white transition-colors"
              >
                By securtiy_group
              </a>
            </div>

            {showIosHint && (
              <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-30" onClick={() => setShowIosHint(false)}>
                <div className="bg-surface rounded-2xl p-5 max-w-xs text-center" onClick={(e) => e.stopPropagation()}>
                  <p className="text-sm text-ink mb-3">
                    Safari-də aşağıdakı <strong>Paylaş</strong> düyməsinə bas, sonra <strong>"Ana ekrana əlavə et"</strong> seç.
                  </p>
                  <button onClick={() => setShowIosHint(false)} className="text-sm text-primary font-medium">Bağla</button>
                </div>
              </div>
            )}
          </footer>
        </main>
      )}
    </div>
  )
}
