import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const DEMO_USERS = [
  { id:'u1', email:'admin@wcbt.edu.np', password:'admin123', name:'Admin User', role:'super-admin', initials:'AU' },
  { id:'u2', email:'staff@wcbt.edu.np', password:'staff123', name:'Staff Member', role:'staff', initials:'SM' },
]

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { const s = localStorage.getItem('wcbt-session'); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const login = useCallback(async (email, password) => {
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 800))
    if (attempts >= 3) { setError('Account locked. Try again later.'); setLoading(false); return false }
    const found = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (!found) { setAttempts(a => a + 1); setError('Invalid email or password'); setLoading(false); return false }
    const session = { id: found.id, email: found.email, name: found.name, role: found.role, initials: found.initials }
    localStorage.setItem('wcbt-session', JSON.stringify(session))
    setUser(session); setLoading(false); setAttempts(0); return true
  }, [attempts])

  const logout = () => { localStorage.removeItem('wcbt-session'); setUser(null) }

  return <AuthContext.Provider value={{ user, login, logout, error, loading, attempts }}>{children}</AuthContext.Provider>
}
