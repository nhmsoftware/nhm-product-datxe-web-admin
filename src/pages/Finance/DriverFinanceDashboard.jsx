import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  CreditCard, 
  Settings, 
  ChevronRight,
  Filter,
  Download,
  Percent,
  Landmark
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DriverFinanceDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_drivers: 0,
    total_drivers_internal: 0,
    total_drivers_partner: 0,
    total_revenue: 0,
    total_commission: 0,
    total_drivers_blocked: 0,
    currency: 'VND'
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/admin/finance/driver-summary');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching driver finance stats:', error);
      toast.error('Không thể tải dữ liệu tài chính tài xế');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: stats.currency || 'VND' 
    }).format(amount);
  };

  const menuModules = [
    {
      title: 'Cấu hình Ví tín dụng',
      description: 'Thiết lập hạn mức, nạp tiền và quy tắc trừ tiền ví tài xế.',
      icon: <Wallet className="text-primary" size={24} />,
      path: '/finance/credit-wallet-config', // UC-117
      badge: 'Credit Wallet'
    },
    {
      title: 'Gói thuê bao Lái xe',
      description: 'Quản lý các gói đăng ký theo ngày/tháng cho tài xế đối tác.',
      icon: <CreditCard className="text-secondary" size={24} />,
      path: '/finance/subscription-packages', // UC-118
      badge: 'Subscription'
    },
    {
      title: 'Mô hình Hoa hồng',
      description: 'Điều chỉnh tỷ lệ chiết khấu linh hoạt theo loại xe và khu vực.',
      icon: <Percent className="text-success" size={24} />,
      path: '/finance/commissions',
      badge: 'Commission'
    },
    {
      title: 'Phương thức nạp tiền',
      description: 'Cấu hình các cổng thanh toán (MoMo, ZaloPay, ngân hàng, chuyển khoản) cho Driver nạp tiền.',
      icon: <Landmark className="text-warning" size={24} />,
      path: '/finance/payment-methods', // UC-132
      badge: 'Payment Methods'
    }
  ];

  return (
    <div className="finance-dashboard" style={{ padding: '2rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '2.5rem' 
      }}>
        <div>
          <h1 className="page-title">Quản lý Tài chính Tài xế</h1>
          <p style={{ color: 'var(--text-muted)' }}>Báo cáo tổng hợp và cấu hình mô hình kinh tế cho đội ngũ tài xế.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-glass">
            <Download size={18} />
            Xuất báo cáo
          </button>
          <button className="btn btn-primary" onClick={fetchStats}>
            <Filter size={18} />
            Lọc dữ liệu
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Total Revenue */}
        <div className="stat-card glass glass-hover">
          <div className="stat-icon" style={{ background: 'rgba(0, 73, 172, 0.1)', color: 'var(--primary)' }}>
            <TrendingUp size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tổng Doanh thu (GMV)</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {loading ? '...' : formatCurrency(stats.total_revenue)}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 }}>
              <ArrowUpRight size={14} />
              <span>+12.5% so với tháng trước</span>
            </div>
          </div>
        </div>

        {/* Total Commission */}
        <div className="stat-card glass glass-hover">
          <div className="stat-icon" style={{ background: 'rgba(0, 144, 106, 0.1)', color: 'var(--success)' }}>
            <Wallet size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tổng Hoa hồng Hệ thống</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {loading ? '...' : formatCurrency(stats.total_commission)}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 }}>
              <ArrowUpRight size={14} />
              <span>+8.2% doanh thu thực</span>
            </div>
          </div>
        </div>

        {/* Driver Breakdown */}
        <div className="stat-card glass glass-hover">
          <div className="stat-icon" style={{ background: 'rgba(247, 37, 133, 0.1)', color: 'var(--secondary)' }}>
            <Users size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tổng số Tài xế</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {loading ? '...' : stats.total_drivers}
            </h3>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--primary)' }}>Nhà: {stats.total_drivers_internal}</span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: 'var(--secondary)' }}>Khách: {stats.total_drivers_partner}</span>
            </div>
          </div>
        </div>

        {/* Blocked Drivers */}
        <div className="stat-card glass glass-hover">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}>
            <ShieldAlert size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tài xế bị khóa ví/nhận cuốc</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              {loading ? '...' : stats.total_drivers_blocked}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', color: 'var(--error)', fontSize: '0.75rem', fontWeight: 700 }}>
              <ArrowDownRight size={14} />
              <span>Cần xử lý ngay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div style={{ marginTop: '3.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Settings size={20} className="text-primary" />
          Cấu hình Mô hình Tài chính
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {menuModules.map((module, index) => (
            <div 
              key={index} 
              className="glass glass-hover animate-slide-up" 
              style={{ 
                padding: '2rem', 
                borderRadius: '24px', 
                cursor: 'pointer',
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '56px', 
                  height: '56px', 
                  borderRadius: '16px', 
                  background: 'var(--bg-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {module.icon}
                </div>
                <span className="badge badge-success" style={{ background: 'rgba(0, 73, 172, 0.08)', color: 'var(--primary)' }}>
                  {module.badge}
                </span>
              </div>
              
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>{module.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem', minHeight: '3rem' }}>
                {module.description}
              </p>
              
              <button 
                className="btn btn-premium" 
                style={{ width: '100%', justifyContent: 'space-between' }}
                onClick={() => navigate(module.path)}
              >
                Tiến hành cấu hình
                <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Charts / Detailed Sections could go here */}
      <div className="glass" style={{ 
        marginTop: '3.5rem', 
        padding: '2.5rem', 
        borderRadius: '32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--primary) 0%, #002d6b 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <TrendingUp size={48} style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1rem' }}>Báo cáo Tài chính chi tiết</h2>
        <p style={{ maxWidth: '600px', opacity: 0.9, marginBottom: '2rem' }}>
          Xem các biểu đồ phân tích sâu về dòng tiền, tỷ lệ hoa hồng thực tế và hiệu quả các gói thuê bao theo từng mốc thời gian.
        </p>
        <button
          className="btn"
          style={{ background: 'white', color: 'var(--primary)', padding: '0.875rem 2.5rem', fontWeight: 700 }}
          onClick={() => navigate('/finance/reports')}
        >
          Mở Dashboard Phân tích
        </button>
      </div>
    </div>
  );
};

export default DriverFinanceDashboard;
