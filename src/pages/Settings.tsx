import React, { useState } from 'react';
import { Card, Table, Input } from "antd";
import { Plus, Trash2, Edit, Settings as SettingsIcon } from 'lucide-react';
import SearchInput from '../components/SearchInput';
import Modal from '../components/Modal';

interface Setting {
  id: number;
  key: string;
  value: string;
  category: string;
}

interface SettingsProps {
  settings: Setting[];
  setSettings: React.Dispatch<React.SetStateAction<Setting[]>>;
}

export default function Settings({ settings, setSettings }: SettingsProps) {
  const [filterTerm, setFilterTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [editingSettingId, setEditingSettingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ key: '', value: '', category: 'General' });

  const deleteSetting = (id: number) => setSettings(prev => prev.filter(s => s.id !== id));

  const handleOpenAdd = () => {
    setEditingSettingId(null);
    setFormData({ key: '', value: '', category: 'General' });
    setShowSettingsForm(true);
  };

  const handleOpenEdit = (id: number) => {
    const setting = settings.find(s => s.id === id);
    if (setting) {
      setFormData({
        key: setting.key,
        value: setting.value,
        category: setting.category
      });
      setEditingSettingId(id);
      setShowSettingsForm(true);
    }
  };

  const saveSetting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key.trim() || !formData.value.trim() || !formData.category) {
      return; // We could add error state in the modal, but for now just return
    }
    const newSetting = {
      id: editingSettingId ? editingSettingId : Date.now(),
      key: formData.key.trim(),
      value: formData.value.trim(),
      category: formData.category
    };
    if (editingSettingId) {
      setSettings(prev => prev.map(s => s.id === editingSettingId ? newSetting : s));
    } else {
      setSettings(prev => [...prev, newSetting]);
    }
    setShowSettingsForm(false);
  };

  return (
    <Card title="System Settings" className="shadow-md">
      {/* Settings Form Modal */}
      <Modal
        isOpen={showSettingsForm}
        onClose={() => setShowSettingsForm(false)}
        title={editingSettingId ? 'Edit Setting' : 'Add New Setting'}
        footer={
          <div className="form-actions">
            <button onClick={() => setShowSettingsForm(false)} className="btn-outline">Cancel</button>
            <button onClick={saveSetting} className="btn-primary">
              {editingSettingId ? 'Update' : 'Add Setting'}
            </button>
          </div>
        }
      >
        <form onSubmit={saveSetting} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Setting Key</label>
            <input
              type="text"
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value })}
              required
              className="form-input"
              placeholder="e.g. site_title, max_file_size"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Setting Value</label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              required
              className="form-input"
              placeholder="e.g. White House Admin, 10MB"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
              className="form-select"
            >
              <option value="General">General</option>
              <option value="Appearance">Appearance</option>
              <option value="Security">Security</option>
              <option value="Notifications">Notifications</option>
              <option value="Integration">Integration</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Settings Header */}
      <div className="flex gap-3 mb-4">
        <button onClick={handleOpenAdd} className="btn-primary"><Plus size={18} /> Add Setting</button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="filter-group">
          <label className="filter-label">Search</label>
          <SearchInput
            placeholder="Search by key or value..."
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-select"
          >
            <option value="">All Categories</option>
            <option value="General">General</option>
            <option value="Appearance">Appearance</option>
            <option value="Security">Security</option>
            <option value="Notifications">Notifications</option>
            <option value="Integration">Integration</option>
          </select>
        </div>
      </div>

      {/* Settings Table */}
      <div className="table-wrapper">
        <table className="data-table" aria-label="Settings">
          <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {settings
              .filter(s => {
                const matchesSearch = !filterTerm ||
                  s.key.toLowerCase().includes(filterTerm.toLowerCase()) ||
                  s.value.toLowerCase().includes(filterTerm.toLowerCase());
                const matchesCategory = !filterCategory || s.category === filterCategory;
                return matchesSearch && matchesCategory;
              })
              .map(s => (
                <tr key={s.id}>
                  <td><code>{s.key}</code></td>
                  <td>{s.value}</td>
                  <td>
                    <span className={`badge badge--${s.category.toLowerCase()}`}>
                      {s.category}
                    </span>
                  </td>
                  <td>
                    <div className="action-group">
                      <button onClick={() => handleOpenEdit(s.id)} className="action-btn"><Edit size={14} /></button>
                      <button onClick={() => deleteSetting(s.id)} className="action-btn action-btn--danger"><Trash2 size={14} /></button>
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
