import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getById, save } from '../../data/store'

export default function StaffDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [item, setItem] = useState(null)
  useEffect(() => { const f = getById('staff', id); if(f) setItem(f) }, [id])
  if (!item) return <div className="p-4 text-center text-muted">Not found</div>

  return (
    <div className="min-vh-100 p-4 bg-page" style={{ backgroundColor: '#F8F9FA', fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-4xl mx-auto">
        {/* Top Navigation & Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <button
            onClick={() => navigate('/staff')}
            className="btn btn-link text-decoration-none p-0 text-secondary"
            style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <i className="ph ph-arrow-left"></i> Back to Staff List
          </button>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-outline-secondary px-3">Export PDF</button>
            <button className="btn btn-sm" style={{ backgroundColor: '#8B1A2B', color: '#fff', border: 'none' }}>Edit Profile</button>
          </div>
        </div>

        {/* Profile Hero Section */}
        <div className="card border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #8B1A2B 0%, #5A101D 100%)', height: '120px' }}></div>
          <div className="card-body px-4 pb-4" style={{ marginTop: '-60px' }}>
            <div className="d-flex align-items-end justify-content-between">
              <div className="d-flex align-items-end gap-4">
                <div
                  className="bg-white shadow-sm d-flex align-items-center justify-content-center"
                  style={{ width: '110px', height: '110px', borderRadius: '24px', border: '6px solid #fff', fontSize: '40px', fontWeight: 'bold', color: '#8B1A2B' }}
                >
                  {item.name.charAt(0)}
                </div>
                <div className="mb-2">
                  <h1 className="fw-bold mb-1" style={{ fontSize: '28px', color: '#1A1A1A', letterSpacing: '-0.02em' }}>
                    {item.name}
                  </h1>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-secondary font-medium" style={{ fontSize: 15 }}>{item.designation}</span>
                    <span className="text-muted" style={{ fontSize: 14 }}>•</span>
                    <span className="badge rounded-pill px-3 py-1" style={{
                      backgroundColor: item.status === 'Active' ? '#DCFCE7' : '#F3F4F6',
                      color: item.status === 'Active' ? '#166534' : '#4B5563',
                      fontSize: '12px', fontWeight: '600'
                    }}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Main Information */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px' }}>
              <h5 className="fw-bold mb-4" style={{ color: '#1A1A1A', fontSize: '18px' }}>Professional Details</h5>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="text-muted small fw-medium text-uppercase mb-1 d-block" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Department</label>
                  <div className="fw-semibold text-dark" style={{ fontSize: 15 }}>{item.department}</div>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small fw-medium text-uppercase mb-1 d-block" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Staff ID</label>
                  <div className="fw-semibold text-dark" style={{ fontSize: 15 }}>{item.staffId}</div>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small fw-medium text-uppercase mb-1 d-block" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Email Address</label>
                  <div className="fw-semibold text-dark" style={{ fontSize: 15 }}>{item.email}</div>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small fw-medium text-uppercase mb-1 d-block" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Phone Number</label>
                  <div className="fw-semibold text-dark" style={{ fontSize: 15 }}>{item.phone}</div>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small fw-medium text-uppercase mb-1 d-block" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Joining Date</label>
                  <div className="fw-semibold text-dark" style={{ fontSize: 15 }}>{item.joiningDate}</div>
                </div>
                <div className="col-md-6">
                  <label className="text-muted small fw-medium text-uppercase mb-1 d-block" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Employment Type</label>
                  <div className="fw-semibold text-dark" style={{ fontSize: 15 }}>{item.employmentType || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Information */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '20px' }}>
              <h5 className="fw-bold mb-4" style={{ color: '#1A1A1A', fontSize: '18px' }}>Personal Details</h5>

              <div className="d-flex flex-column gap-4">
                <div>
                  <label className="text-muted small fw-medium text-uppercase mb-1 d-block" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Reporting To</label>
                  <div className="fw-semibold text-dark" style={{ fontSize: 15 }}>{item.reportingManager || '—'}</div>
                </div>
                <div>
                  <label className="text-muted small fw-medium text-uppercase mb-1 d-block" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Salary</label>
                  <div className="fw-bold text-dark" style={{ fontSize: 16, color: '#8B1A2B' }}>
                    {item.salary ? `NPR ${item.salary.toLocaleString()}` : '—'}
                  </div>
                </div>
                <div>
                  <label className="text-muted small fw-medium text-uppercase mb-1 d-block" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Gender / DOB</label>
                  <div className="fw-semibold text-dark" style={{ fontSize: 15 }}>{item.gender || '—'}, {item.dob || '—'}</div>
                </div>
                <div>
                  <label className="text-muted small fw-medium text-uppercase mb-1 d-block" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Blood Group</label>
                  <div className="fw-semibold text-dark" style={{ fontSize: 15 }}>{item.bloodGroup || '—'}</div>
                </div>
                <div>
                  <label className="text-muted small fw-medium text-uppercase mb-1 d-block" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Address</label>
                  <div className="text-dark" style={{ fontSize: 14, lineHeight: '1.4' }}>{item.address || '—'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}