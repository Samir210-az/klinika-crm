import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const session = requireRole(req, res, ['hr', 'director'])
  if (!session) return

  const { id } = req.query
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id, full_name, phone, role, department, consultation_fee, is_active, created_at')
      .eq('id', id)
      .single()
    if (empError || !employee) return res.status(404).json({ error: 'Əməkdaş tapılmadı.' })

    const { data: appointments } = await supabase
      .from('appointments')
      .select('id, status, diagnosis, scheduled_at, completed_at, patient:patients(id, full_name)')
      .eq('doctor_id', id)
      .order('scheduled_at', { ascending: false })
      .limit(100)

    const { data: payments } = await supabase
      .from('payments')
      .select('amount, type, created_at')
      .eq('doctor_id', id)

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const todayRevenue = (payments || []).filter((p) => p.created_at >= startOfDay).reduce((s, p) => s + Number(p.amount), 0)
    const monthRevenue = (payments || []).filter((p) => p.created_at >= startOfMonth).reduce((s, p) => s + Number(p.amount), 0)

    return res.status(200).json({
      employee,
      appointments: appointments || [],
      today_revenue: todayRevenue,
      month_revenue: monthRevenue,
    })
  }

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

  if (req.method === 'DELETE') {
    if (id === session.id) {
      return res.status(400).json({ error: 'Öz hesabınızı silə bilməzsiniz.' })
    }

    const { error } = await supabase.from('employees').delete().eq('id', id)

    if (error) {
      // Foreign key violation - əməkdaşın qəbul/ödəniş/resept tarixçəsi var
      if (error.code === '23503') {
        return res.status(409).json({
          error: 'Bu əməkdaşın qəbul/ödəniş tarixçəsi olduğu üçün silinə bilmir. Əvəzinə deaktiv edin.',
        })
      }
      return res.status(500).json({ error: 'Server xətası.' })
    }
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
