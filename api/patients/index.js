import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const session = requireRole(req, res, [])
    if (!session) return
    const q = (req.query.q || '').trim()
    let query = supabase.from('patients').select('id, full_name, phone, birth_date').order('full_name').limit(20)
    if (q) query = query.ilike('full_name', `%${q}%`)
    const { data, error } = await query
    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ patients: data })
  }

  if (req.method === 'POST') {
    const session = requireRole(req, res, ['reception', 'nurse', 'hr', 'director'])
    if (!session) return
    const { full_name, phone, birth_date, notes } = req.body || {}
    if (!full_name) return res.status(400).json({ error: 'Pasiyentin adı tələb olunur.' })

    const { data, error } = await supabase
      .from('patients')
      .insert({ full_name, phone: phone || null, birth_date: birth_date || null, notes: notes || null, created_by: session.id })
      .select('id, full_name')
      .single()

    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(201).json({ patient: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
