import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const session = requireRole(req, res, ['director'])
  if (!session) return

  const { id } = req.query
  const supabase = getSupabaseAdmin()

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('patients').delete().eq('id', id)

    if (error) {
      if (error.code === '23503') {
        return res.status(409).json({
          error: 'Bu pasiyentin qəbul/resept tarixçəsi olduğu üçün silinə bilmir.',
        })
      }
      return res.status(500).json({ error: 'Server xətası.' })
    }
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
