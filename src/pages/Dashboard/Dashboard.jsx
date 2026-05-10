import React, { useEffect, useState, useMemo } from 'react';
import Chart from 'react-apexcharts';
import { 
  Users, 
  Car, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  FileText,
  Settings,
  Zap,
  Activity,
  Percent,
  Download,
  Award,
  Filter,
  BarChart2,
  Calendar,
  Search,
  X
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

// Move RangeFilter outside to prevent re-creation on every parent render
const RangeFilter = ({ start, end, onApply }) => {
  const [tempStart, setTempStart] = useState(start);
  const [tempEnd, setTempEnd] = useState(end);
  const [isOpen, setIsOpen] = useState(false);

  // Sync temp state when props change
  useEffect(() => {
    setTempStart(start);
    setTempEnd(end);
  }, [start, end]);

  return (
    <div style={{ position: 'relative' }} className="range-filter-container">
      <button 
        className={`icon-btn sm ${isOpen ? 'active' : ''}`} 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        style={{ 
          background: isOpen ? 'var(--primary-soft)' : 'rgba(255,255,255,0.05)',
          border: isOpen ? '1px solid var(--primary)' : '1px solid transparent'
        }}
      >
        <Calendar size={14} color={isOpen ? 'var(--primary)' : 'var(--text-muted)'} />
      </button>

      {isOpen && (
        <div 
          className="card glass animate-fade-in" 
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          style={{ 
            position: 'absolute', 
            top: 'calc(100% + 10px)', 
            right: 0, 
            zIndex: 999, 
            padding: '1.25rem', 
            minWidth: '240px', 
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--primary-soft)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px' }}>LỌC TÙY CHỈNH</span>
            <X size={14} className="hover-error" onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>TỪ NGÀY</label>
              <input 
                type="date" 
                value={tempStart} 
                onChange={(e) => setTempStart(e.target.value)} 
                className="input-custom"
                style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }} 
              />
            </div>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>ĐẾN NGÀY</label>
              <input 
                type="date" 
                value={tempEnd} 
                onChange={(e) => setTempEnd(e.target.value)} 
                className="input-custom"
                style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: '12px' }} 
              />
            </div>
            <button 
              className="btn btn-primary btn-sm" 
              style={{ width: '100%', marginTop: '4px', height: '36px' }}
              onClick={() => { 
                onApply(tempStart, tempEnd); 
                setIsOpen(false); 
              }}
            >
              <Search size={14} /> Áp dụng lọc
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const defaultStart = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
  const defaultEnd = new Date().toISOString().split('T')[0];

  // Independent states
  const [revenueSection, setRevenueSection] = useState({ data: [], interval: 'day', start: defaultStart, end: defaultEnd, loading: false });
  const [areaSection, setAreaSection] = useState({ data: [], start: defaultStart, end: defaultEnd, loading: false });
  const [commissionSection, setCommissionSection] = useState({ summary: [], start: defaultStart, end: defaultEnd, loading: false });
  const [orderSection, setOrderSection] = useState({ stats: null, start: defaultStart, end: defaultEnd, loading: false });
  const [driverSection, setDriverSection] = useState({ data: [], start: defaultStart, end: defaultEnd, groupType: null, loading: false });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchAllData();
    return () => clearInterval(timer);
  }, []);

  const fetchRevenue = async (start = revenueSection.start, end = revenueSection.end, interval = revenueSection.interval) => {
    setRevenueSection(prev => ({ ...prev, loading: true }));
    try {
      const res = await adminService.getRevenueReport({ interval, start_date: start, end_date: end });
      setRevenueSection(prev => ({ ...prev, data: res.data || [], start, end, interval, loading: false }));
    } catch (e) { setRevenueSection(prev => ({ ...prev, loading: false })); }
  };

  const fetchArea = async (start = areaSection.start, end = areaSection.end) => {
    setAreaSection(prev => ({ ...prev, loading: true }));
    try {
      const res = await adminService.getAreaReport({ start_date: start, end_date: end });
      setAreaSection(prev => ({ ...prev, data: res.data || [], start, end, loading: false }));
    } catch (e) { setAreaSection(prev => ({ ...prev, loading: false })); }
  };

  const fetchCommission = async (start = commissionSection.start, end = commissionSection.end) => {
    setCommissionSection(prev => ({ ...prev, loading: true }));
    try {
      const res = await adminService.getCommissionReport({ start_date: start, end_date: end });
      setCommissionSection(prev => ({ ...prev, summary: res.data.summary || [], start, end, loading: false }));
    } catch (e) { setCommissionSection(prev => ({ ...prev, loading: false })); }
  };

  const fetchOrders = async (start = orderSection.start, end = orderSection.end) => {
    setOrderSection(prev => ({ ...prev, loading: true }));
    try {
      const res = await adminService.getOrderReport({ start_date: start, end_date: end });
      setOrderSection(prev => ({ ...prev, stats: res.data, start, end, loading: false }));
    } catch (e) { setOrderSection(prev => ({ ...prev, loading: false })); }
  };

  const fetchDrivers = async (start = driverSection.start, end = driverSection.end, groupType = driverSection.groupType) => {
    setDriverSection(prev => ({ ...prev, loading: true }));
    try {
      const res = await adminService.getTopDriversReport({ 
        start_date: start, 
        end_date: end,
        driver_group_type: groupType
      });
      setDriverSection(prev => ({ ...prev, data: res.data || [], start, end, groupType, loading: false }));
    } catch (e) { setDriverSection(prev => ({ ...prev, loading: false })); }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const statsRes = await adminService.getDashboardStats();
      setStats(statsRes.data);
      await Promise.all([fetchRevenue(), fetchArea(), fetchCommission(), fetchOrders(), fetchDrivers()]);
    } finally { setLoading(false); }
  };

  const exportToExcel = (title, data) => {
    toast.success(`Đang xuất dữ liệu ${title}...`);
    const exportData = Array.isArray(data) ? data : [data];
    const headers = Object.keys(exportData[0] || {}).join(',');
    const rows = exportData.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows;
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `${title.toLowerCase().replace(/ /g, '_')}_${new Date().getTime()}.csv`);
    link.click();
  };

  const revenueChartOptions = {
    chart: { 
      type: 'bar', 
      toolbar: { show: false }, 
      fontFamily: 'Be Vietnam Pro',
      animations: { enabled: true, easing: 'easeinout', speed: 800 }
    },
    plotOptions: {
      bar: {
        borderRadius: 6,
        columnWidth: '45%',
        distributed: false,
        dataLabels: { position: 'top' }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => new Intl.NumberFormat('vi-VN').format(val),
      offsetY: -20,
      style: { fontSize: '10px', colors: ['var(--text)'] }
    },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    colors: ['#4361ee'],
    xaxis: {
      categories: (revenueSection.data || []).map(h => h.period?.split('-').reverse().join('/') || 'N/A'),
      labels: { style: { colors: 'var(--text-muted)', fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { 
      show: true,
      labels: { 
        style: { colors: 'var(--text-muted)', fontSize: '10px' },
        formatter: (val) => new Intl.NumberFormat('vi-VN').format(val)
      }
    },
    grid: { 
      show: true, 
      borderColor: 'var(--border)', 
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    tooltip: { theme: 'dark', y: { formatter: (val) => new Intl.NumberFormat('vi-VN').format(val) + 'đ' } }
  };

  return (
    <div className="dashboard-page animate-fade-in" style={{ paddingBottom: '3rem' }}>
      <div className="card glass" style={{ marginBottom: '2.5rem', padding: '1.5rem 2.5rem', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Dashboard Quản trị <Zap size={24} style={{ color: 'var(--warning)', verticalAlign: 'middle', marginLeft: '8px' }} /></h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '0.875rem' }}>Theo dõi thời gian thực. <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Bộ lọc khoảng thời gian đã được cố định lỗi tự đóng.</span></p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{currentTime.toLocaleTimeString('vi-VN')}</div>
          <div className="badge badge-success animate-pulse" style={{ marginTop: '0.5rem' }}><Activity size={12} /> Live</div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <StatTile icon={<Users />} label="Người dùng" value={stats?.total_users || 0} trend="+12%" color="#4361ee" loading={loading} />
        <StatTile icon={<ShoppingBag />} label="Chuyến đi" value={stats?.total_orders || 0} trend="+8.5%" color="#f72585" loading={loading} />
        <StatTile icon={<Car />} label="Tài xế Online" value={stats?.active_drivers || 0} trend="+3.2%" color="#06d6a0" loading={loading} />
        <StatTile icon={<DollarSign />} label="Doanh thu" value={stats?.total_revenue || '0đ'} trend="+15.4%" color="#ffb703" loading={loading} isCurrency />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Revenue */}
          <div className="card glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={20} color="var(--primary)" /> Biến động Doanh thu
              </h3>
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                <div className="tabs-container" style={{ marginBottom: 0, padding: '2px' }}>
                  <button className={`tab-item ${revenueSection.interval === 'day' ? 'active' : ''}`} style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={() => fetchRevenue(revenueSection.start, revenueSection.end, 'day')}>Ngày</button>
                  <button className={`tab-item ${revenueSection.interval === 'month' ? 'active' : ''}`} style={{ padding: '4px 10px', fontSize: '0.7rem' }} onClick={() => fetchRevenue(revenueSection.start, revenueSection.end, 'month')}>Tháng</button>
                </div>
                <RangeFilter start={revenueSection.start} end={revenueSection.end} onApply={(s, e) => fetchRevenue(s, e, revenueSection.interval)} />
                <button className="icon-btn sm" onClick={() => exportToExcel('Doanh thu', revenueSection.data)}><Download size={14} /></button>
              </div>
            </div>
            {revenueSection.loading ? <div className="skeleton" style={{ height: '300px' }}></div> : <Chart options={revenueChartOptions} series={[{ name: 'Doanh thu', data: revenueSection.data.map(h => parseFloat(h.gmv)) }]} type="bar" height={300} />}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
             {/* Area */}
             <div className="card glass" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="var(--primary)" /> Top Khu vực
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <RangeFilter start={areaSection.start} end={areaSection.end} onApply={fetchArea} />
                    <button className="icon-btn sm" onClick={() => exportToExcel('Khu vuc', areaSection.data)}><Download size={12} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '150px' }}>
                   {areaSection.loading ? <div className="skeleton" style={{ height: '100px' }}></div> : areaSection.data.slice(0, 5).map((area, i) => (
                      <div key={i}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                            <span>{area.area || 'Khác'}</span>
                            <span style={{ fontWeight: 700 }}>{area.total_rides}</span>
                         </div>
                         <div style={{ height: '4px', background: 'var(--bg-soft)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, (area.total_rides / (areaSection.data[0]?.total_rides || 1)) * 100)}%`, height: '100%', background: 'var(--primary)' }}></div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
             
             {/* Commission */}
             <div className="card glass" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Percent size={16} color="var(--secondary)" /> Hoa hồng
                  </h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <RangeFilter start={commissionSection.start} end={commissionSection.end} onApply={fetchCommission} />
                    <button className="icon-btn sm" onClick={() => exportToExcel('Hoa hong', commissionSection.summary)}><Download size={12} /></button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', minHeight: '150px' }}>
                   {commissionSection.loading ? <div className="skeleton" style={{ height: '100px' }}></div> : commissionSection.summary.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.driver_group_type == 1 ? 'var(--primary)' : 'var(--secondary)' }}></div>
                            <span style={{ fontSize: '0.8125rem' }}>{item.group_label}</span>
                         </div>
                         <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{new Intl.NumberFormat('vi-VN').format(item.system_commission)}đ</div>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Operational */}
          <div className="card glass" style={{ padding: '1.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} color="var(--success)" /> Vận hành
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <RangeFilter start={orderSection.start} end={orderSection.end} onApply={fetchOrders} />
                   <button className="icon-btn sm" onClick={() => exportToExcel('Van hanh', [orderSection.stats])}><Download size={12} /></button>
                </div>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Hoàn thành</p>
                   <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--success)' }}>{orderSection.stats?.completion_rate || 0}%</h4>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Bị Hủy</p>
                   <h4 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--error)' }}>{orderSection.stats?.cancellation_rate || 0}%</h4>
                </div>
                <div style={{ textAlign: 'center' }}>
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tổng đơn</p>
                   <h4 style={{ fontSize: '1.125rem', fontWeight: 800 }}>{orderSection.stats?.total_orders || 0}</h4>
                </div>
             </div>
          </div>
        </div>

        {/* Top Drivers */}
        <div className="card glass animate-slide-up" style={{ padding: '0', animationDelay: '0.2s' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={20} color="var(--warning)" /> Top Tài xế
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div className="tabs-container" style={{ marginBottom: 0, padding: '2px', background: 'rgba(0,0,0,0.05)' }}>
                  <button className={`tab-item ${driverSection.groupType === null ? 'active' : ''}`} style={{ padding: '2px 8px', fontSize: '0.65rem' }} onClick={() => fetchDrivers(driverSection.start, driverSection.end, null)}>Tất cả</button>
                  <button className={`tab-item ${driverSection.groupType === 1 ? 'active' : ''}`} style={{ padding: '2px 8px', fontSize: '0.65rem' }} onClick={() => fetchDrivers(driverSection.start, driverSection.end, 1)}>Đội nhà</button>
                  <button className={`tab-item ${driverSection.groupType === 2 ? 'active' : ''}`} style={{ padding: '2px 8px', fontSize: '0.65rem' }} onClick={() => fetchDrivers(driverSection.start, driverSection.end, 2)}>Đối tác</button>
                </div>
                <RangeFilter start={driverSection.start} end={driverSection.end} onApply={(s, e) => fetchDrivers(s, e, driverSection.groupType)} />
                <button className="icon-btn sm" onClick={() => exportToExcel('Top tai xe', driverSection.data)}><Download size={14} /></button>
            </div>
          </div>
          <div style={{ padding: '1rem 0', minHeight: '400px' }}>
            {driverSection.loading ? <div style={{ padding: '2rem' }}><div className="skeleton" style={{ height: '300px' }}></div></div> : driverSection.data.length > 0 ? driverSection.data.map((driver, i) => (
              <div key={i} className="activity-item" style={{ padding: '1.25rem 2rem', display: 'flex', gap: '1rem', borderBottom: i === driverSection.data.length - 1 ? 'none' : '1px solid var(--border)', transition: '0.3s' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: i === 0 ? 'rgba(255, 183, 3, 0.15)' : 'var(--bg-soft)', color: i === 0 ? 'var(--warning)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem' }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{driver.driver_name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{driver.total_rides} chuyến</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--success)' }}>{new Intl.NumberFormat('vi-VN').format(driver.total_revenue)}đ</div>
                </div>
              </div>
            )) : <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chưa có dữ liệu.</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatTile = ({ icon, label, value, trend, color, loading, isCurrency }) => (
  <div className="card glass glass-hover" style={{ padding: '1.5rem' }}>
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
      <div className="stat-icon" style={{ background: `${color}15`, color: color, width: '50px', height: '50px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{React.cloneElement(icon, { size: 24 })}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '2px 0' }}>{loading ? '...' : (isCurrency ? value : value.toLocaleString())}</h2>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}><ArrowUpRight size={12} /> {trend}</div>
      </div>
    </div>
  </div>
);

export default Dashboard;
