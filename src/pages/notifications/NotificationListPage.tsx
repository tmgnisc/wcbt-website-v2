import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAll, save, remove } from '../../data/store'

export default function NotificationListPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  useEffect(() => { setItems(getAll('notifications')) }, [])

  const filtered = items.filter(i => {
    const matchSearch = (i.title + i.category + (i.message||'')).toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'All' || i.category === filterCat
    const matchStatus = filterStatus === 'All' || i.status === filterStatus
    return matchSearch && matchCat && matchStatus
  })

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this notification? This cannot be undone.')) {
      remove('notifications', id)
      setItems(getAll('notifications'))
    }
  }

  const togglePublish = (id, current) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    save('notifications', { ...item, status: current === 'Published' ? 'Draft' : 'Published' })
    setItems(getAll('notifications'))
  }

  return (
    <div>
      <div className="d-flex align-items-end justify-content-between mb-4" style={{ borderBottom:'2px solid #F0EBEC', paddingBottom:'1rem' }}>
        <div>
          <h1 className="fw-bold mb-0" style={{ color:'#8B1A2B', fontSize:22, textTransform:'uppercase', letterSpacing:'-.02em' }}>Notifications</h1>
          <p className="mb-0" style={{ color:'#6B7280', fontSize:13 }}>Announcements and notices</p>
        </div>
        <Link to="/notifications/add" className="btn text-white fw-semibold py-2 px-3" style={{ background:'#8B1A2B', borderRadius:8, fontSize:13, textDecoration:'none' }}>
          + Add Notification
        </Link>
      </div>

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input className="form-control" style={{ maxWidth:240, fontSize:13 }} placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} />
        <select className="form-select" style={{ maxWidth:140, fontSize:13 }} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
          <option>All Categories</option>{['General','Academic','Admission','Urgent'].map(c=> <option key={c}>{c}</option>)}
        </select>
        <select className="form-select" style={{ maxWidth:140, fontSize:13 }} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
          <option>All Statuses</option>{['Draft','Published','Archived'].map(s=> <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="table-responsive bg-white rounded-3 shadow-sm" style={{ border:'1px solid #F0EBEC' }}>
        <table className="table mb-0" style={{ fontSize:13 }}>
          <thead><tr><th>Title</th><th>Category</th><th>Audience</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id}>
                <td className="fw-semibold">{i.title}</td>
                <td><span className="badge bg-secondary" style={{ fontSize:10 }}>{i.category}</span></td>
                <td>{(i.audience||[]).includes('All') ? 'All' : (i.audience||[]).join(', ')}</td>
                <td><span className={`badge ${i.status==='Published'?'bg-success':i.status==='Archived'?'bg-dark':'bg-secondary'}`} style={{ fontSize:10 }}>{i.status}</span></td>
                <td style={{ color:'#9CA3AF', fontSize:12 }}>{i.createdAt}</td>
                <td>
                  <button onClick={()=>navigate(`/notifications/view/${i.id}`)} className="btn btn-sm btn-link text-decoration-none" style={{ color:'#8B1A2B', fontWeight:600 }}>View</button>
                  <button onClick={()=>navigate(`/notifications/edit/${i.id}`)} className="btn btn-sm btn-link text-decoration-none" style={{ color:'#3B82F6', fontWeight:600 }}>Edit</button>
                  <button onClick={()=>togglePublish(i.id,i.status)} className="btn btn-sm btn-link text-decoration-none" style={{ color:'#14B8A6', fontWeight:600 }}>{i.status==='Published'?'Unpublish':'Publish'}</button>
                  <button onClick={()=>handleDelete(i.id)} className="btn btn-sm btn-link text-decoration-none" style={{ color:'#EF4444', fontWeight:600 }}>Delete</button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && <tr><td colSpan={6} className="text-center py-4 text-secondary">No notifications found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
