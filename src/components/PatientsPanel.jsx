import { useEffect, useState, useCallback } from 'react'
import { apiRequest } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Card, Button, EmptyState, Avatar, TealCard } from './ui'
import PatientHistory from './PatientHistory'
import { Trash2, Search } from 'lucide-react'

export default function PatientsPanel() {
  const { employee } = useAuth()
  const canDelete = employee.role === 'director'
  const [patients, setPatients] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  const load = useCallback(async (q = '') => {
    setLoading(true)
    const data = await apiRequest(`/patients?all=1${q ? `&q=${encodeURIComponent(q)}` : ''}`)
    setPatients(data.patients)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const t = setTimeout(() => load(query), 300)
    return () => clearTimeout(t)
  }, [query, load])

  async function handleDelete(patient) {
    if (!confirm(`${patient.full_name} silinsin? Bu əməliyyat geri qaytarıla bilməz.`)) return
    setDeletingId(patient.id)
    setError(null)
    try {
      await apiRequest(`/patients/${patient.id}`, { method: 'DELETE' })
      setPatients((prev) => prev.filter((p) => p.id !== patient.id))
    } catch (e) {
      setError(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (selectedId) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setSelectedId(null)} className="text-sm text-ink/65 hover:text-ink mb-4">← Siyahıya qayıt</button>
        <PatientHistory patientId={selectedId} />
      </div>
    )
  }

  return (
    <div>
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/50" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pasiyent adı ilə axtar…"
          className="w-full rounded-xl border border-black/10 bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {error && <p className="text-danger text-sm mb-3">{error}</p>}

      {loading ? (
        <p className="text-ink/60">Yüklənir…</p>
      ) : patients.length === 0 ? (
        <EmptyState title="Pasiyent tapılmadı" />
      ) : (
        <div className="space-y-2">
          {patients.map((p) => (
            <TealCard key={p.id} className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => setSelectedId(p.id)}>
              <Avatar name={p.full_name} dark />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{p.full_name}</div>
                <div className="text-sm text-white/70">{p.phone || 'Telefon yoxdur'}</div>
              </div>
              {canDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(p) }}
                  disabled={deletingId === p.id}
                  className="rounded-lg p-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </TealCard>
          ))}
        </div>
      )}
    </div>
  )
}
