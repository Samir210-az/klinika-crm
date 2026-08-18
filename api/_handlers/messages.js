import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getSession } from '../_lib/auth.js'

export default async function handler(req, res) {
  const session = getSession(req)
  if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const conversation = req.query.conversation
    if (!conversation) return res.status(400).json({ error: 'conversation parametri tələb olunur.' })

    let query = supabase
      .from('messages')
      .select('id, sender_id, recipient_id, content, created_at, sender:employees!messages_sender_id_fkey(id, full_name)')
      .order('created_at', { ascending: true })
      .limit(200)

    if (conversation === 'general') {
      query = query.is('recipient_id', null)
    } else {
      query = query.or(
        `and(sender_id.eq.${session.id},recipient_id.eq.${conversation}),and(sender_id.eq.${conversation},recipient_id.eq.${session.id})`
      )
    }

    const { data, error } = await query
    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(200).json({ messages: data })
  }

  if (req.method === 'POST') {
    const { conversation, content } = req.body || {}
    if (!conversation || !content?.trim()) {
      return res.status(400).json({ error: 'Söhbət və mesaj mətni tələb olunur.' })
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: session.id,
        recipient_id: conversation === 'general' ? null : conversation,
        content: content.trim(),
      })
      .select('id, sender_id, recipient_id, content, created_at')
      .single()

    if (error) return res.status(500).json({ error: 'Server xətası.' })
    return res.status(201).json({ message: data })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
