import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole, getSession } from '../_lib/auth.js'

const FULL_ACCESS_ROLES = ['hr', 'director']

export default async function handler(req, res) {
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const session = getSession(req)
    if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

    if (FULL_ACCESS_ROLES.includes(session.role)) {
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, phone, role, department, consultation_fee, supervising_doctor_id, is_active, created_at')
        .order('created_at', { ascending: false })
      if (error) return res.status(500).json({ error: 'Server xətası.' })
      return res.status(200).json({ employees: data })
    }

    // Digər rollar üçün: yalnız məhdud siyahı (məs. həkim seçimi üçün dropdown), həssas sahələr yoxdur
    const roleFilter = req.query.role
    if (roleFilter !== 'doctor' && roleFilter !== 'nurse') {
      return res.status(403).json({ error: 'Bu əməliyyat üçün icazəniz yoxdur.' })
    }
    const { data, error } = await supabase
      .from('employees')
      .select('id, full_name')
      .eq('role', roleFilter)
      .eq('is_active', true)
      .order('full_name')
    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ employees: data })
  }

  if (req.method === 'POST') {
    const session = requireRole(req, res, FULL_ACCESS_ROLES)
    if (!session) return

    const { full_name, phone, pin, role, department, consultation_fee, supervising_doctor_id } = req.body || {}
    if (!full_name || !phone || !pin || !role) {
      return res.status(400).json({ error: 'Ad, telefon, PIN və rol tələb olunur.' })
    }
    if (!/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN 4-6 rəqəmdən ibarət olmalıdır.' })
    }
    const validRoles = ['reception', 'doctor', 'nurse', 'accountant', 'hr', 'director']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Yanlış rol.' })
    }

    const pin_hash = await bcrypt.hash(pin, 10)

    const { data, error } = await supabase
      .from('employees')
      .insert({
        full_name,
        phone: phone.trim(),
        pin_hash,
        role,
        department: department || null,
        consultation_fee: role === 'doctor' ? (consultation_fee ?? null) : null,
        supervising_doctor_id: role === 'nurse' ? (supervising_doctor_id ?? null) : null,
        created_by: session.id,
      })
      .select('id, full_name, phone, role')
      .single()

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Bu telefon nömrəsi ilə əməkdaş artıq mövcuddur.' })
      }
      return res.status(500).json({ error: 'Server xətası.' })
    }
    return res.status(201).json({ employee: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
