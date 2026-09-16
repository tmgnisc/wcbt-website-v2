import { useState } from 'react'
import { getAll, save } from '../../data/store'

export default function SettingsPage() {
  const [tab, setTab] = useState('general')
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wcbt-settings')) || {} } catch { return {} }
  })
  const update = (patch) => { const next={...settings,...patch}; setSettings(next); localStorage.setItem('wcbt-settings', JSON.stringify(next)) }

  const TABS = [
    { id:'general', label:'General', icon:'ph-building' },
    { id:'programs', label:'Programs & Depts', icon:'ph-books' },
    { id:'users', label:'Users & Roles', icon:'ph-users' },
    { id:'notifications', label:'Notification Settings', icon:'ph-bell' },
    { id:'security', label:'Security', icon:'ph-shield' },
  ]

  return (
    <div>
      <div className="mb-4" style={{ borderBottom:'2px solid #F0EBEC', paddingBottom:'1rem' }}>
        <h1 className="fw-bold mb-0" style={{ color:'#8B1A2B', fontSize:22, textTransform:'uppercase', letterSpacing:'-.02em' }}>Settings</h1>
        <p className="mb-0" style={{ color:'#6B7280', fontSize:13 }}>Manage college configuration</p>
      </div>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
                  className={`btn btn-sm fw-semibold d-flex align-items-center gap-1 ${tab===t.id?'text-white':''}`}
                  style={{ background: tab===t.id?'#8B1A2B':'#F5F5F5', color: tab===t.id?'#fff':'#1E1E1E', borderRadius:8, fontSize:12.5, border:'1px solid #E5E0E1' }}>
            <i className={`ph ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      <div className="card p-4" style={{ maxWidth:700 }}>
        {tab==='general' && <General settings={settings} update={update} />}
        {tab==='programs' && <Programs />}
        {tab==='users' && <Users />}
        {tab==='notifications' && <NotificationSettings settings={settings} update={update} />}
        {tab==='security' && <Security settings={settings} update={update} />}
      </div>
    </div>
  )
}

function General({ settings, update }) {
  const [form, setForm] = useState({
    collegeName: settings.collegeName || 'WhiteHouse College of Business & Technology',
    campus: settings.campus || 'Birtamod Campus',
    tagline: settings.tagline || 'Learn. Innovate. Lead.',
    address: settings.address || 'Birtamod, Jhapa, Nepal',
    email: settings.email || 'info@wcbt.edu.np',
    phone: settings.phone || '+977-23-540001',
    session: settings.session || '2025/26',
  })
  const saveForm = () => update(form)
  return (
    <>
      <h6 className="fw-bold mb-3" style={{ color:'#8B1A2B' }}>General Settings</h6>
      {[ ['College Name','collegeName'],['Campus Name','campus'],['Tagline','tagline'],['Address','address'],['Contact Email','email','email'],['Phone','phone'],['Academic Session','session']].map(([label,key,type]) => (
        <div className="mb-3" key={key}>
          <label className="form-label">{label}</label>
          <input type={type||'text'} className="form-control" value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} />
        </div>
      ))}
      <button onClick={saveForm} className="btn text-white fw-semibold" style={{ background:'#8B1A2B', borderRadius:8, fontSize:13 }}>Save Settings</button>
    </>
  )
}

function Programs() {
  const programs = [
    { id:'p1', name:'Bachelor of Information Technology (BIT)', code:'BIT', duration:'4 Years' },
    { id:'p2', name:'B.Tech Ed IT', code:'BTECH-IT', duration:'4 Years' },
  ]
  const depts = ['BIT','B.Tech Ed IT','Administration','Library','Accounts']
  return (
    <>
      <h6 className="fw-bold mb-3" style={{ color:'#8B1A2B' }}>Programs & Departments</h6>
      <p className="fw-semibold mb-1" style={{ fontSize:13 }}>Programs</p>
      <table className="table table-sm mb-3" style={{ fontSize:12 }}><thead><tr><th>Code</th><th>Name</th><th>Duration</th></tr></thead>
        <tbody>{programs.map(p=> <tr key={p.id}><td className="fw-bold">{p.code}</td><td>{p.name}</td><td>{p.duration}</td></tr>)}</tbody>
      </table>
      <p className="fw-semibold mb-1" style={{ fontSize:13 }}>Departments</p>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {depts.map(d => <span key={d} className="badge" style={{ background:'#8B1A2B', color:'#fff', fontSize:11, padding:'5px 10px' }}>{d}</span>)}
      </div>
    </>
  )
}

function Users() {
  const users = [
    { id:'u1', name:'Admin User', email:'admin@wcbt.edu.np', role:'Super Admin', status:'Active' },
    { id:'u2', name:'Staff Member', email:'staff@wcbt.edu.np', role:'Staff', status:'Active' },
  ]
  return (
    <>
      <h6 className="fw-bold mb-3" style={{ color:'#8B1A2B' }}>Users & Role Management</h6>
      <table className="table table-sm" style={{ fontSize:12 }}><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
        <tbody>{users.map(u=> <tr key={u.id}><td className="fw-semibold">{u.name}</td><td>{u.email}</td><td><span className="badge bg-secondary">{u.role}</span></td><td><span className="badge bg-success">{u.status}</span></td></tr>)}</tbody>
      </table>
      <p className="text-secondary mt-2" style={{ fontSize:12 }}>Role-based permissions: View, Add, Edit, Delete per module.</p>
    </>
  )
}

function NotificationSettings({ settings, update }) {
  const [form, setForm] = useState({ emailAlerts: settings.emailAlerts ?? true, smsAlerts: settings.smsAlerts ?? false, defaultExpiry: settings.defaultExpiry || 30 })
  const saveForm = () => update(form)
  return (
    <>
      <h6 className="fw-bold mb-3" style={{ color:'#8B1A2B' }}>Notification Settings</h6>
      <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" checked={form.emailAlerts} onChange={e=>setForm({...form,emailAlerts:e.target.checked})} /><label className="form-check-label" style={{ fontSize:13 }}>Enable Email Alerts</label></div>
      <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" checked={form.smsAlerts} onChange={e=>setForm({...form,smsAlerts:e.target.checked})} /><label className="form-check-label" style={{ fontSize:13 }}>Enable SMS Alerts</label></div>
      <div className="mb-3"><label className="form-label" style={{ fontSize:12.5 }}>Default Expiry Days</label><input type="number" className="form-control" style={{ maxWidth:120 }} value={form.defaultExpiry} onChange={e=>setForm({...form,defaultExpiry:+e.target.value})} /></div>
      <button onClick={saveForm} className="btn text-white fw-semibold" style={{ background:'#8B1A2B', borderRadius:8, fontSize:13 }}>Save</button>
    </>
  )
}

function Security({ settings, update }) {
  return (
    <>
      <h6 className="fw-bold mb-3" style={{ color:'#8B1A2B' }}>Security</h6>
      <p className="mb-2" style={{ fontSize:13 }}><strong>Password Policy:</strong> Minimum 8 characters, at least one special character.</p>
      <p className="mb-2" style={{ fontSize:13 }}><strong>Session Timeout:</strong> 30 minutes</p>
      <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" disabled /><label className="form-check-label text-secondary" style={{ fontSize:13 }}>Two-Factor Authentication (coming soon)</label></div>
    </>
  )
}
