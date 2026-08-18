import { getSupabaseAdmin } from '../_lib/supabaseAdmin.js'
import { requireRole } from '../_lib/auth.js'

export default async function handler(req, res) {
  const session = requireRole(req, res, ['hr', 'director'])
  if (!session) return

  const supabase = getSupabaseAdmin()
  const month = req.query.month || new Date().toISOString().slice(0, 7) // YYYY-MM
  const [year, mon] = month.split('-').map(Number)
  const monthStart = new Date(year, mon - 1, 1)
  const monthEnd = new Date(year, mon, 0) // ayın son günü
  const today = new Date()
  const effectiveEnd = monthEnd > today ? today : monthEnd

  const [{ data: employees }, { data: schedules }, { data: attendance }, { data: leaves }] = await Promise.all([
    supabase.from('employees').select('id, full_name, role').eq('is_active', true),
    supabase.from('work_schedules').select('employee_id, day_of_week, start_time'),
    supabase
      .from('attendance')
      .select('employee_id, work_date, check_in_at, check_out_at, late_minutes')
      .gte('work_date', monthStart.toISOString().slice(0, 10))
      .lte('work_date', monthEnd.toISOString().slice(0, 10)),
    supabase
      .from('leave_requests')
      .select('employee_id, start_date, end_date')
      .eq('status', 'approved')
      .lte('start_date', monthEnd.toISOString().slice(0, 10))
      .gte('end_date', monthStart.toISOString().slice(0, 10)),
  ])

  const report = (employees || []).map((emp) => {
    const empSchedule = new Set((schedules || []).filter((s) => s.employee_id === emp.id).map((s) => s.day_of_week))
    const empAttendance = (attendance || []).filter((a) => a.employee_id === emp.id)
    const attendanceByDate = new Map(empAttendance.map((a) => [a.work_date, a]))
    const empLeaves = (leaves || []).filter((l) => l.employee_id === emp.id)

    let scheduledDays = 0
    let presentDays = 0
    let lateDays = 0
    let absentDays = 0
    let onLeaveDays = 0
    let totalLateMinutes = 0

    if (empSchedule.size > 0) {
      for (let d = new Date(monthStart); d <= effectiveEnd; d.setDate(d.getDate() + 1)) {
        if (!empSchedule.has(d.getDay())) continue
        scheduledDays++
        const dateStr = d.toISOString().slice(0, 10)
        const record = attendanceByDate.get(dateStr)
        const onLeave = empLeaves.some((l) => dateStr >= l.start_date && dateStr <= l.end_date)

        if (record?.check_in_at) {
          presentDays++
          if (record.late_minutes > 0) {
            lateDays++
            totalLateMinutes += record.late_minutes
          }
        } else if (onLeave) {
          onLeaveDays++
        } else {
          absentDays++
        }
      }
    }

    return {
      employee_id: emp.id,
      full_name: emp.full_name,
      role: emp.role,
      has_schedule: empSchedule.size > 0,
      scheduled_days: scheduledDays,
      present_days: presentDays,
      late_days: lateDays,
      absent_days: absentDays,
      on_leave_days: onLeaveDays,
      total_late_minutes: totalLateMinutes,
    }
  })

  return res.status(200).json({ month, report })
}
