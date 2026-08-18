import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const session = requireRole(req, res, [])
    if (!session) return
    const { appointment_id } = req.query
    if (!appointment_id) return res.status(400).json({ error: 'appointment_id tələb olunur.' })
    const { data, error } = await supabase.from('prescriptions').select('*').eq('appointment_id', appointment_id).order('created_at')
    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ prescriptions: data })
  }

  if (req.method === 'POST') {
    const session = requireRole(req, res, ['doctor'])
    if (!session) return
    const { appointment_id, patient_id, content } = req.body || {}
    if (!appointment_id || !patient_id || !content) {
      return res.status(400).json({ error: 'Qəbul, pasiyent və resept mətni tələb olunur.' })
    }

    const { data: appt } = await supabase.from('appointments').select('doctor_id').eq('id', appointment_id).single()
    if (!appt || appt.doctor_id !== session.id) {
      return res.status(403).json({ error: 'Yalnız öz qəbulunuz üçün resept yaza bilərsiniz.' })
    }

    const { data, error } = await supabase
      .from('prescriptions')
      .insert({ appointment_id, patient_id, doctor_id: session.id, content })
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(201).json({ prescription: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
