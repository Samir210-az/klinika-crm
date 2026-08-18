import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getSession, requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const session = getSession(req)
    if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

    let query = supabase
      .from('leave_requests')
      .select('id, start_date, end_date, type, reason, status, requested_at, employee:employees!leave_requests_employee_id_fkey(id, full_name)')
      .order('requested_at', { ascending: false })

    if (['hr', 'director'].includes(session.role)) {
      if (req.query.status) query = query.eq('status', req.query.status)
    } else {
      query = query.eq('employee_id', session.id)
    }

    const { data, error } = await query
    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ leave_requests: data })
  }

  if (req.method === 'POST') {
    const session = getSession(req)
    if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

    const { start_date, end_date, type, reason } = req.body || {}
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Başlanğıc və bitmə tarixi tələb olunur.' })
    }
    if (end_date < start_date) {
      return res.status(400).json({ error: 'Bitmə tarixi başlanğıcdan əvvəl ola bilməz.' })
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .insert({ employee_id: session.id, start_date, end_date, type: type || 'vacation', reason: reason || null })
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(201).json({ leave_request: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
