import jwt from 'jsonwebtoken'

const SESSION_TTL = '12h'

function getSecret() {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET tənzimlənməyib.')
  return secret
}

export function signSession(employee) {
  return jwt.sign(
    {
      id: employee.id,
      role: employee.role,
      full_name: employee.full_name,
    },
    getSecret(),
    { expiresIn: SESSION_TTL }
  )
}

// req-dən Authorization: Bearer <token> oxuyub doğrulayır. Doğrudursa payload qaytarır, deyilsə null.
export function getSession(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  try {
    return jwt.verify(token, getSecret())
  } catch {
    return null
  }
}

// Endpoint-lərdə icazə yoxlaması üçün köməkçi. allowedRoles boşdursa - istənilən giriş edilmiş istifadəçi.
export function requireRole(req, res, allowedRoles = []) {
  const session = getSession(req)
  if (!session) {
    res.status(401).json({ error: 'Giriş tələb olunur.' })
    return null
  }
  if (allowedRoles.length && !allowedRoles.includes(session.role)) {
    res.status(403).json({ error: 'Bu əməliyyat üçün icazəniz yoxdur.' })
    return null
  }
  return session
}
