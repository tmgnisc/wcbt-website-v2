import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, GraduationCap, Bell, Users } from 'recharts';
import StatCard from '../components/StatCard';

const MAROON = '#8B1A2B';

const chartData = [
  { month: 'Jan', admissions: 98, decisions: 60 },
  { month: 'Feb', admissions: 112, decisions: 75 },
  { month: 'Mar', admissions: 130, decisions: 82 },
  { month: 'Apr', admissions: 124, decisions: 90 },
  { month: 'May', admissions: 140, decisions: 92 },
  { month: 'Jun', admissions: 145, decisions: 100 },
  { month: 'Jul', admissions: 150, decisions: 110 },
  { month: 'Aug', admissions: 162, decisions: 118 },
  { month: 'Sep', admissions: 180, decisions: 130 },
];

export default function Dashboard({ unreadCount, setView }) {
  return (
    <section aria-label="Dashboard">
      <div className="bg-cream text-slate-900 stats-grid">
        {[
          { label: 'Admissions This Year', value: '1,248', delta: '+18% vs last year' },
          { label: 'Active Staff', value: '92', delta: '+4 new this month' },
          { label: 'Pending Decisions', value: '36', delta: 'Requires review' },
          { label: 'Unread Notifications', value: unreadCount.toString(), delta: 'Alerts pending' },
        ].map(s => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="bg-cream text-slate-900 chart-container">
        <h2 className="bg-cream text-slate-900 section-title">Admissions Trend</h2>
        <div className="bg-cream text-slate-900 chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#f0eae8" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6a5560' }} axisLine={{ stroke: '#e5dde2' }} />
              <YAxis tick={{ fontSize: 12, fill: '#6a5560' }} axisLine={{ stroke: '#e5dde2' }} />
              <Tooltip contentStyle={{ background: '#1b0e14', color: '#fff', borderRadius: 8, border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="admissions" stroke={MAROON} strokeWidth={3} dot={{ fill: MAROON, r: 5 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="decisions" stroke="#c5a065" strokeWidth={3} dot={{ fill: '#c5a065', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-cream text-slate-900 quick-actions-grid">
        <div className="bg-cream text-slate-900 action-card">
          <h2 className="bg-cream text-slate-900 section-title">Quick Actions</h2>
          <div className="bg-cream text-slate-900 action-group">
            <button onClick={() => setView('admissions')} className="bg-cream text-slate-900 btn-primary"><GraduationCap size={18} /> Add Admission</button>
            <button onClick={() => setView('notifications')} className="bg-cream text-slate-900 btn-outline"><Bell size={18} /> Post Notice</button>
            <button onClick={() => setView('staff')} className="bg-cream text-slate-900 btn-outline"><Users size={18} /> Manage Staff</button>
          </div>
        </div>
        <div className="bg-cream text-slate-900 identity-card">
          <h2 className="bg-cream text-slate-900 section-title">Identity Note</h2>
          <p className="bg-cream text-slate-900 identity-text">
            Maroon (<strong>#8B1A2B</strong>) and white identity applied across all surfaces. Lucide outline icons recolored to maroon/white for crest line-art matching. Chart library: <strong>Recharts</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}
export interface Props { readonly id: string; readonly title?: string };
