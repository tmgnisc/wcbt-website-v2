import { useState } from 'react';
import { Card, Table, Button, Input, Space } from "antd";
import "antd/dist/reset.css";
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';

export interface NotificationProps {
  notifs: { id: number; title: string; type: string; date: string; read: boolean }[];
  toggleRead: (id: number) => void;
  deleteNotif: (id: number) => void;
  addNotifCallback?: (title: string) => void;
}

export default function Notifications({ notifs, toggleRead, deleteNotif, addNotifCallback }: NotificationProps) {
  const [filterTerm, setFilterTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const filtered = notifs.filter(n =>
    n.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
    n.type.toLowerCase().includes(filterTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newTitle.trim() || !addNotifCallback) return;
    addNotifCallback(newTitle.trim());
    setNewTitle('');
    setModalOpen(false);
  };

  return (
    <Card title="Notifications" className="shadow-md">
      <div className="flex gap-3 mb-4">
        <button onClick={() => setModalOpen(true)} className="bg-[#8B1A2B] text-white px-4 py-2 rounded-md text-sm hover:bg-[#6a1522] transition flex items-center gap-2"><Plus size={18} /> New Notification</button>
      </div>
      <div className="mb-12">
        <input
          type="text"
          placeholder="Search notifications..."
          value={filterTerm}
          onChange={e => setFilterTerm(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="notif-grid">
        {filtered.map(n => (
          <div key={n.id} className={`notif-card ${n.read ? 'notif-card--read' : 'notif-card--unread'}`}>
            <div className="notif-header">
              <span className="notif-title">{n.title}</span>
              <span className="notif-date">{n.date}</span>
            </div>
            <div className="flex-between mt-12">
              <span className="notif-type">{n.type}</span>
              <div className="action-row">
                <button onClick={() => toggleRead(n.id)} className="btn-ghost">
                  {n.read ? 'Mark Unread' : 'Mark Read'}
                </button>
                <button onClick={() => deleteNotif(n.id)} className="btn-ghost btn-danger"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Notification">
        <input
          type="text"
          placeholder="Notification title:"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          className="form-input"
        />
        <div className="form-actions" style={{ marginTop: 12 }}>
          <button type="button" onClick={() => setModalOpen(false)} className="btn-outline">Cancel</button>
          <button type="button" onClick={handleAdd} className="bg-[#8B1A2B] text-white px-4 py-2 rounded-md text-sm hover:bg-[#6a1522] transition flex items-center gap-2">Add</button>
        </div>
      </Modal>
    </Card>
  );
}
