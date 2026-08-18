import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole, getSession } from '../_lib/auth.js'

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const session = getSession(req)
    if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

    let query = supabase
      .from('appointments')
      .select('id, status, complaint, diagnosis, scheduled_at, started_at, completed_at, patient:patients(id, full_name, phone), doctor:employees!appointments_doctor_id_fkey(id, full_name)')
      .order('scheduled_at', { ascending: true })

    if (req.query.status) query = query.eq('status', req.query.status)
    if (req.query.date) {
      query = query.gte('scheduled_at', `${req.query.date}T00:00:00`).lte('scheduled_at', `${req.query.date}T23:59:59`)
    }

    if (session.role === 'doctor') {
      query = query.eq('doctor_id', session.id)
    } else if (session.role === 'nurse') {
      const { data: nurse } = await supabase.from('employees').select('supervising_doctor_id').eq('id', session.id).single()
      if (!nurse?.supervising_doctor_id) return res.status(200).json({ appointments: [] })
      query = query.eq('doctor_id', nurse.supervising_doctor_id)
    } else if (req.query.doctor_id && ['reception', 'accountant', 'hr', 'director'].includes(session.role)) {
      query = query.eq('doctor_id', req.query.doctor_id)
    }

    const { data, error } = await query
    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ appointments: data })
  }

  if (req.method === 'POST') {
    const session = requireRole(req, res, ['reception', 'nurse'])
    if (!session) return
    const { patient_id, doctor_id, complaint } = req.body || {}
    if (!patient_id || !doctor_id) {
      return res.status(400).json({ error: 'Pasiyent və həkim seçilməlidir.' })
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert({ patient_id, doctor_id, complaint: complaint || null, assigned_by: session.id, status: 'waiting' })
      .select('id')
      .single()

    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(201).json({ appointment: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
