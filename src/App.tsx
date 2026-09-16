import { useState } from 'react';
import { Card } from "antd";
import { LayoutDashboard, Bell, Users, GraduationCap, Settings, LogOut } from 'lucide-react';
import Notifications from './pages/Notifications';
import Staff from './pages/Staff';
import Admissions from './pages/Admissions';
import SettingsPage from './pages/Settings';

export interface AppState {
  view: string;
  notifs: { id: number; title: string; type: string; date: string; read: boolean }[];
  staff: { id: number; name: string; role: string; email: string; dept: string }[];
  admissions: { id: number; name: string; program: string; status: string; date: string }[];
  settings: { id: number; key: string; value: string; category: string }[];
}

export default function App() {
  const [view, setView] = useState('login');
  const [notifs, setNotifs] = useState([
    { id: 1, title: 'Admission deadline extended', type: 'Alert', date: '2026-09-14', read: false },
    { id: 2, title: 'Staff meeting — Sept 22', type: 'Event', date: '2026-09-13', read: false },
    { id: 3, title: 'New policy: verification steps', type: 'Notice', date: '2026-09-10', read: true },
  ]);
  const [staff, setStaff] = useState([
    { id: 1, name: 'Dr. Amara Osei', role: 'Head of Admissions', email: 'amara@wcbt.edu', dept: 'Admissions' },
    { id: 2, name: 'Kwame Mensah', role: 'Dean of Studies', email: 'kwame@wcbt.edu', dept: 'Academics' },
    { id: 3, name: 'Nana Esi', role: 'HR Coordinator', email: 'esi@wcbt.edu', dept: 'Staff' },
  ]);
  const [admissions, setAdmissions] = useState([
    { id: 1, name: 'Amina Bakari', program: 'BSc Public Admin', status: 'Under Review', date: '2026-09-12' },
    { id: 2, name: 'Kwesi Osei', program: 'MA Governance', status: 'Interview', date: '2026-09-10' },
    { id: 3, name: 'Fatima Yusuf', program: 'BSc Law', status: 'Applied', date: '2026-09-08' },
  ]);
  const [settings] = useState([
    { id: 1, key: 'site_title', value: 'WCBT Admin Portal', category: 'General' },
    { id: 2, key: 'max_file_size', value: '10MB', category: 'Security' },
  ]);

  const unreadCount = notifs.filter(n => !n.read).length;

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'staff', label: 'Staff', icon: Users },
    { key: 'admissions', label: 'Admissions', icon: GraduationCap },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  if (view === 'login') {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-wrapper"><img src="/logo.png" alt="WCBT" /></div>
            <div className="login-brand">WCBT <span>Admin Portal</span></div>
          </div>
          <div className="login-subtitle">Slate & Cream Editorial · TypeScript · Ant Design</div>
          <form onSubmit={e => { e.preventDefault(); setView('app'); }} autoComplete="off" className="login-form">
            <input type="email" placeholder="admin@wcbt.edu" required className="input-field" />
            <input type="password" placeholder="Password" required className="input-field" />
            <button type="submit" className="btn-primary">Sign In</button>
          </form>
          <p className="login-help">Use any email / password — prototype only.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout" style={{ background: '#F6F2EA', color: '#1A1A2E' }}>
      {/* Sidebar */}
      <aside className="sidebar" aria-label="Sections" style={{ background: '#1A1A2E', color: '#F6F2EA', width: 280 }}>
        <div className="sidebar-brand" style={{ borderBottom: '1px solid rgba(246,242,234,0.15)' }}>
          <img src="/logo.png" alt="WCBT" />
          <div>WCBT <span style={{ color: '#F6F2EA99' }}>Admin Portal</span></div>
        </div>
        <nav className="nav-list" aria-label="Sections">
          {navItems.map(n => (
            <button key={n.key} onClick={() => setView(n.key)} className={`nav-item ${view === n.key ? 'nav-item--active' : ''}`} aria-current={view === n.key ? 'true' : undefined} style={{ color: '#F6F2EA', borderBottom: '1px solid rgba(246,242,234,0.08)' }}>
              <n.icon size={18} /> <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer" style={{ color: '#F6F2EA99', fontSize: 12 }}>
          <span>● WCBT Verified Portal · Slate / Cream</span>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content" style={{ background: '#F6F2EA', padding: '2rem' }}>
        <header className="page-header" style={{ borderBottom: '1px solid #E8DFD2', marginBottom: '2rem', paddingBottom: '1rem' }}>
          <div>
            <h1 className="page-title" style={{ color: '#1A1A2E', fontFamily: 'Georgia, serif', fontWeight: 600 }}>{navItems.find(n => n.key === view)?.label}</h1>
            <div className="page-subtitle" style={{ color: '#6B6055', fontSize: 14 }}>Slate / Cream editorial · Ant Design · TypeScript</div>
          </div>
          <div className="header-actions" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button onClick={() => setView('notifications')} style={{ background: '#8B1A2B', color: '#fff', padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500 }}>
              <Bell size={16} /> <span style={{ marginLeft: 4 }}>{unreadCount}</span>
            </button>
            <button onClick={() => setView('settings')} style={{ background: 'transparent', border: '1px solid #D8CDB8', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', color: '#1A1A2E' }}><Users size={16} /> Admin</button>
            <button onClick={() => setView('login')} style={{ background: 'transparent', border: '1px solid #D8CDB8', padding: '8px 14px', borderRadius: 6, cursor: 'pointer', color: '#8B1A2B' }}><LogOut size={16} /> Log Out</button>
          </div>
        </header>

        {/* DASHBOARD */}
        {view === 'dashboard' || view === 'app' ? (
          <section aria-label="Dashboard">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {[
                { label: 'Admissions This Year', value: '1,248', delta: '+18% vs last year' },
                { label: 'Active Staff', value: '92', delta: '+4 new this month' },
                { label: 'Pending Decisions', value: '36', delta: 'Requires review' },
                { label: 'Unread Notifications', value: unreadCount.toString(), delta: 'Alerts pending' },
              ].map(s => (
                <Card key={s.label} style={{ background: '#FDFBF7', borderRadius: 12, border: '1px solid #E8DFD2', boxShadow: '0 1px 3px rgba(26,26,46,0.06)' }}>
                  <div style={{ color: '#6B6055', fontSize: 13, letterSpacing: 0.5 }}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#1A1A2E', fontFamily: 'Georgia, serif', margin: '4px 0' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#8B1A2B', fontWeight: 500 }}>{s.delta}</div>
                </Card>
              ))}
            </div>
            <Card style={{ background: '#FDFBF7', borderRadius: 12, border: '1px solid #E8DFD2', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 600, color: '#1A1A2E', marginBottom: 12 }}>Admissions Trend</h2>
              <p style={{ color: '#6B6055', fontSize: 14 }}>Recharts line chart — admissions vs decisions over 9 months (crimson stroke #8B1A2B).</p>
            </Card>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <Card style={{ background: '#FDFBF7', borderRadius: 12, border: '1px solid #E8DFD2' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 600, marginBottom: 12 }}>Quick Actions</h2>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button onClick={() => setView('admissions')} style={{ background: '#8B1A2B', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 16px', cursor: 'pointer', fontWeight: 500 }}>Add Admission</button>
                  <button onClick={() => setView('notifications')} style={{ background: '#F6F2EA', border: '1px solid #D8CDB8', color: '#1A1A2E', borderRadius: 6, padding: '10px 16px', cursor: 'pointer' }}>Post Notice</button>
                  <button onClick={() => setView('staff')} style={{ background: '#F6F2EA', border: '1px solid #D8CDB8', color: '#1A1A2E', borderRadius: 6, padding: '10px 16px', cursor: 'pointer' }}>Manage Staff</button>
                </div>
              </Card>
              <Card style={{ background: '#FDFBF7', borderRadius: 12, border: '1px solid #E8DFD2' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 600, marginBottom: 8 }}>Identity Note</h2>
                <p style={{ color: '#6B6055', fontSize: 14, lineHeight: 1.6 }}>Editorial slate/cream palette: <strong>#F6F2EA</strong> background, <strong>#1A1A2E</strong> text, crimson <strong>#8B1A2B</strong> accent. Ant Design + Tailwind utilities. All <code>prompt()</code> / <code>alert()</code> replaced with React Modals.</p>
              </Card>
            </div>
          </section>
        ) : null}

        {view === 'notifications' && (
          <Notifications
            notifs={notifs}
            toggleRead={id => setNotifs(p => p.map(n => n.id === id ? { ...n, read: !n.read } : n))}
            deleteNotif={id => setNotifs(p => p.filter(n => n.id !== id))}
            addNotifCallback={title => setNotifs(p => [...p, { id: Date.now(), title, type: 'Alert', date: new Date().toISOString().split('T')[0], read: false }])}
          />
        )}

        {view === 'staff' && <Staff staff={staff} setStaff={setStaff} />}
        {view === 'admissions' && <Admissions admissions={admissions} setAdmissions={setAdmissions} />}
        {view === 'settings' && <SettingsPage settings={settings} setSettings={() => {}} />}
      </main>
    </div>
  );
}
