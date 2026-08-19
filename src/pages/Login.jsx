import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ArrowRight, Download } from 'lucide-react'
import Logo from '../components/Logo'
import { getInstallPrompt, triggerInstall, isIos, isStandalone } from '../lib/pwaInstall'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()
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

  async function handleSubmit(e) {
    e.preventDefault()
    try {
      await login(phone, pin)
      navigate('/')
    } catch {
      // xəta artıq context-də saxlanılır
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="relative md:w-2/5 bg-primary text-white flex flex-col justify-between p-10 md:p-14 overflow-hidden">
        {/* Fon dərinliyi: iki radial gradient qatı */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(120% 90% at 15% 0%, rgba(255,255,255,0.14), transparent 55%), radial-gradient(90% 70% at 100% 100%, rgba(0,0,0,0.25), transparent 60%)',
          }}
        />
        {/* İmza elementi: nəbz xətti */}
        <svg
          className="pointer-events-none absolute left-0 right-0 bottom-24 w-full opacity-[0.18]"
          viewBox="0 0 400 60"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0 30 H120 L138 10 L156 50 L172 30 H210 L224 4 L240 56 L256 30 H400"
            stroke="white"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        <div className="relative">
          <Logo size={44} serpentColor="#ffffff" cupColor="#e8c078" className="mb-5" />
          <div className="text-sm tracking-[0.2em] uppercase text-white/60">Klinika CRM</div>
          <h1 className="font-display mt-6 text-4xl md:text-[2.75rem] font-medium leading-[1.1]">
            Qəbuldan direktora,
            <br />
            bir sistemdə.
          </h1>
        </div>
        <p className="relative text-white/70 text-sm max-w-sm leading-relaxed">
          Hər əməkdaş girişdən sonra birbaşa öz iş görünüşünə düşür — resepşn növbə açır,
          həkim müayinə edir, mühasibatlıq ödənişi izləyir.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm animate-fade-in">
          <h2 className="font-display text-2xl font-semibold text-ink mb-1">Daxil ol</h2>
          <p className="text-sm text-ink/65 mb-8">Telefon nömrən və PIN kodunla giriş et.</p>

          <label className="block text-sm font-medium text-ink/80 mb-1.5">Telefon</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0XX XXX XX XX"
            className="w-full rounded-xl border border-black/10 bg-surface px-4 py-3 mb-5 text-ink outline-none transition-shadow focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />

          <label className="block text-sm font-medium text-ink/80 mb-1.5">PIN</label>
          <input
            type="password"
            required
            maxLength={12}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="PIN"
            className="w-full rounded-xl border border-black/10 bg-surface px-4 py-3 mb-6 tracking-[0.2em] text-ink outline-none transition-shadow focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />

          {error && (
            <div className="mb-5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-medium py-3 hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {loading ? 'Yoxlanılır…' : (<>Daxil ol <ArrowRight size={16} /></>)}
          </button>

          <p className="text-xs text-ink/60 mt-6">
            Hesabın yoxdur? Kadrlar şöbəsi ilə əlaqə saxla.
          </p>

          <a
            href="https://instagram.com/securtiy_group"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-ink/50 hover:text-ink/65 transition-colors mt-10"
          >
            By securtiy_group
          </a>

          {canInstall && (
            <button
              type="button"
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-primary font-medium mt-3"
            >
              <Download size={13} /> Tətbiqi telefona yüklə
            </button>
          )}

          {showIosHint && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-30" onClick={() => setShowIosHint(false)}>
              <div className="bg-surface rounded-2xl p-5 max-w-xs text-center" onClick={(e) => e.stopPropagation()}>
                <p className="text-sm text-ink mb-3">
                  Safari-də aşağıdakı <strong>Paylaş</strong> düyməsinə bas, sonra <strong>"Ana ekrana əlavə et"</strong> seç.
                </p>
                <button type="button" onClick={() => setShowIosHint(false)} className="text-sm text-primary font-medium">Bağla</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
