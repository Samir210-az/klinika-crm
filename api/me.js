import { getSupabaseAdmin } from './_lib/supabaseAdmin.js'
import { getSession } from './_lib/auth.js'

export default async function handler(req, res) {
  const session = getSession(req)
  if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('employees')
    .select('id, full_name, role, supervising_doctor_id, consultation_fee')
    .eq('id', session.id)
    .single()

  if (error) return res.status(500).json({ error: 'Server xətası.' })
  return res.status(200).json({ employee: data })
}
