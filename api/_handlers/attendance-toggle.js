import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getSession } from '../_lib/auth.js'
import { recordAttendance } from '../_lib/attendance.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metod dəstəklənmir.' })

  const session = getSession(req)
  if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

  try {
    const result = await recordAttendance(getSupabaseAdmin(), session.id, 'self')
    return res.status(200).json(result)
  } catch {
    return res.status(500).json({ error: 'Server xətası.' })
  }
}
