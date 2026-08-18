import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'
import { Card, StatusBadge, Avatar, EmptyState } from './ui'
import { FlaskConical, Pill } from 'lucide-react'

export default function PatientHistory({ patientId, excludeAppointmentId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiRequest(`/patients/${patientId}`).then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [patientId])

  if (loading) return <p className="text-ink/60">Yüklənir…</p>
  if (!data) return <EmptyState title="Tarixçə tapılmadı" />

  const visits = data.visits.filter((v) => v.id !== excludeAppointmentId)

  return (
    <div>
      <Card className="mb-4 flex items-center gap-3">
        <Avatar name={data.patient.full_name} />
        <div>
          <div className="font-display text-lg font-semibold text-ink">{data.patient.full_name}</div>
          <div className="text-sm text-ink/65">
            {data.patient.phone || 'Telefon yoxdur'}
            {data.patient.birth_date && <> · d.t. {new Date(data.patient.birth_date).toLocaleDateString('az-AZ')}</>}
          </div>
        </div>
      </Card>

      {visits.length === 0 ? (
        <EmptyState title="Əvvəlki qəbul tapılmadı" hint="Bu pasiyentin başqa qəbul tarixçəsi yoxdur." />
      ) : (
        <div className="space-y-3">
          {visits.map((v) => (
            <Card key={v.id}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-sm font-medium text-ink">{v.doctor?.full_name}</div>
                  <div className="text-xs text-ink/60">
                    {v.doctor?.department && `${v.doctor.department} · `}
                    {new Date(v.scheduled_at).toLocaleDateString('az-AZ')}
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>

              {v.complaint && (
                <div className="text-sm text-ink/70 mb-1"><span className="text-ink/60">Şikayət:</span> {v.complaint}</div>
              )}
              {v.diagnosis && (
                <div className="text-sm text-ink mb-1"><span className="text-ink/60">Diaqnoz:</span> {v.diagnosis}</div>
              )}
              {v.notes && (
                <div className="text-sm text-ink/70 mb-1"><span className="text-ink/60">Qeyd:</span> {v.notes}</div>
              )}

              {v.lab_orders.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {v.lab_orders.map((l) => (
                    <div key={l.id} className="flex items-start gap-2 text-sm bg-bg rounded-lg px-3 py-2">
                      <FlaskConical size={14} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <div className="text-ink/70">{l.tests}</div>
                        {l.results ? (
                          <div className="text-ink mt-0.5">{l.results}</div>
                        ) : (
                          <div className="text-warning text-xs mt-0.5">Nəticə gözlənilir</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {v.prescriptions.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {v.prescriptions.map((p) => (
                    <div key={p.id} className="flex items-start gap-2 text-sm bg-bg rounded-lg px-3 py-2">
                      <Pill size={14} className="text-accent mt-0.5 shrink-0" />
                      <div className="text-ink whitespace-pre-wrap">{p.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
