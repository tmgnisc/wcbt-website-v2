import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(0) // 0=email, 1=otp, 2=done
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['','','','','',''])

  const handleOtpInput = (i, val) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otp]; next[i] = val; setOtp(next)
    if (val && i < 5) document.getElementById(`otp-${i+1}`)?.focus()
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-4" style={{ background:'#F0EBEC' }}>
      <div className="bg-white rounded-4 shadow-sm p-4 p-lg-5 w-100" style={{ maxWidth:440 }}>
        <div className="text-center mb-4">
          <div className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold mb-3"
               style={{ width:56, height:56, background:'#8B1A2B', color:'#fff', fontSize:22 }}>W</div>
          <h3 className="fw-bold" style={{ color:'#8B1A2B' }}>
            {step===0?'Reset Password': step===1?'Enter OTP':'Password Reset!'}
          </h3>
          <p className="text-secondary mt-1" style={{ fontSize:13 }}>
            {step===0? "Enter your email to receive a reset code" : step===1? "Enter the 6-digit code sent to your email" : "Your password has been reset successfully."}
          </p>
        </div>

        {step===0 && (
          <form onSubmit={e=>{ e.preventDefault(); if(email) setStep(1) }}>
            <div className="mb-3">
              <label className="form-label" style={{ fontSize:12.5 }}>Email Address</label>
              <input type="email" className="form-control" placeholder="you@wcbt.edu.np"
                     value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn w-100 text-white fw-semibold py-2"
                    style={{ background:'#8B1A2B', borderRadius:8, fontSize:14 }}>Send Reset Code</button>
          </form>
        )}

        {step===1 && (
          <form onSubmit={e=>{ e.preventDefault(); if(otp.every(d=>d)) setStep(2) }}>
            <div className="d-flex justify-content-center gap-2 mb-4">
              {otp.map((d,i) => (
                <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={d}
                       onChange={e=>handleOtpInput(i, e.target.value)}
                       className="form-control text-center fw-bold" style={{ width:46, height:52, fontSize:20, borderRadius:10 }} />
              ))}
            </div>
            <button type="submit" className="btn w-100 text-white fw-semibold py-2 mb-2"
                    style={{ background:'#8B1A2B', borderRadius:8, fontSize:14 }}>Verify Code</button>
            <p className="text-center" style={{ fontSize:12 }}>
              <button type="button" onClick={()=>setStep(0)} className="btn btn-link p-0 fw-semibold" style={{ color:'#8B1A2B', fontSize:12 }}>
                ← Back to email
              </button>
            </p>
          </form>
        )}

        {step===2 && (
          <div className="text-center">
            <div className="mb-3" style={{ fontSize:48 }}>✅</div>
            <p className="text-secondary mb-3" style={{ fontSize:13 }}>A new password has been sent to <strong>{email}</strong></p>
            <Link to="/login" className="btn text-white fw-semibold px-4"
                  style={{ background:'#8B1A2B', borderRadius:8, fontSize:14 }}>Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  )
}
