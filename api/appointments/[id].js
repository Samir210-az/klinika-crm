import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getSession } from '../_lib/auth.js'

export default async function handler(req, res) {
  const session = getSession(req)
  if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

  const { id } = req.query
  const supabase = getSupabaseAdmin()

  if (req.method === 'PATCH') {
    const { data: appt } = await supabase.from('appointments').select('doctor_id, status').eq('id', id).single()
    if (!appt) return res.status(404).json({ error: 'Qəbul tapılmadı.' })
    if (session.role !== 'doctor' || appt.doctor_id !== session.id) {
      return res.status(403).json({ error: 'Yalnız aid həkim bu qəbulu dəyişə bilər.' })
    }

    const { status, complaint, diagnosis, notes } = req.body || {}
    const updates = {}
    if (complaint !== undefined) updates.complaint = complaint
    if (diagnosis !== undefined) updates.diagnosis = diagnosis
    if (notes !== undefined) updates.notes = notes

    if (status === 'in_progress' && appt.status === 'waiting') {
      updates.status = 'in_progress'
      updates.started_at = new Date().toISOString()
    } else if (status === 'completed') {
      updates.status = 'completed'
      updates.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase.from('appointments').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ appointment: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
