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
  X,
  Store
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
                if (new Date(tempStart) > new Date(tempEnd)) {
                  toast.error('Từ ngày không được lớn hơn Đến ngày');
                  return;
                }
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
    
    const keyTranslations = {
      // General / Revenue
      period: 'Khoảng thời gian',
      gmv: 'Tổng giao dịch (GMV)',
      actual_revenue: 'Doanh thu thực',
      order_count: 'Số chuyến xe',
      aov: 'Giá trị trung bình (AOV)',
      
      // Area
      area: 'Khu vực',
      total_rides: 'Số chuyến',
      total_revenue: 'Doanh thu',
      
      // Commission
      driver_group_type: 'Mã nhóm tài xế',
      system_commission: 'Hoa hồng hệ thống',
      group_label: 'Đội xe',
      
      // Top Drivers / Drivers
      driver_id: 'Mã tài xế',
      driver_name: 'Tên tài xế',
      
      // Operational ("Van hanh")
      total_orders: 'Tổng số đơn',
      completed_orders: 'Đơn hoàn thành',
      cancelled_orders: 'Đơn bị hủy',
      completion_rate: 'Tỷ lệ hoàn thành (%)',
      cancellation_rate: 'Tỷ lệ hủy (%)',
      status_distribution: 'Phân bổ trạng thái',
      cancel_reasons: 'Chi tiết lý do hủy',

      // Nested keys inside arrays/objects
      cancel_reason: 'Lý do',
      count: 'Số lượng'
    };

    const statusLabels = {
      '1': 'Đang tạo',
      '2': 'Đang chờ',
      '3': 'Đã tiếp nhận',
      '4': 'Đang di chuyển',
      '5': 'Hoàn thành',
      '6': 'Đã hủy',
      '7': 'Đang di chuyển (Đã đón khách)',
      '8': 'Đang chờ xác nhận hủy',
      'draft': 'Đang tạo',
      'pending': 'Đang chờ',
      'accepted': 'Đã tiếp nhận',
      'in_progress': 'Đang di chuyển',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
      'picked_up': 'Đang di chuyển (Đã đón khách)',
      'cancellation_requested': 'Đang chờ xác nhận hủy'
    };

    const formatVal = (key, val) => {
      if (val === null || val === undefined) return '';
      
      // status_distribution translation
      if (key === 'status_distribution' && typeof val === 'object' && !Array.isArray(val)) {
        return '"' + Object.entries(val).map(([k, v]) => {
          const translatedKey = statusLabels[k] || k;
          return `${translatedKey}: ${v}`;
        }).join('; ').replace(/"/g, '""') + '"';
      }
      
      // cancel_reasons translation
      if (key === 'cancel_reasons' && Array.isArray(val)) {
        return '"' + val.map(item => {
          if (typeof item === 'object') {
            return Object.entries(item).map(([k, v]) => {
              const translatedKey = keyTranslations[k] || k;
              return `${translatedKey}: ${v}`;
            }).join(' ');
          }
          return String(item);
        }).join('; ').replace(/"/g, '""') + '"';
      }
      
      // Nested arrays
      if (Array.isArray(val)) {
        if (val.length > 0 && typeof val[0] === 'object') {
          return '"' + val.map(item => 
            Object.entries(item).map(([k, v]) => {
              const translatedKey = keyTranslations[k] || k;
              return `${translatedKey}: ${v}`;
            }).join(' ')
          ).join('; ').replace(/"/g, '""') + '"';
        }
        return '"' + val.join('; ').replace(/"/g, '""') + '"';
      }
      
      // Nested objects
      if (typeof val === 'object') {
        return '"' + Object.entries(val).map(([k, v]) => {
          const translatedKey = keyTranslations[k] || k;
          return `${translatedKey}: ${v}`;
        }).join('; ').replace(/"/g, '""') + '"';
      }
      
      // Strings/numbers
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const exportData = Array.isArray(data) ? data : [data];
    const rawKeys = Object.keys(exportData[0] || {});
    const headers = rawKeys.map(k => keyTranslations[k] || k).join(',');
    
    const rows = exportData.map(obj => 
      rawKeys.map(key => {
        const val = obj[key];
        return formatVal(key, val);
      }).join(',')
    ).join('\n');
    
    // Generate explanation / tips note ("Mách nước")
    let notes = '';
    const cleanTitle = title.toLowerCase().trim();
    if (cleanTitle === 'van hanh' || cleanTitle === 'vận hành') {
      notes = '\n\n' + [
        '"--- MÁCH NƯỚC HƯỚNG DẪN ĐỌC CHỈ SỐ VẬN HÀNH ---"',
        '"1. Tổng số đơn: Tổng số chuyến xe được tạo trong khoảng thời gian lọc."',
        '"2. Đơn hoàn thành: Số chuyến xe đã kết thúc hành trình và thanh toán thành công."',
        '"3. Đơn bị hủy: Số chuyến xe bị khách hàng hoặc tài xế hủy."',
        '"4. Tỷ lệ hoàn thành (%): Tỷ lệ chuyến xe hoàn thành trên tổng số đơn. Công thức tính: (Đơn hoàn thành / Tổng số đơn) x 100%."',
        '"5. Tỷ lệ hủy (%): Tỷ lệ chuyến xe bị hủy trên tổng số đơn. Công thức tính: (Đơn bị hủy / Tổng số đơn) x 100%."',
        '"6. Phân bổ trạng thái: Số lượng đơn hàng chia chi tiết theo trạng thái thực tế hệ thống (Đang chờ; Đã nhận; Hoàn thành; Đã hủy; ...)."',
        '"7. Chi tiết lý do hủy: Bảng tổng hợp số lượng đơn bị hủy theo từng nguyên nhân cụ thể."'
      ].join('\n');
    } else if (cleanTitle === 'doanh thu') {
      notes = '\n\n' + [
        '"--- MÁCH NƯỚC HƯỚNG DẪN ĐỌC CHỈ SỐ DOANH THU ---"',
        '"1. GMV (Gross Merchandise Value): Tổng giá trị giao dịch phát sinh (giá trị gốc của các chuyến xe trước khi trừ khuyến mãi)."',
        '"2. Doanh thu thực: Doanh thu sau khi đã trừ đi các khoản khuyến mãi, chiết khấu và mã giảm giá."',
        '"3. Số chuyến xe: Tổng số chuyến xe đã hoàn thành trong kỳ."',
        '"4. AOV (Average Order Value): Giá trị trung bình của mỗi chuyến xe. Công thức tính: Tổng GMV / Số chuyến xe."'
      ].join('\n');
    } else if (cleanTitle === 'hoa hong' || cleanTitle === 'hoa hồng') {
      notes = '\n\n' + [
        '"--- MÁCH NƯỚC HƯỚNG DẪN ĐỌC CHỈ SỐ HOA HỒNG ---"',
        '"1. Hoa hồng hệ thống: Số tiền dịch vụ (phí chiết khấu) hệ thống thu từ các chuyến đi hoàn thành."',
        '"2. Tổng giao dịch (GMV): Tổng số tiền khách hàng trả cho tài xế trước khi trừ chiết khấu."',
        '"3. Phân loại đội xe:"',
        '"   - Đội xe nhà: Nhóm tài xế trực thuộc công ty quản lý."',
        '"   - Đối tác ngoài: Nhóm tài xế tự do ký kết hợp tác."'
      ].join('\n');
    } else if (cleanTitle === 'top tai xe' || cleanTitle === 'top tài xế') {
      notes = '\n\n' + [
        '"--- MÁCH NƯỚC HƯỚNG DẪN ĐỌC CHỈ SỐ TOP TÀI XẾ ---"',
        '"1. Số chuyến: Tổng số chuyến đi mà tài xế đã hoàn thành xuất sắc trong khoảng thời gian lọc."',
        '"2. Doanh thu: Tổng số tiền cước khách hàng thanh toán cho các chuyến đi của tài xế này."',
        '"3. Danh sách sắp xếp theo thứ tự giảm dần của Tổng doanh thu."'
      ].join('\n');
    } else if (cleanTitle === 'khu vuc' || cleanTitle === 'khu vực') {
      notes = '\n\n' + [
        '"--- MÁCH NƯỚC HƯỚNG DẪN ĐỌC CHỈ SỐ KHU VỰC ---"',
        '"1. Khu vực: Địa phương/Quận huyện được nhận dạng từ địa điểm đón khách của chuyến đi."',
        '"2. Số chuyến: Số chuyến đi bắt đầu từ khu vực này."',
        '"3. Doanh thu: Tổng doanh thu cước phát sinh từ các chuyến đi tại khu vực tương ứng."'
      ].join('\n');
    }

    const csvContent = headers + "\n" + rows + notes;
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${title.toLowerCase().replace(/ /g, '_')}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <div className="badge badge-success animate-pulse" style={{ marginTop: '0.5rem' }}><Activity size={12} /> Trực tiếp</div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <StatTile icon={<Users />} label="Người dùng" value={stats?.total_users || 0} trend="+12%" color="#4361ee" loading={loading} />
        <StatTile icon={<ShoppingBag />} label="Chuyến đi" value={stats?.total_orders || 0} trend="+8.5%" color="#f72585" loading={loading} />
        <StatTile icon={<Car />} label="Tài xế đang trực tuyến" value={stats?.active_drivers || 0} trend="+3.2%" color="#06d6a0" loading={loading} />
        <StatTile icon={<Store />} label="Cửa hàng hoạt động" value={stats?.active_merchants || 0} trend="+5.0%" color="#9c27b0" loading={loading} />
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
             <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'left', lineHeight: '1.4' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                   <span>💡</span> MÁCH NƯỚC CÔNG THỨC:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '4px' }}>
                   <div>• <strong>Tỷ lệ hoàn thành</strong> = (Số đơn hoàn thành / Tổng số đơn) × 100%</div>
                   <div>• <strong>Tỷ lệ hủy chuyến</strong> = (Số đơn bị hủy / Tổng số đơn) × 100%</div>
                   <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>* Lưu ý: Tổng hai tỷ lệ có thể không bằng 100% do có các đơn hàng ở trạng thái khác (đang chờ, đã nhận, đang đi, v.v.).</div>
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
