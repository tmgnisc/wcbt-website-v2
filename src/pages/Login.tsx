import React from 'react';
import { LayoutDashboard, Bell, Users, GraduationCap, Settings, LogOut, Plus, Trash2, Edit, ArrowRight, Check, Search, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

export default function Login({ onLogin }) {
  const handleLogin = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="bg-cream text-slate-900 login-container">
      <div className="bg-cream text-slate-900 login-card">
        <div className="bg-cream text-slate-900 login-header">
          <div className="bg-cream text-slate-900 logo-wrapper">
            <img src="/logo.png" alt="WCBT" />
          </div>
          <div className="bg-cream text-slate-900 login-brand">
            WCBT <span>Admin Portal</span>
          </div>
        </div>
        <div className="bg-cream text-slate-900 login-subtitle">Maroon &amp; White · Crest Line-Art</div>
        <form onSubmit={handleLogin} autoComplete="off" className="bg-cream text-slate-900 login-form">
          <input type="email" placeholder="admin@wcbt.edu" required className="bg-cream text-slate-900 input-field" />
          <input type="password" placeholder="Password" required className="bg-cream text-slate-900 input-field" />
          <button type="submit" className="bg-cream text-slate-900 btn-primary">
            Sign In <ArrowRight size={18} />
          </button>
        </form>
        <p className="bg-cream text-slate-900 login-help">Use any email / password — prototype only.</p>
        <p className="bg-cream text-slate-900 login-credential">Credential: admin@wcbt.edu / any password</p>
      </div>
    </div>
  );
}
<div className="bg-cream text-slate-900 bg-maroon text-white p-4 rounded-lg shadow-lg">Tailwind + Ant Design + TSX done</div>
export interface Props { readonly id: string; readonly title?: string };
