import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const session = requireRole(req, res, ['accountant', 'director', 'hr'])
  if (!session) return

  const supabase = getSupabaseAdmin()
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data: monthPayments, error } = await supabase
    .from('payments')
    .select('amount, created_at, doctor:employees!payments_doctor_id_fkey(id, full_name)')
    .gte('created_at', startOfMonth)

  if (error) return res.status(500).json({ error: 'Server xətası.' })

  const todayDateStr = now.toISOString().slice(0, 10)
  const monthStartDateStr = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)

  const { data: monthExpenses, error: expError } = await supabase
    .from('finance_entries')
    .select('amount, entry_date, type')
    .gte('entry_date', monthStartDateStr)

  if (expError) return res.status(500).json({ error: 'Server xətası.' })

  let todayTotal = 0
  let monthTotal = 0
  const perDoctor = {}

  for (const p of monthPayments) {
    monthTotal += Number(p.amount)
    const isToday = p.created_at >= startOfDay
    if (isToday) todayTotal += Number(p.amount)

    const key = p.doctor?.id || 'unknown'
    if (!perDoctor[key]) {
      perDoctor[key] = { doctor_id: key, full_name: p.doctor?.full_name || '—', today: 0, month: 0 }
    }
    perDoctor[key].month += Number(p.amount)
    if (isToday) perDoctor[key].today += Number(p.amount)
  }

  let todayExpenses = 0
  let monthExpensesTotal = 0
  for (const e of monthExpenses) {
    monthExpensesTotal += Number(e.amount)
    if (e.entry_date === todayDateStr) todayExpenses += Number(e.amount)
  }

  return res.status(200).json({
    today_total: todayTotal,
    month_total: monthTotal,
    today_expenses: todayExpenses,
    month_expenses: monthExpensesTotal,
    today_net: todayTotal - todayExpenses,
    month_net: monthTotal - monthExpensesTotal,
    per_doctor: Object.values(perDoctor).sort((a, b) => b.month - a.month),
  })
}
