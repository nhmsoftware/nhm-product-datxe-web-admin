import React, { useEffect, useState } from 'react';
import { Users, Car, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { adminService } from '../../services/adminService';

const data = [
  { name: '01/05', rides: 40, revenue: 2400 },
  { name: '02/05', rides: 30, revenue: 1398 },
  { name: '03/05', rides: 60, revenue: 9800 },
  { name: '04/05', rides: 45, revenue: 3908 },
  { name: '05/05', rides: 80, revenue: 4800 },
];

const StatCard = ({ icon, label, value, trend, color, loading }) => (
  <div className="glass stat-card glass-hover">
    <div className="stat-icon" style={{ background: `${color}15`, color: color }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0', color: 'var(--text)' }}>
        {loading ? <div className="skeleton" style={{ width: '60%', height: '2rem' }}></div> : value}
      </div>
      <div style={{ 
        fontSize: '0.75rem', 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: trend.startsWith('+') ? 'var(--success)' : 'var(--error)' 
      }}>
        {trend} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>so với tháng trước</span>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await adminService.getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <h1 className="page-title">Chào buổi sáng, Admin</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1rem' }}>Đây là những gì đang diễn ra với hệ thống của bạn hôm nay.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon={<Users size={24} />} label="Khách hàng" value={stats?.total_users?.toLocaleString() || '0'} trend="+12.5%" color="var(--primary)" loading={loading} />
        <StatCard icon={<Car size={24} />} label="Tài xế" value={stats?.active_drivers?.toLocaleString() || '0'} trend="+3.2%" color="#10b981" loading={loading} />
        <StatCard icon={<ShoppingBag size={24} />} label="Chuyến đi" value={stats?.total_orders?.toLocaleString() || '0'} trend="+24.8%" color="#f59e0b" loading={loading} />
        <StatCard icon={<DollarSign size={24} />} label="Doanh thu" value={`${((stats?.total_revenue || 0) / 1000000).toFixed(1)}M`} trend="+18.4%" color="#ef4444" loading={loading} />
      </div>


      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
        <div className="glass" style={{ padding: '2rem', minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Biểu đồ tăng trưởng</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Mục tiêu: 50M</span>
            </div>
          </div>
          <div>
            <ResponsiveContainer width="99%" aspect={2.5} minWidth={0}>
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
