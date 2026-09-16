import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAll, save, remove } from '../../data/store'

export default function AdmissionListPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [filterProgram, setFilterProgram] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => { setItems(getAll('admissions')) }, [])

  const filtered = items.filter(i => {
    const ms = (i.name+i.applicationId).toLowerCase().includes(search.toLowerCase())
    const mp = filterProgram==='All' || i.program===filterProgram
    const mst = filterStatus==='All' || i.applicationStatus===filterStatus
    return ms && mp && mst
  })

  const handleDelete = id => { if(window.confirm('Delete this application?')){ remove('admissions',id); setItems(getAll('admissions')) } }

  const statusColor = s => ({ Applied:'bg-info', 'Pending Review':'bg-warning', Shortlisted:'bg-primary', 'Test Scheduled':'bg-purple', Selected:'bg-success', Rejected:'bg-danger', Enrolled:'bg-success' }[s]||'bg-secondary')

  const changeStatus = (id, newStatus) => {
    const item = items.find(i=>i.id===id)
    if(!item) return
    save('admissions',{ ...item, applicationStatus:newStatus })
    setItems(getAll('admissions'))
  }

  return (
    <div>
      <div className="d-flex align-items-end justify-content-between mb-4" style={{ borderBottom:'2px solid #F0EBEC', paddingBottom:'1rem' }}>
        <div><h1 className="fw-bold mb-0" style={{ color:'#8B1A2B', fontSize:22, textTransform:'uppercase', letterSpacing:'-.02em' }}>Admissions</h1><p className="mb-0" style={{ color:'#6B7280', fontSize:13 }}>Application pipeline</p></div>
        <Link to="/admissions/add" className="btn text-white fw-semibold py-2 px-3" style={{ background:'#8B1A2B', borderRadius:8, fontSize:12, textDecoration:'none' }}>+ New Application</Link>
      </div>
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input className="form-control" style={{ maxWidth:220, fontSize:13 }} placeholder="Search applications..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="form-select" style={{ maxWidth:140, fontSize:13 }} value={filterProgram} onChange={e=>setFilterProgram(e.target.value)}><option>All Programs</option>{['BIT','B.Tech Ed IT'].map(p=> <option key={p}>{p}</option>)}</select>
        <select className="form-select" style={{ maxWidth:140, fontSize:13 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option>All Status</option>{['Applied','Pending Review','Shortlisted','Test Scheduled','Selected','Rejected','Enrolled'].map(s=> <option key={s}>{s}</option>)}</select>
      </div>
      <div className="table-responsive bg-white rounded-3 shadow-sm" style={{ border:'1px solid #F0EBEC' }}>
        <table className="table mb-0" style={{ fontSize:13 }}>
          <thead><tr><th>App ID</th><th>Name</th><th>Program</th><th>Applied</th><th>Test</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id}>
                <td className="fw-semibold" style={{ fontFamily:'monospace' }}>{i.applicationId}</td>
                <td className="fw-semibold">{i.name}</td>
                <td>{i.program}</td>
                <td style={{ fontSize:12 }}>{i.appliedDate}</td>
                <td><span className={`badge ${i.testStatus==='Completed'?'bg-success':'bg-secondary'}`} style={{ fontSize:10 }}>{i.testStatus}</span></td>
                <td>
                  <select className="form-select form-select-sm" style={{ width:'auto', fontSize:11, padding:'2px 24px 2px 6px' }}
                          value={i.applicationStatus} onChange={e=>changeStatus(i.id,e.target.value)}>
                    {['Applied','Pending Review','Shortlisted','Test Scheduled','Selected','Rejected','Enrolled'].map(s=> <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <button onClick={()=>navigate(`/admissions/view/${i.id}`)} className="btn btn-sm btn-link text-decoration-none" style={{ color:'#8B1A2B', fontWeight:600 }}>View</button>
                  <button onClick={()=>navigate(`/admissions/edit/${i.id}`)} className="btn btn-sm btn-link text-decoration-none" style={{ color:'#3B82F6', fontWeight:600 }}>Edit</button>
                  <button onClick={()=>handleDelete(i.id)} className="btn btn-sm btn-link text-decoration-none" style={{ color:'#EF4444', fontWeight:600 }}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={7} className="text-center text-secondary">No applications found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
