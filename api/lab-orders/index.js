import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole, getSession } from '../_lib/auth.js'

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const session = getSession(req)
    if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

    let query = supabase
      .from('lab_orders')
      .select('id, tests, status, results, created_at, completed_at, patient:patients(id, full_name), doctor:employees!lab_orders_doctor_id_fkey(id, full_name)')
      .order('created_at', { ascending: true })

    if (session.role === 'laborant') {
      if (req.query.status) query = query.eq('status', req.query.status)
    } else if (session.role === 'doctor') {
      query = query.eq('doctor_id', session.id)
      if (req.query.appointment_id) query = query.eq('appointment_id', req.query.appointment_id)
    } else if (['reception', 'accountant', 'hr', 'director'].includes(session.role)) {
      if (req.query.appointment_id) query = query.eq('appointment_id', req.query.appointment_id)
      if (req.query.status) query = query.eq('status', req.query.status)
    } else {
      return res.status(403).json({ error: 'Bu əməliyyat üçün icazəniz yoxdur.' })
    }

    const { data, error } = await query
    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ lab_orders: data })
  }

  if (req.method === 'POST') {
    const session = requireRole(req, res, ['doctor'])
    if (!session) return

    const { appointment_id, patient_id, tests } = req.body || {}
    if (!appointment_id || !patient_id || !tests) {
      return res.status(400).json({ error: 'Qəbul, pasiyent və analiz siyahısı tələb olunur.' })
    }

    const { data: appt } = await supabase.from('appointments').select('doctor_id').eq('id', appointment_id).single()
    if (!appt || appt.doctor_id !== session.id) {
      return res.status(403).json({ error: 'Yalnız öz qəbulunuz üçün analiz təyin edə bilərsiniz.' })
    }

    const { data, error } = await supabase
      .from('lab_orders')
      .insert({ appointment_id, patient_id, doctor_id: session.id, tests, requested_by: session.id })
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(201).json({ lab_order: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
