// Bütün API marşrutları BURADAN keçir — Vercel-in serverless funksiya sayı
// limitini (Hobby planda 12) aşmamaq üçün hər endpoint ayrıca fayl/funksiya
// olmaq əvəzinə tək funksiyaya yığılıb. Sub-path vercel.json-dakı rewrite
// qaydası ilə ?path= query parametri kimi ötürülür (fayl-adı əsaslı
// [...catch-all] mexanizmi bu mühitdə etibarlı işləmədiyi üçün).

import authLogin from './_handlers/auth-login.js'
import employees from './_handlers/employees.js'
import employeesId from './_handlers/employees-id.js'
import employeesPublic from './_handlers/employees-public.js'
import me from './_handlers/me.js'
import patients from './_handlers/patients.js'
import patientsId from './_handlers/patients-id.js'
import appointments from './_handlers/appointments.js'
import appointmentsId from './_handlers/appointments-id.js'
import prescriptions from './_handlers/prescriptions.js'
import payments from './_handlers/payments.js'
import statsSummary from './_handlers/stats-summary.js'
import labOrders from './_handlers/lab-orders.js'
import labOrdersId from './_handlers/lab-orders-id.js'
import attendanceToggle from './_handlers/attendance-toggle.js'
import attendanceKiosk from './_handlers/attendance-kiosk.js'
import attendanceMine from './_handlers/attendance-mine.js'
import attendanceReport from './_handlers/attendance-report.js'
import schedules from './_handlers/schedules.js'
import leaveRequests from './_handlers/leave-requests.js'
import leaveRequestsId from './_handlers/leave-requests-id.js'
import messages from './_handlers/messages.js'
import messagesRead from './_handlers/messages-read.js'
import messagesUnread from './_handlers/messages-unread.js'

export default async function handler(req, res) {
  const rawPath = req.query.path
  const pathStr = Array.isArray(rawPath) ? rawPath.join('/') : String(rawPath || '')
  const segments = pathStr.split('/').filter(Boolean)
  const [a, b] = segments

  // Köhnə [id].js fayllarının gözlədiyi req.query.id-ni əl ilə təyin edirik
  const withId = (h) => {
    req.query.id = b
    return h(req, res)
  }

  if (a === 'auth' && b === 'login') return authLogin(req, res)
  if (a === 'me') return me(req, res)

  if (a === 'employees') {
    if (b === 'public') return employeesPublic(req, res)
    if (b) return withId(employeesId)
    return employees(req, res)
  }

  if (a === 'patients') {
    if (b) return withId(patientsId)
    return patients(req, res)
  }

  if (a === 'appointments') {
    if (b) return withId(appointmentsId)
    return appointments(req, res)
  }

  if (a === 'prescriptions') return prescriptions(req, res)
  if (a === 'payments') return payments(req, res)
  if (a === 'stats' && b === 'summary') return statsSummary(req, res)

  if (a === 'lab-orders') {
    if (b) return withId(labOrdersId)
    return labOrders(req, res)
  }

  if (a === 'attendance') {
    if (b === 'toggle') return attendanceToggle(req, res)
    if (b === 'kiosk') return attendanceKiosk(req, res)
    if (b === 'mine') return attendanceMine(req, res)
    if (b === 'report') return attendanceReport(req, res)
  }

  if (a === 'schedules') return schedules(req, res)

  if (a === 'leave-requests') {
    if (b) return withId(leaveRequestsId)
    return leaveRequests(req, res)
  }

  if (a === 'messages') {
    if (b === 'read') return messagesRead(req, res)
    if (b === 'unread') return messagesUnread(req, res)
    return messages(req, res)
  }

  return res.status(404).json({ error: 'Marşrut tapılmadı.' })
}
