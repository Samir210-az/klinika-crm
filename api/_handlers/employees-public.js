import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'

// DİQQƏT: Bu endpoint qəsdən auth tələb etmir (kiosk cihazı üçün) —
// yalnız ad və rol qaytarır, heç bir həssas məlumat (telefon, PIN, maaş) yoxdur.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metod dəstəklənmir.' })

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('employees')
    .select('id, full_name, role')
    .eq('is_active', true)
    .order('full_name')

  if (error) return res.status(500).json({ error: 'Server xətası.' })
  return res.status(200).json({ employees: data })
}
