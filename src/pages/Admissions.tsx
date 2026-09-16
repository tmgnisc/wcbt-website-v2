import React, { useState } from 'react';
import { Card, Button } from "antd";
import { Plus, Trash2, Edit, ArrowRight } from 'lucide-react';
import Modal from '../components/Modal';

interface Admission {
  id: number;
  name: string;
  program: string;
  status: string;
  date: string;
}

interface AdmissionsProps {
  admissions: Admission[];
  setAdmissions: React.Dispatch<React.SetStateAction<Admission[]>>;
}

export default function Admissions({ admissions, setAdmissions }: AdmissionsProps) {
  const [filterTerm, setFilterTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdmissionId, setEditingAdmissionId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', program: '', status: 'Applied', date: '' });

  const deleteAdmission = (id: number) => setAdmissions(prev => prev.filter(a => a.id !== id));

  const handleOpenAdd = () => {
    setEditingAdmissionId(null);
    setFormData({ name: '', program: '', status: 'Applied', date: '' });
    setShowAddForm(true);
  };

  const handleOpenEdit = (id: number) => {
    const admission = admissions.find(a => a.id === id);
    if (admission) {
      setFormData({ name: admission.name, program: admission.program, status: admission.status, date: admission.date });
      setEditingAdmissionId(id);
      setShowAddForm(true);
    }
  };

  const saveAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.program.trim() || !formData.date) return;
    const newAdmission: Admission = {
      id: editingAdmissionId ? editingAdmissionId : Date.now(),
      name: formData.name.trim(),
      program: formData.program.trim(),
      status: formData.status,
      date: formData.date,
    };
    if (editingAdmissionId) {
      setAdmissions(prev => prev.map(a => a.id === editingAdmissionId ? newAdmission : a));
    } else {
      setAdmissions(prev => [...prev, newAdmission]);
    }
    setShowAddForm(false);
    setEditingAdmissionId(null);
    setFormData({ name: '', program: '', status: 'Applied', date: '' });
  };

  const nextPipeline = () => {
    setAdmissions(prev => prev.map(a => {
      if (a.status === 'Applied') return { ...a, status: 'Under Review' };
      if (a.status === 'Under Review') return { ...a, status: 'Interview' };
      if (a.status === 'Interview') return { ...a, status: 'Decision' };
      return a;
    }));
  };

  return (
    <Card title="Admissions Pipeline" className="shadow-md">
      <Modal isOpen={showAddForm} onClose={() => { setShowAddForm(false); setEditingAdmissionId(null); setFormData({ name: '', program: '', status: 'Applied', date: '' }); }}
        title={editingAdmissionId ? 'Edit Admission' : 'Add New Admission'}
        footer={
          <div className="form-actions">
            <button onClick={() => { setShowAddForm(false); setEditingAdmissionId(null); setFormData({ name: '', program: '', status: 'Applied', date: '' }); }} className="btn-outline">Cancel</button>
            <button onClick={saveAdmission} className="btn-primary">{editingAdmissionId ? 'Update' : 'Add Admission'}</button>
          </div>
        }>
        <form onSubmit={saveAdmission} className="space-y-4">
          <div className="form-group"><label className="form-label">Applicant Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="form-input" /></div>
          <div className="form-group"><label className="form-label">Program</label>
            <input type="text" value={formData.program} onChange={e => setFormData({ ...formData, program: e.target.value })} required className="form-input" /></div>
          <div className="form-group"><label className="form-label">Status</label>
            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} required className="form-select">
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Interview">Interview</option>
              <option value="Decision">Decision</option>
            </select></div>
          <div className="form-group"><label className="form-label">Date</label>
            <input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required className="form-input" /></div>
        </form>
      </Modal>

      <div className="flex gap-3 mb-4">
        <button onClick={handleOpenAdd} className="btn-primary"><Plus size={18} /> Add Admission</button>
        <button onClick={nextPipeline} className="btn-outline"><ArrowRight size={18} /> Advance Pipeline</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <input type="text" placeholder="Search by name or program..." value={filterTerm} onChange={e => setFilterTerm(e.target.value)} className="search-input" />
        </div>
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="form-select">
            <option value="all">All Status</option>
            <option value="Applied">Applied</option>
            <option value="Under Review">Under Review</option>
            <option value="Interview">Interview</option>
            <option value="Decision">Decision</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4" aria-label="Admission pipeline">
        {[
          { num: 1, label: 'Applied', desc: 'Form submitted', active: true },
          { num: 2, label: 'Under Review', desc: 'Being evaluated', active: true },
          { num: 3, label: 'Interview', desc: 'Scheduled / Completed', active: false },
          { num: 4, label: 'Decision', desc: 'Accepted / Rejected', active: false },
        ].map(step => (
          <div key={step.num} className={`pipeline-step ${step.active ? 'pipeline-step--active' : ''}`}>
            <div className="step-num">{step.num}</div>
            <div className="step-label">{step.label}</div>
            <div className="step-desc">{step.desc}</div>
          </div>
        ))}
      </div>

      <div className="table-wrapper">
        <table className="data-table" aria-label="Admissions">
          <thead>
            <tr><th>Applicant</th><th>Program</th><th>Status</th><th>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {admissions.filter(a => {
              if (filterStatus !== 'all' && a.status !== filterStatus) return false;
              if (filterTerm && !a.name.toLowerCase().includes(filterTerm.toLowerCase()) && !a.program.toLowerCase().includes(filterTerm.toLowerCase())) return false;
              return true;
            }).map(a => (
              <tr key={a.id}>
                <td><strong>{a.name}</strong></td>
                <td>{a.program}</td>
                <td><span className={`badge ${a.status === 'Interview' ? 'badge--success' : 'badge--primary'}`}>{a.status}</span></td>
                <td>{a.date}</td>
                <td>
                  <div className="action-group">
                    <button onClick={() => handleOpenEdit(a.id)} className="action-btn"><Edit size={14} /></button>
                    <button onClick={() => deleteAdmission(a.id)} className="action-btn action-btn--danger"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
