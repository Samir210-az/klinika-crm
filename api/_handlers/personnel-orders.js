import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const session = requireRole(req, res, ['hr', 'director'])
  if (!session) return

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('personnel_orders')
      .select('id, employee_id, employee_name, order_type, order_number, order_date, position, details, created_at, issuer:employees!personnel_orders_issued_by_fkey(full_name)')
      .order('order_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ orders: data })
  }

  if (req.method === 'POST') {
    const { employee_id, employee_name, order_type, order_number, order_date, position, details } = req.body || {}
    if (!employee_name || !order_type) {
      return res.status(400).json({ error: 'Əməkdaş adı və əmr növü tələb olunur.' })
    }
    const validTypes = ['hire', 'terminate', 'promotion', 'other']
    if (!validTypes.includes(order_type)) {
      return res.status(400).json({ error: 'Yanlış əmr növü.' })
    }

    const { data, error } = await supabase
      .from('personnel_orders')
      .insert({
        employee_id: employee_id || null,
        employee_name,
        order_type,
        order_number: order_number || null,
        order_date: order_date || new Date().toISOString().slice(0, 10),
        position: position || null,
        details: details || null,
        issued_by: session.id,
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Server xətası.' })

    // İşdən azad etmə əmri verildikdə əməkdaşı avtomatik deaktiv et
    if (order_type === 'terminate' && employee_id) {
      await supabase.from('employees').update({ is_active: false }).eq('id', employee_id)
    }

    return res.status(201).json({ order: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
