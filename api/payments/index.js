import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole, getSession } from '../_lib/auth.js'

const RECORD_ROLES = ['reception', 'accountant', 'hr', 'director']

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const session = getSession(req)
    if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

    let query = supabase
      .from('payments')
      .select('id, amount, payment_method, created_at, patient:patients(full_name), doctor:employees!payments_doctor_id_fkey(id, full_name)')
      .order('created_at', { ascending: false })

    if (session.role === 'doctor') {
      // Həkim yalnız öz ödənişlərini görür, başqasınınkını yox
      query = query.eq('doctor_id', session.id)
    } else if (!['accountant', 'hr', 'director'].includes(session.role)) {
      return res.status(403).json({ error: 'Bu əməliyyat üçün icazəniz yoxdur.' })
    } else if (req.query.doctor_id) {
      query = query.eq('doctor_id', req.query.doctor_id)
    }

    if (req.query.from) query = query.gte('created_at', req.query.from)
    if (req.query.to) query = query.lte('created_at', req.query.to)

    const { data, error } = await query
    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ payments: data })
  }

  if (req.method === 'POST') {
    const session = requireRole(req, res, RECORD_ROLES)
    if (!session) return

    const { appointment_id, patient_id, doctor_id, amount, payment_method } = req.body || {}
    if (!patient_id || !doctor_id || !amount) {
      return res.status(400).json({ error: 'Pasiyent, həkim və məbləğ tələb olunur.' })
    }

    const { data, error } = await supabase
      .from('payments')
      .insert({
        appointment_id: appointment_id || null,
        patient_id,
        doctor_id,
        amount,
        payment_method: payment_method || 'cash',
        recorded_by: session.id,
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(201).json({ payment: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
