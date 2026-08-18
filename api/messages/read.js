import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getSession } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metod dəstəklənmir.' })

  const session = getSession(req)
  if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

  const { conversation } = req.body || {}
  if (!conversation) return res.status(400).json({ error: 'conversation tələb olunur.' })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('message_reads')
    .upsert(
      { employee_id: session.id, conversation_key: conversation, last_read_at: new Date().toISOString() },
      { onConflict: 'employee_id,conversation_key' }
    )

  if (error) return res.status(500).json({ error: 'Server xətası.' })
  return res.status(200).json({ success: true })
}
