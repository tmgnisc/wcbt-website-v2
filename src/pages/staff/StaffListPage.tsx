import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAll, save, remove } from '../../data/store'

export default function StaffListPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  useEffect(() => { setItems(getAll('staff')) }, [])
  const filtered = items.filter(i => (filterDept==='All'||i.department===filterDept) && (filterStatus==='All'||i.status===filterStatus) && (i.name+i.staffId+i.email).toLowerCase().includes(search.toLowerCase()))

  const handleDelete = id => { if(window.confirm('Are you sure?')){ remove('staff',id); setItems(getAll('staff')) } }
  return (
    <div>
      <div className="d-flex align-items-end justify-content-between mb-4" style={{ borderBottom:'2px solid #F0EBEC', paddingBottom:'1rem' }}>
        <div><h1 className="fw-bold mb-0" style={{ color:'#8B1A2B', fontSize:22, textTransform:'uppercase', letterSpacing:'-.02em' }}>Staff</h1><p className="mb-0" style={{ color:'#6B7280', fontSize:13 }}>Manage staff records</p></div>
        <Link to="/staff/add" className="btn text-white fw-semibold py-2 px-3" style={{ background:'#8B1A2B', borderRadius:8, fontSize:12, textDecoration:'none' }}>+ Add Staff</Link>
      </div>
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input className="form-control" style={{ maxWidth:220, fontSize:13 }} placeholder="Search staff..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="form-select" style={{ maxWidth:140, fontSize:13 }} value={filterDept} onChange={e=>setFilterDept(e.target.value)}><option>All Depts</option>{['BIT','B.Tech Ed IT','Administration','Library','Accounts'].map(d=> <option key={d}>{d}</option>)}</select>
        <select className="form-select" style={{ maxWidth:140, fontSize:13 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option>All Status</option>{['Active','Inactive','On Leave'].map(s=> <option key={s}>{s}</option>)}</select>
      </div>
      <div className="table-responsive bg-white rounded-3 shadow-sm" style={{ border:'1px solid #F0EBEC' }}>
        <table className="table mb-0" style={{ fontSize:13 }}>
          <thead><tr><th>Name</th><th>Staff ID</th><th>Department</th><th>Designation</th><th>Contact</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id}>
                <td className="fw-semibold">{i.name}</td><td>{i.staffId}</td><td>{i.department}</td><td>{i.designation}</td><td>{i.phone}</td><td>{i.email}</td>
                <td><span className={`badge ${i.status==='Active'?'bg-success':i.status==='Inactive'?'bg-secondary':'bg-warning'}`} style={{ fontSize:10 }}>{i.status}</span></td>
                <td>
                  <Link to={`/staff/${i.id}`} className="btn btn-sm btn-link text-decoration-none" style={{ color:'#8B1A2B', fontWeight:600 }}>View</Link>
                  <Link to={`/staff/edit/${i.id}`} className="btn btn-sm btn-link text-decoration-none" style={{ color:'#3B82F6', fontWeight:600 }}>Edit</Link>
                  <button onClick={()=>handleDelete(i.id)} className="btn btn-sm btn-link text-decoration-none" style={{ color:'#EF4444', fontWeight:600 }}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={8} className="text-center text-secondary">No staff found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
