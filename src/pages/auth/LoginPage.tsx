import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function LoginPage() {
  const { login, user, error: authError, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { if (user) navigate('/', { replace: true }) }, [user, navigate])

  const validate = () => {
    const e = {}
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email format'
    if (!password) e.password = 'Password is required'
    else if (password.length < 6) e.password = 'Minimum 6 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const v = validate(); setErrors(v)
    if (Object.keys(v).length) return
    setSubmitted(true)
    const ok = await login(email, password)
    setSubmitted(false)
    if (ok) navigate('/', { replace: true })
  }

  return (
    <div className="min-vh-100 d-flex" style={{ background:'#F0EBEC' }}>
      {/* Left brand panel */}
      <div className="d-none d-lg-flex flex-column align-items-center justify-content-center text-white px-5"
           style={{ width:'45%', background:'linear-gradient(160deg, #8B1A2B 0%, #7A1524 100%)' }}>
        <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold mb-4"
             style={{ width:90, height:90, background:'#fff', color:'#8B1A2B', fontSize:36, letterSpacing:'-.04em' }}>W</div>
        <h1 className="fw-bold mb-2" style={{ fontSize:28, letterSpacing:'-.03em' }}>WhiteHouse College</h1>
        <p className="opacity-75 mb-1" style={{ fontSize:15, letterSpacing:'.02em' }}>of Business & Technology</p>
        <p className="opacity-50 mt-2" style={{ fontSize:12, fontStyle:'italic', letterSpacing:'.04em' }}>— Birtamod Campus —</p>
        <p className="mt-4 opacity-80 fw-semibold" style={{ fontSize:13, letterSpacing:'.06em' }}>Learn. Innovate. Lead.</p>
      </div>
      {/* Right form panel */}
      <div className="flex-grow-1 d-flex align-items-center justify-content-center px-4">
        <div className="w-100" style={{ maxWidth:440 }}>
          {/* Mobile logo */}
          <div className="d-flex d-lg-none align-items-center justify-content-center mb-4">
            <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                 style={{ width:64, height:64, background:'#8B1A2B', color:'#fff', fontSize:26 }}>W</div>
          </div>
          <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5">
            <h2 className="fw-bold mb-1" style={{ color:'#8B1A2B', fontSize:22 }}>Sign In</h2>
            <p className="text-secondary mb-4" style={{ fontSize:13.5 }}>Enter your credentials to access the portal</p>

            {authError && <div className="alert alert-danger py-2 px-3" style={{ fontSize:13 }}>{authError}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize:12.5 }}>Email Address</label>
                <input type="email" className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                       placeholder="admin@wcbt.edu.np" value={email} onChange={e=>setEmail(e.target.value)} />
                {errors.email && <div className="invalid-feedback" style={{ fontSize:12 }}>{errors.email}</div>}
              </div>
              <div className="mb-3">
                <label className="form-label" style={{ fontSize:12.5 }}>Password</label>
                <div className="position-relative">
                  <input type={showPw?'text':'password'} className={`form-control pe-5 ${errors.password ? 'is-invalid' : ''}`}
                         placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} />
                  <button type="button" onClick={()=>setShowPw(s=>!s)}
                          className="position-absolute top-50 translate-middle-y border-0 bg-transparent"
                          style={{ right:12, color:'#8B1A2B', cursor:'pointer', fontSize:16 }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && <div className="invalid-feedback d-block" style={{ fontSize:12 }}>{errors.password}</div>}
              </div>

              <button type="submit" disabled={submitted || loading}
                      className="btn w-100 text-white fw-semibold py-2 mb-3"
                      style={{ background:'#8B1A2B', borderRadius:8, fontSize:14, transition:'background .15s' }}>
                {submitted || loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" /> Signing in...</>
                ) : 'Sign In'}
              </button>
            </form>

            <Link to="/forgot-password" className="d-block text-center" style={{ color:'#8B1A2B', fontSize:12.5, fontWeight:600 }}>
              Forgot Password?
            </Link>

            <hr className="my-3" />
            <p className="text-center mb-2" style={{ fontSize:11, color:'#9CA3AF' }}>Quick demo access</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              {[
                { label:'Super Admin', email:'admin@wcbt.edu.np', pw:'admin123' },
                { label:'Staff', email:'staff@wcbt.edu.np', pw:'staff123' },
              ].map(d => (
                <button key={d.label} onClick={()=>{ setEmail(d.email); setPassword(d.pw) }}
                        className="btn btn-sm px-3"
                        style={{ background:'#F5F5F5', color:'#8B1A2B', borderRadius:8, fontSize:12, fontWeight:600, border:'1px solid #E5E0E1' }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-center mt-3" style={{ fontSize:11, color:'#9CA3AF' }}>© 2025 WhiteHouse College of Business & Technology</p>
        </div>
      </div>
    </div>
  )
}
