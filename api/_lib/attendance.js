// Giriş/çıxışı avtomatik təyin edir: bugün heç bir qeyd yoxdursa "giriş",
// giriş var amma çıxış yoxdursa "çıxış" kimi qeydə alır.
export async function recordAttendance(supabase, employeeId, source = 'self') {
  const now = new Date()
  const workDate = now.toISOString().slice(0, 10)
  const dayOfWeek = now.getDay()

  const { data: existing } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('work_date', workDate)
    .maybeSingle()

  if (existing?.check_in_at && existing?.check_out_at) {
    return { action: 'already_done', record: existing }
  }

  if (!existing || !existing.check_in_at) {
    // GİRİŞ - qrafikə görə gecikməni hesabla
    const { data: schedule } = await supabase
      .from('work_schedules')
      .select('start_time')
      .eq('employee_id', employeeId)
      .eq('day_of_week', dayOfWeek)
      .maybeSingle()

    let lateMinutes = 0
    if (schedule?.start_time) {
      const [h, m] = schedule.start_time.split(':').map(Number)
      const scheduledStart = new Date(now)
      scheduledStart.setHours(h, m, 0, 0)
      lateMinutes = Math.max(0, Math.round((now - scheduledStart) / 60000))
    }

    const { data, error } = await supabase
      .from('attendance')
      .upsert(
        { employee_id: employeeId, work_date: workDate, check_in_at: now.toISOString(), late_minutes: lateMinutes, source },
        { onConflict: 'employee_id,work_date' }
      )
      .select()
      .single()

    if (error) throw error
    return { action: 'checked_in', record: data }
  }

  // ÇIXIŞ
  const { data, error } = await supabase
    .from('attendance')
    .update({ check_out_at: now.toISOString() })
    .eq('id', existing.id)
    .select()
    .single()

  if (error) throw error
  return { action: 'checked_out', record: data }
}
