import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getSession } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metod dəstəklənmir.' })

  const session = getSession(req)
  if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

  const supabase = getSupabaseAdmin()

  const [{ data: messages }, { data: reads }] = await Promise.all([
    supabase
      .from('messages')
      .select('sender_id, recipient_id, created_at')
      .or(`recipient_id.is.null,recipient_id.eq.${session.id},sender_id.eq.${session.id}`)
      .neq('sender_id', session.id)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('message_reads').select('conversation_key, last_read_at').eq('employee_id', session.id),
  ])

  const lastReadMap = new Map((reads || []).map((r) => [r.conversation_key, r.last_read_at]))
  const counts = {}

  for (const m of messages || []) {
    const key = m.recipient_id === null ? 'general' : m.sender_id
    const lastRead = lastReadMap.get(key)
    if (!lastRead || m.created_at > lastRead) {
      counts[key] = (counts[key] || 0) + 1
    }
  }

  return res.status(200).json({ counts })
}
