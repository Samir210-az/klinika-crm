import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const session = requireRole(req, res, ['hr', 'director'])
  if (!session) return

  const { id } = req.query
  const supabase = getSupabaseAdmin()

  if (req.method === 'PATCH') {
    const { status } = req.body || {}
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status "approved" və ya "rejected" olmalıdır.' })
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update({ status, reviewed_by: session.id, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ leave_request: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
