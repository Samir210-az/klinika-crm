import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

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
      <div className="md:w-2/5 bg-primary text-white flex flex-col justify-between p-10 md:p-14">
        <div>
          <div className="text-sm tracking-[0.2em] uppercase text-white/60">Klinika CRM</div>
          <h1 className="mt-6 text-4xl md:text-5xl font-semibold leading-tight">
            Qəbuldan direktora,<br />bir sistemdə.
          </h1>
        </div>
        <p className="text-white/70 text-sm max-w-sm">
          Hər əməkdaş girişdən sonra birbaşa öz iş görünüşünə düşür — resepşn növbə açır,
          həkim müayinə edir, mühasibatlıq ödənişi izləyir.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm animate-fade-in">
          <h2 className="text-2xl font-semibold text-ink mb-1">Daxil ol</h2>
          <p className="text-sm text-ink/60 mb-8">Telefon nömrən və PIN kodunla giriş et.</p>

          <label className="block text-sm font-medium text-ink/80 mb-1.5">Telefon</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="0XX XXX XX XX"
            className="w-full rounded-xl border border-black/10 bg-surface px-4 py-3 mb-5 text-ink outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />

          <label className="block text-sm font-medium text-ink/80 mb-1.5">PIN</label>
          <input
            type="password"
            required
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            placeholder="••••"
            className="w-full rounded-xl border border-black/10 bg-surface px-4 py-3 mb-6 tracking-[0.4em] text-ink outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />

          {error && (
            <div className="mb-5 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary text-white font-medium py-3 hover:bg-primary-dark transition-colors disabled:opacity-60"
          >
            {loading ? 'Yoxlanılır…' : 'Daxil ol'}
          </button>

          <p className="text-xs text-ink/40 mt-6">
            Hesabın yoxdur? Kadrlar şöbəsi ilə əlaqə saxla.
          </p>

          <a
            href="https://instagram.com/securtiy_group"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-ink/30 hover:text-ink/50 transition-colors mt-10"
          >
            By securtiy_group
          </a>
        </form>
      </div>
    </div>
  )
}
