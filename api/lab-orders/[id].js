import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const session = requireRole(req, res, ['laborant'])
  if (!session) return

  const { id } = req.query
  const supabase = getSupabaseAdmin()

  if (req.method === 'PATCH') {
    const { results, status } = req.body || {}
    const updates = {}
    if (results !== undefined) updates.results = results
    if (status === 'completed') {
      updates.status = 'completed'
      updates.completed_by = session.id
      updates.completed_at = new Date().toISOString()
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Yenilənəcək sahə göstərilməyib.' })
    }

    const { data, error } = await supabase.from('lab_orders').update(updates).eq('id', id).select().single()
    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ lab_order: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
