import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAll } from '../../data/store'

const statStyle = { background:'#fff', borderRadius:12, padding:'1.25rem', boxShadow:'0 1px 4px rgba(0,0,0,.06)', border:'1px solid #F0EBEC' }
const iconWrap = (bg='rgba(139,26,43,.08)', color='#8B1A2B') => ({ width:48, height:48, borderRadius:12, background:bg, color, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:22 })

const STAT_CARDS = [
  { key:'totalStaff', label:'Total Staff', icon:'ph-users-three', sub:'Active staff', calc: d => d.staff.filter(s=>s.status==='Active').length },
  { key:'totalStudents', label:'Total Students', icon:'ph-graduation-cap', sub:'Enrolled', calc: d => 6 },
  { key:'newAdmissions', label:'New Admissions', icon:'ph-document-add', sub:'This month', calc: d => d.admissions.filter(a=>a.appliedDate>='2025-09-01').length },
  { key:'pendingNotif', label:'Pending Notifications', icon:'ph-bell-ringing', sub:'Unpublished drafts', calc: d => d.notifications.filter(n=>n.status==='Draft').length },
  { key:'activeApps', label:'Active Applications', icon:'ph-file-text', sub:'In pipeline', calc: d => d.admissions.filter(a=>!['Enrolled','Rejected'].includes(a.applicationStatus)).length },
]

export default function DashboardPage() {
  const [data, setData] = useState({ notifications:[], staff:[], admissions:[] })
  const navigate = useNavigate()

  useEffect(() => { setData({ notifications:getAll('notifications'), staff:getAll('staff'), admissions:getAll('admissions') }) }, [])

  const months = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov']
  const admissionsByMonth = months.map((m,i) => {
    const monthNum = String(i+4).padStart(2,'0')
    return data.admissions.filter(a=>a.appliedDate?.startsWith(`2025-${monthNum}`)).length
  })
  const deptCounts = {}
  data.staff.forEach(s => { deptCounts[s.department] = (deptCounts[s.department]||0)+1 })
  const depts = Object.keys(deptCounts)
  const deptColors = ['#8B1A2B','#14B8A6','#F59E0B','#3B82F6','#6B7280','#9B1C2E']

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4" style={{ borderBottom:'2px solid #F0EBEC', paddingBottom:'1rem' }}>
        <div><h1 className="fw-bold mb-0" style={{ color:'#8B1A2B', fontSize:24, textTransform:'uppercase', letterSpacing:'-.02em' }}>Dashboard</h1>
              <p className="mb-0" style={{ color:'#6B7280', fontSize:13 }}>Overview of WCBT operations</p></div>
      </div>

      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {STAT_CARDS.map(s => (
          <div key={s.key} className="col-6 col-lg-4 col-xl">
            <div style={statStyle}>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <p className="mb-1 fw-semibold" style={{ color:'#6B7280', fontSize:12 }}>{s.label}</p>
                  <h3 className="fw-bold mb-0" style={{ color:'#1E1E1E', fontSize:28 }}>{s.calc(data)}</h3>
                  <p className="mb-0 mt-1" style={{ color:'#9CA3AF', fontSize:11 }}>{s.sub}</p>
                </div>
                <div style={iconWrap()}>
                  <i className={`ph ${s.icon}`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        {/* Admissions Trend Chart */}
        <div className="col-lg-8">
          <div style={{ background:'#fff', borderRadius:12, padding:'1.25rem', boxShadow:'0 1px 4px rgba(0,0,0,.06)', border:'1px solid #F0EBEC', height:'100%' }}>
            <h6 className="fw-bold mb-3" style={{ color:'#1E1E1E', fontSize:14 }}>Admissions Trend (2025)</h6>
            <div className="d-flex align-items-end gap-1" style={{ height:160 }}>
              {admissionsByMonth.map((val,i) => (
                <div key={i} className="flex-grow-1 d-flex flex-column align-items-center">
                  <div style={{ width:'100%', maxWidth:40, height: Math.max(val*22, 4), background: i===5?'#9B1C2E':'#8B1A2B', borderRadius:'4px 4px 0 0', transition:'height .3s' }} />
                  <span style={{ fontSize:10, color:'#6B7280', marginTop:4 }}>{months[i]}</span>
                  <span style={{ fontSize:10, color:'#8B1A2B', fontWeight:700 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Staff Distribution Donut */}
        <div className="col-lg-4">
          <div style={{ background:'#fff', borderRadius:12, padding:'1.25rem', boxShadow:'0 1px 4px rgba(0,0,0,.06)', border:'1px solid #F0EBEC', height:'100%' }}>
            <h6 className="fw-bold mb-3" style={{ color:'#1E1E1E', fontSize:14 }}>Staff by Department</h6>
            <svg viewBox="0 0 36 36" style={{ width:120, height:120, margin:'0 auto', display:'block' }}>
              {depts.reduce((acc, dept, i) => {
                const val = (deptCounts[dept]/data.staff.length)*100
                const offset = acc.offset
                acc.paths.push(
                  <circle key={i} cx="18" cy="18" r="15.9155" fill="none" stroke={deptColors[i%deptColors.length]}
                          strokeWidth="4" strokeDasharray={`${val} ${100-val}`} strokeDashoffset={`${-offset}`} />
                )
                acc.offset += val
                return acc
              }, {offset:0, paths:[]}).paths}
            </svg>
            <div className="mt-3" style={{ fontSize:11 }}>
              {depts.map((d,i)=>(
                <div key={d} className="d-flex align-items-center gap-2 mb-1">
                  <span style={{ width:10, height:10, borderRadius:'50%', background:deptColors[i%deptColors.length], flexShrink:0 }} />
                  <span className="flex-grow-1">{d}</span><span className="fw-bold">{deptCounts[d]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Activity */}
        <div className="col-lg-7">
          <div style={{ background:'#fff', borderRadius:12, padding:'1.25rem', boxShadow:'0 1px 4px rgba(0,0,0,.06)', border:'1px solid #F0EBEC' }}>
            <h6 className="fw-bold mb-3" style={{ color:'#1E1E1E', fontSize:14 }}>Recent Activity</h6>
            {[
              ...data.notifications.slice(-3).map(n => ({ icon:'ph-bell', color:'#8B1A2B', title:n.title, sub:n.category, date:n.createdAt, status:n.status })),
              ...data.admissions.slice(-3).map(a => ({ icon:'ph-graduation-cap', color:'#14B8A6', title:a.name, sub:a.program, date:a.appliedDate, status:a.applicationStatus })),
              ...data.staff.slice(-2).map(s => ({ icon:'ph-user', color:'#3B82F6', title:s.name, sub:s.department, date:s.joiningDate, status:s.status })),
            ].sort(()=>Math.random()-.5).slice(0,6).map((item,i) => (
              <div key={i} className="d-flex align-items-start gap-3 py-2 border-bottom" style={{ borderColor:'#F5F5F5' }}>
                <div style={{ width:36, height:36, borderRadius:10, background:item.color+'15', color:item.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <i className={`ph ${item.icon}`} />
                </div>
                <div className="flex-grow-1">
                  <p className="mb-0 fw-semibold" style={{ fontSize:13, color:'#1E1E1E' }}>{item.title}</p>
                  <p className="mb-0" style={{ fontSize:11, color:'#6B7280' }}>{item.sub} • {item.date}</p>
                </div>
                <span className={`badge ${item.status==='Published'||item.status==='Selected'||item.status==='Active'?'bg-success':item.status==='Draft'?'bg-secondary':item.status==='Rejected'?'bg-danger':'bg-warning'}`} style={{ fontSize:10, padding:'3px 8px' }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-5">
          <div style={{ background:'#fff', borderRadius:12, padding:'1.25rem', boxShadow:'0 1px 4px rgba(0,0,0,.06)', border:'1px solid #F0EBEC' }}>
            <h6 className="fw-bold mb-3" style={{ color:'#1E1E1E', fontSize:14 }}>Quick Actions</h6>
            {[
              { label:'Add Staff', to:'/staff', icon:'ph-user-plus', desc:'Create a new staff record' },
              { label:'New Notification', to:'/notifications', icon:'ph-bell-plus', desc:'Post a new announcement' },
              { label:'New Admission', to:'/admissions', icon:'ph-file-plus', desc:'Register a new application' },
            ].map(a => (
              <button key={a.to} onClick={()=>navigate(a.to)}
                      className="d-flex align-items-center gap-3 w-100 text-start p-3 mb-2 border-0"
                      style={{ background:'#F5F5F5', borderRadius:10, cursor:'pointer', transition:'background .12s' }}
                      onMouseEnter={e=>e.currentTarget.style.background='#F0EBEC'} onMouseLeave={e=>e.currentTarget.style.background='#F5F5F5'}>
                <div style={{ width:42, height:42, borderRadius:10, background:'#8B1A2B', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:18 }}>
                  <i className={`ph ${a.icon}`} />
                </div>
                <div><p className="mb-0 fw-bold" style={{ fontSize:13.5, color:'#1E1E1E' }}>{a.label}</p><p className="mb-0" style={{ fontSize:11.5, color:'#6B7280' }}>{a.desc}</p></div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
