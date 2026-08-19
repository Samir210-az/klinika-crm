import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Kiosk from './pages/Kiosk'
import MyAttendance from './pages/MyAttendance'
import Chat from './pages/Chat'
import ReceptionDashboard from './pages/ReceptionDashboard'
import DoctorDashboard from './pages/DoctorDashboard'
import NurseDashboard from './pages/NurseDashboard'
import AccountantDashboard from './pages/AccountantDashboard'
import AdminDashboard from './pages/AdminDashboard'
import LabDashboard from './pages/LabDashboard'

const DASHBOARDS = {
  reception: ReceptionDashboard,
  doctor: DoctorDashboard,
  nurse: NurseDashboard,
  accountant: AccountantDashboard,
  hr: AdminDashboard,
  director: AdminDashboard,
  laborant: LabDashboard,
}

function Home() {
  const { employee, isAuthed } = useAuth()
  if (!isAuthed) return <Navigate to="/login" replace />
  const Dashboard = DASHBOARDS[employee.role]
  if (!Dashboard) return <p className="p-8 text-ink/65">Bu rol üçün panel tənzimlənməyib.</p>
  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}

function AttendanceRoute() {
  const { isAuthed } = useAuth()
  if (!isAuthed) return <Navigate to="/login" replace />
  return (
    <Layout>
      <MyAttendance />
    </Layout>
  )
}

function ChatRoute() {
  const { isAuthed } = useAuth()
  if (!isAuthed) return <Navigate to="/login" replace />
  return (
    <Layout fullHeight>
      <Chat />
    </Layout>
  )
}

function LoginRoute() {
  const { isAuthed } = useAuth()
  if (isAuthed) return <Navigate to="/" replace />
  return <Login />
}

function ScrollReset() {
  const location = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollReset />
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/attendance" element={<AttendanceRoute />} />
          <Route path="/chat" element={<ChatRoute />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
