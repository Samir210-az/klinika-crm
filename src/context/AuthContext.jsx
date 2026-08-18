import { createContext, useContext, useState, useCallback } from 'react'
import { apiRequest, setToken, clearToken, getToken } from '../lib/api'

const AuthContext = createContext(null)

const EMPLOYEE_KEY = 'klinika_employee'

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(() => {
    const raw = localStorage.getItem(EMPLOYEE_KEY)
    return raw ? JSON.parse(raw) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (phone, pin) => {
    setLoading(true)
    setError(null)
    try {
      const data = await apiRequest('/auth/login', { method: 'POST', body: { phone, pin } })
      setToken(data.token)
      localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(data.employee))
      setEmployee(data.employee)
      return data.employee
    } catch (e) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    localStorage.removeItem(EMPLOYEE_KEY)
    setEmployee(null)
  }, [])

  return (
    <AuthContext.Provider value={{ employee, login, logout, loading, error, isAuthed: !!getToken() && !!employee }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth AuthProvider daxilində istifadə olunmalıdır.')
  return ctx
}
