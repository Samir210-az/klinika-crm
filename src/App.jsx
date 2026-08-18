import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
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
  if (!Dashboard) return <p className="p-8 text-ink/50">Bu rol üçün panel tənzimlənməyib.</p>
  return (
    <Layout>
      <Dashboard />
    </Layout>
  )
}

function LoginRoute() {
  const { isAuthed } = useAuth()
  if (isAuthed) return <Navigate to="/" replace />
  return <Login />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
