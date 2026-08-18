import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const session = requireRole(req, res, ['hr', 'director'])
  if (!session) return

  const { id } = req.query
  const supabase = getSupabaseAdmin()

  if (req.method === 'PATCH') {
    const allowedFields = ['full_name', 'department', 'consultation_fee', 'is_active', 'supervising_doctor_id']
    const updates = {}
    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined) updates[field] = req.body[field]
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Yenilənəcək sahə göstərilməyib.' })
    }

    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select('id, full_name, role, consultation_fee, is_active')
      .single()

    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ employee: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
