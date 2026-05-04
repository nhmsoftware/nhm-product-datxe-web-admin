import React from 'react';
import { Users, Car, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const data = [
  { name: '01/05', rides: 40, revenue: 2400 },
  { name: '02/05', rides: 30, revenue: 1398 },
  { name: '03/05', rides: 60, revenue: 9800 },
  { name: '04/05', rides: 45, revenue: 3908 },
  { name: '05/05', rides: 80, revenue: 4800 },
];

const StatCard = ({ icon, label, value, trend, color }) => (
  <div className="glass stat-card glass-hover">
    <div className="stat-icon" style={{ background: `${color}15`, color: color }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '4px 0' }}>{value}</div>
      <div style={{ fontSize: '0.75rem', color: trend.startsWith('+') ? 'var(--success)' : 'var(--error)' }}>
        {trend} so với tháng trước
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Chào buổi sáng, Admin</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Đây là những gì đang diễn ra với hệ thống của bạn hôm nay.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon={<Users />} label="Khách hàng" value="1,284" trend="+12.5%" color="#6366f1" />
        <StatCard icon={<Car />} label="Tài xế" value="452" trend="+3.2%" color="#10b981" />
        <StatCard icon={<ShoppingBag />} label="Chuyến đi" value="8,902" trend="+24.8%" color="#f59e0b" />
        <StatCard icon={<DollarSign />} label="Doanh thu" value="42.5M" trend="+18.4%" color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="glass" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Biểu đồ tăng trưởng</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mục tiêu: 50M</span>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ background: '#1e293b', border: '1px solid var(--border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'white' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Hoạt động gần đây</h3>
          <div className="activity-list">
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ 
                display: 'flex', 
                gap: '1rem', 
                padding: '1rem 0', 
                borderBottom: i !== 4 ? '1px solid var(--border)' : 'none' 
              }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'rgba(99, 102, 241, 0.1)',
                  flexShrink: 0
                }}></div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Tài xế mới đăng ký</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2 phút trước</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
