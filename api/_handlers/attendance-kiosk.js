import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { recordAttendance } from '../_lib/attendance.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metod dəstəklənmir.' })

  const { employee_id, pin } = req.body || {}
  if (!employee_id || !pin) return res.status(400).json({ error: 'Əməkdaş və PIN tələb olunur.' })

  const supabase = getSupabaseAdmin()
  const { data: employee, error } = await supabase
    .from('employees')
    .select('id, full_name, pin_hash, is_active')
    .eq('id', employee_id)
    .maybeSingle()

  if (error) return res.status(500).json({ error: 'Server xətası.' })
  if (!employee || !employee.is_active) return res.status(401).json({ error: 'Telefon və ya PIN yanlışdır.' })

  const valid = await bcrypt.compare(pin, employee.pin_hash)
  if (!valid) return res.status(401).json({ error: 'Telefon və ya PIN yanlışdır.' })

  try {
    const result = await recordAttendance(supabase, employee.id, 'kiosk')
    return res.status(200).json({ ...result, employee_name: employee.full_name })
  } catch {
    return res.status(500).json({ error: 'Server xətası.' })
  }
}
