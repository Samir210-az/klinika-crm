import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { signSession } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Yalnız POST icazəlidir.' })
  }

  const { phone, pin } = req.body || {}
  if (!phone || !pin) {
    return res.status(400).json({ error: 'Telefon və PIN tələb olunur.' })
  }

  const supabase = getSupabaseAdmin()
  const { data: employee, error } = await supabase
    .from('employees')
    .select('id, full_name, phone, pin_hash, role, is_active')
    .eq('phone', phone.trim())
    .maybeSingle()

  if (error) {
    return res.status(500).json({ error: 'Server xətası.' })
  }
  if (!employee || !employee.is_active) {
    return res.status(401).json({ error: 'Telefon və ya PIN yanlışdır.' })
  }

  const valid = await bcrypt.compare(pin, employee.pin_hash)
  if (!valid) {
    return res.status(401).json({ error: 'Telefon və ya PIN yanlışdır.' })
  }

  const token = signSession(employee)
  return res.status(200).json({
    token,
    employee: {
      id: employee.id,
      full_name: employee.full_name,
      role: employee.role,
    },
  })
}
