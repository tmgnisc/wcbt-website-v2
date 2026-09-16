import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
}

export default function StatCard({ label, value, delta }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-delta">{delta}</div>
    </div>
  );
}
