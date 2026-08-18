import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { getSession, requireRole } from '../_lib/auth.js'

const CLINICAL_VIEW_ROLES = ['doctor', 'nurse', 'director', 'hr']

export default async function handler(req, res) {
  const { id } = req.query
  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const session = getSession(req)
    if (!session) return res.status(401).json({ error: 'Giriş tələb olunur.' })
    if (!CLINICAL_VIEW_ROLES.includes(session.role)) {
      return res.status(403).json({ error: 'Bu əməliyyat üçün icazəniz yoxdur.' })
    }

    const [{ data: patient, error: patientError }, { data: appointments }, { data: prescriptions }, { data: labOrders }] = await Promise.all([
      supabase.from('patients').select('id, full_name, phone, birth_date, notes, created_at').eq('id', id).single(),
      supabase
        .from('appointments')
        .select('id, status, complaint, diagnosis, notes, scheduled_at, completed_at, doctor:employees!appointments_doctor_id_fkey(id, full_name, department)')
        .eq('patient_id', id)
        .order('scheduled_at', { ascending: false }),
      supabase.from('prescriptions').select('id, appointment_id, content, created_at').eq('patient_id', id).order('created_at'),
      supabase.from('lab_orders').select('id, appointment_id, tests, status, results, created_at, completed_at').eq('patient_id', id).order('created_at'),
    ])

    if (patientError || !patient) return res.status(404).json({ error: 'Pasiyent tapılmadı.' })

    // Reseptləri və laboratoriya nəticələrini müvafiq qəbula qruplaşdırırıq
    const visits = (appointments || []).map((a) => ({
      ...a,
      prescriptions: (prescriptions || []).filter((p) => p.appointment_id === a.id),
      lab_orders: (labOrders || []).filter((l) => l.appointment_id === a.id),
    }))

    return res.status(200).json({ patient, visits })
  }

  if (req.method === 'DELETE') {
    const session = requireRole(req, res, ['director'])
    if (!session) return

    const { error } = await supabase.from('patients').delete().eq('id', id)
    if (error) {
      if (error.code === '23503') {
        return res.status(409).json({
          error: 'Bu pasiyentin qəbul/resept tarixçəsi olduğu üçün silinə bilmir.',
        })
      }
      return res.status(500).json({ error: 'Server xətası.' })
    }
    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Metod dəstəklənmir.' })
}
