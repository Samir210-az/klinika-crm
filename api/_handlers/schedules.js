import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getSession, requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const session = getSession(req)
    if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

    const employeeId = req.query.employee_id
    if (employeeId && employeeId !== session.id && !['hr', 'director'].includes(session.role)) {
      return res.status(403).json({ error: 'Bu əməliyyat üçün icazəniz yoxdur.' })
    }

    const { data, error } = await supabase
      .from('work_schedules')
      .select('day_of_week, start_time, end_time')
      .eq('employee_id', employeeId || session.id)
      .order('day_of_week')

    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ schedule: data })
  }

  if (req.method === 'PUT') {
    const session = requireRole(req, res, ['hr', 'director'])
    if (!session) return

    const { employee_id, days } = req.body || {}
    // days: [{ day_of_week, start_time, end_time }, ...]
    if (!employee_id || !Array.isArray(days)) {
      return res.status(400).json({ error: 'Əməkdaş və qrafik günləri tələb olunur.' })
    }

    await supabase.from('work_schedules').delete().eq('employee_id', employee_id)

    if (days.length > 0) {
      const rows = days.map((d) => ({ employee_id, day_of_week: d.day_of_week, start_time: d.start_time, end_time: d.end_time }))
      const { error } = await supabase.from('work_schedules').insert(rows)
      if (error) return res.status(500).json({ error: 'Server xətası.' })
    }

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
