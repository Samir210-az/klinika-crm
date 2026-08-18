import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getSession } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metod dəstəklənmir.' })

  const session = getSession(req)
  if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

  const supabase = getSupabaseAdmin()
  const today = new Date().toISOString().slice(0, 10)

  const [{ data: todayRecord }, { data: history }] = await Promise.all([
    supabase.from('attendance').select('*').eq('employee_id', session.id).eq('work_date', today).maybeSingle(),
    supabase
      .from('attendance')
      .select('work_date, check_in_at, check_out_at, late_minutes')
      .eq('employee_id', session.id)
      .order('work_date', { ascending: false })
      .limit(30),
  ])

  return res.status(200).json({ today: todayRecord || null, history: history || [] })
}
