import React, { useState } from 'react';
import { Card, Table, Button } from "antd";
import { Plus, Trash2, Edit } from 'lucide-react';
import Modal from '../components/Modal';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  email: string;
  dept: string;
}

interface StaffProps {
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
}

export default function Staff({ staff, setStaff }: StaffProps) {
  const [filterTerm, setFilterTerm] = useState('');
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [staffFormData, setStaffFormData] = useState({ name: '', role: '', email: '', dept: '' });

  const deleteStaff = (id: number) => setStaff(prev => prev.filter(s => s.id !== id));

  const handleOpenAdd = () => {
    setEditingStaffId(null);
    setStaffFormData({ name: '', role: '', email: '', dept: '' });
    setShowStaffForm(true);
  };

  const handleOpenEdit = (id: number) => {
    const s = staff.find(x => x.id === id);
    if (s) {
      setStaffFormData({ name: s.name, role: s.role, email: s.email, dept: s.dept });
      setEditingStaffId(id);
      setShowStaffForm(true);
    }
  };

  const saveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFormData.name.trim() || !staffFormData.role.trim() || !staffFormData.email.trim() || !staffFormData.dept.trim()) return;
    const payload: StaffMember = {
      id: editingStaffId ? editingStaffId : Date.now(),
      name: staffFormData.name.trim(),
      role: staffFormData.role.trim(),
      email: staffFormData.email.trim(),
      dept: staffFormData.dept.trim(),
    };
    if (editingStaffId) {
      setStaff(prev => prev.map(s => s.id === editingStaffId ? payload : s));
    } else {
      setStaff(prev => [...prev, payload]);
    }
    setShowStaffForm(false);
    setEditingStaffId(null);
    setStaffFormData({ name: '', role: '', email: '', dept: '' });
  };

  return (
    <Card title="Staff Directory" className="shadow-md">
      <div className="flex gap-3 mb-4">
        <button onClick={handleOpenAdd} className="btn-primary"><Plus size={18} /> Add Staff</button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search staff..."
          value={filterTerm}
          onChange={e => setFilterTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="table-wrapper">
        <table className="data-table" aria-label="Staff">
          <thead>
            <tr><th>Name</th><th>Role</th><th>Email</th><th>Department</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {staff
              .filter(s =>
                s.name.toLowerCase().includes(filterTerm.toLowerCase()) ||
                s.role.toLowerCase().includes(filterTerm.toLowerCase()) ||
                s.email.toLowerCase().includes(filterTerm.toLowerCase()) ||
                s.dept.toLowerCase().includes(filterTerm.toLowerCase())
              )
              .map(s => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.role}</td>
                  <td>{s.email}</td>
                  <td>{s.dept}</td>
                  <td>
                    <button onClick={() => handleOpenEdit(s.id)} className="action-btn"><Edit size={14} /></button>
                    <button onClick={() => deleteStaff(s.id)} className="action-btn action-btn--danger"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showStaffForm} onClose={() => { setShowStaffForm(false); setEditingStaffId(null); setStaffFormData({ name: '', role: '', email: '', dept: '' }); }}
        title={editingStaffId ? 'Edit Staff Member' : 'Add New Staff Member'}
        footer={
          <div className="form-actions">
            <button onClick={() => { setShowStaffForm(false); setEditingStaffId(null); setStaffFormData({ name: '', role: '', email: '', dept: '' }); }} className="btn-outline">Cancel</button>
            <button onClick={saveStaff} className="btn-primary">{editingStaffId ? 'Update Staff' : 'Add Staff Member'}</button>
          </div>
        }>
        <form onSubmit={saveStaff} className="space-y-4">
          <div className="form-group"><label className="form-label">Full Name</label>
            <input type="text" value={staffFormData.name} onChange={e => setStaffFormData({ ...staffFormData, name: e.target.value })} required className="form-input" placeholder="e.g. Dr. Amara Osei" /></div>
          <div className="form-group"><label className="form-label">Role</label>
            <input type="text" value={staffFormData.role} onChange={e => setStaffFormData({ ...staffFormData, role: e.target.value })} required className="form-input" placeholder="e.g. Head of Admissions" /></div>
          <div className="form-group"><label className="form-label">Email Address</label>
            <input type="email" value={staffFormData.email} onChange={e => setStaffFormData({ ...staffFormData, email: e.target.value })} required className="form-input" placeholder="name@wcbt.edu" /></div>
          <div className="form-group"><label className="form-label">Department</label>
            <input type="text" value={staffFormData.dept} onChange={e => setStaffFormData({ ...staffFormData, dept: e.target.value })} required className="form-input" placeholder="e.g. Academics" /></div>
        </form>
      </Modal>
    </Card>
  );
}
