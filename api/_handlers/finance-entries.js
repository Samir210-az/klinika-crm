import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const session = requireRole(req, res, ['accountant', 'director'])
  if (!session) return

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    let query = supabase
      .from('finance_entries')
      .select('id, type, employee_id, employee_name, category, amount, description, entry_date, created_at, recorder:employees!finance_entries_recorded_by_fkey(full_name)')
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (req.query.type) query = query.eq('type', req.query.type)
    if (req.query.from) query = query.gte('entry_date', req.query.from)
    if (req.query.to) query = query.lte('entry_date', req.query.to)

    const { data, error } = await query
    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ entries: data })
  }

  if (req.method === 'POST') {
    const { type, employee_id, employee_name, category, amount, description, entry_date } = req.body || {}
    if (!type || !amount) {
      return res.status(400).json({ error: 'Növ və məbləğ tələb olunur.' })
    }
    if (!['salary', 'expense', 'bonus'].includes(type)) {
      return res.status(400).json({ error: 'Yanlış növ.' })
    }
    if ((type === 'salary' || type === 'bonus') && !employee_name) {
      return res.status(400).json({ error: 'Əməkdaş adı tələb olunur.' })
    }

    const { data, error } = await supabase
      .from('finance_entries')
      .insert({
        type,
        employee_id: employee_id || null,
        employee_name: employee_name || null,
        category: category || null,
        amount,
        description: description || null,
        entry_date: entry_date || new Date().toISOString().slice(0, 10),
        recorded_by: session.id,
      })
      .select()
      .single()

    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(201).json({ entry: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
