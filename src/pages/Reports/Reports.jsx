import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { 
  TrendingUp, 
  MapPin, 
  DollarSign, 
  Percent, 
  BarChart3, 
  Filter, 
  ArrowUpRight, 
  Calendar,
  Download,
  Activity,
  UserCheck,
  XCircle,
  Clock,
  PieChart,
  Grid
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    interval: 'day',
    vehicle_type: '',
    ride_type: ''
  });

  const [revenueData, setRevenueData] = useState([]);
  const [areaData, setAreaData] = useState([]);
  const [commissionData, setCommissionData] = useState({ summary: [], details: [] });
  const [orderStats, setOrderStats] = useState(null);
  const [detailedData, setDetailedData] = useState({ vehicle_types: [], ride_types: [] });
  const [vehicleTypes, setVehicleTypes] = useState([]);

  useEffect(() => {
    fetchData();
  }, [filters, activeTab]);

  useEffect(() => {
    const loadVehicleTypes = async () => {
      try {
        const response = await adminService.getVehicleTypes();
        setVehicleTypes(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error('Không thể tải danh mục loại xe', error);
      }
    };

    loadVehicleTypes();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {
        start_date: filters.start_date,
        end_date: filters.end_date,
        interval: filters.interval,
        vehicle_type: filters.vehicle_type,
        ride_type: filters.ride_type
      };

      if (activeTab === 'revenue') {
        const [revRes, detRes] = await Promise.all([
            adminService.getRevenueReport(params),
            adminService.getDetailedReport(params)
        ]);
        setRevenueData(revRes.data || []);
        setDetailedData(detRes.data || { vehicle_types: [], ride_types: [] });
      } else if (activeTab === 'area') {
        const res = await adminService.getAreaReport(params);
        setAreaData(res.data || []);
      } else if (activeTab === 'commission') {
        const res = await adminService.getCommissionReport(params);
        setCommissionData(res.data || { summary: [], details: [] });
      } else if (activeTab === 'orders') {
        const res = await adminService.getOrderReport(params);
        setOrderStats(res.data || null);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
  };

  const getVehicleLabel = (type) => {
    const matched = vehicleTypes.find((item) => Number(item.id) === Number(type));
    if (matched) return matched.name_vi;

    const labels = { 1: 'Xe máy', 2: 'Ô tô 4 chỗ', 3: 'Ô tô 7 chỗ', 4: 'Ô tô 9 chỗ', 5: 'Xe ghép', 6: 'Lái hộ' };
    return labels[type] || `Loại ${type}`;
  };

  const getRideTypeLabel = (type) => {
    const labels = { 1: 'Standard', 2: 'Intercity', 3: 'Airport', 4: 'Delivery' };
    return labels[type] || `Dịch vụ ${type}`;
  };

  // --- Chart Configurations ---

  const revenueChartOptions = {
    chart: { id: 'revenue-line', toolbar: { show: false }, fontFamily: 'Be Vietnam Pro' },
    colors: ['#4361ee', '#f72585'],
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories: revenueData.map(d => d.period) },
    tooltip: { y: { formatter: (val) => formatVND(val) } }
  };

  const vehicleChartOptions = {
    chart: { type: 'donut', fontFamily: 'Be Vietnam Pro' },
    labels: detailedData.vehicle_types.map(d => getVehicleLabel(d.vehicle_type)),
    colors: ['#4361ee', '#3a0ca3', '#4895ef', '#4cc9f0'],
    legend: { position: 'bottom' }
  };

  const rideTypeChartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Be Vietnam Pro' },
    plotOptions: { bar: { distributed: true, borderRadius: 4 } },
    xaxis: { categories: detailedData.ride_types.map(d => getRideTypeLabel(d.ride_type)) },
    colors: ['#4361ee', '#f72585', '#4cc9f0', '#7209b7'],
    legend: { show: false }
  };

  return (
    <div className="reports-page animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">Phân tích Chuyên sâu</h1>
          <p style={{ color: 'var(--text-muted)' }}>Theo dõi hiệu quả kinh doanh đa chiều và tối ưu hóa vận hành.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-glass" onClick={() => fetchData()}>
                <Clock size={18} /> Làm mới
            </button>
            <button className="btn btn-primary" onClick={() => window.print()}>
                <Download size={18} /> Xuất PDF
            </button>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="card glass animate-slide-up" style={{ marginBottom: '2rem', padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>KHOẢNG THỜI GIAN</label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="date" name="start_date" className="btn btn-glass" value={filters.start_date} onChange={handleFilterChange} style={{ flex: 1, padding: '0.5rem' }} />
            <span style={{ color: 'var(--border)' }}>-</span>
            <input type="date" name="end_date" className="btn btn-glass" value={filters.end_date} onChange={handleFilterChange} style={{ flex: 1, padding: '0.5rem' }} />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>CHU KỲ</label>
          <select name="interval" className="btn btn-glass" value={filters.interval} onChange={handleFilterChange} style={{ width: '100%', padding: '0.6rem' }}>
            <option value="day">Theo Ngày</option>
            <option value="month">Theo Tháng</option>
            <option value="year">Theo Năm</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>LOẠI XE</label>
          <select name="vehicle_type" className="btn btn-glass" value={filters.vehicle_type} onChange={handleFilterChange} style={{ width: '100%', padding: '0.6rem' }}>
            <option value="">Tất cả loại xe</option>
            <option value="1">Xe máy</option>
            <option value="2">Ô tô 4 chỗ</option>
            <option value="3">Ô tô 7 chỗ</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>DỊCH VỤ</label>
          <select name="ride_type" className="btn btn-glass" value={filters.ride_type} onChange={handleFilterChange} style={{ width: '100%', padding: '0.6rem' }}>
            <option value="">Tất cả dịch vụ</option>
            <option value="1">Standard</option>
            <option value="2">Intercity</option>
            <option value="3">Airport</option>
            <option value="4">Delivery</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button className={`tab-item ${activeTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveTab('revenue')}>
          <BarChart3 size={18} /> Doanh thu & Tăng trưởng
        </button>
        <button className={`tab-item ${activeTab === 'area' ? 'active' : ''}`} onClick={() => setActiveTab('area')}>
          <MapPin size={18} /> Phân tích Khu vực
        </button>
        <button className={`tab-item ${activeTab === 'commission' ? 'active' : ''}`} onClick={() => setActiveTab('commission')}>
          <Percent size={18} /> Đối soát Hoa hồng
        </button>
        <button className={`tab-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
          <Activity size={18} /> Hiệu quả Vận hành
        </button>
      </div>

      {/* Content Section */}
      <div className="report-content" style={{ minHeight: '500px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '1rem' }}>
            <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Đang xử lý dữ liệu lớn...</p>
          </div>
        ) : (
          <>
            {activeTab === 'revenue' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="stats-grid">
                  <StatCard label="Tổng GD (GMV)" value={formatVND(revenueData.reduce((acc, curr) => acc + parseFloat(curr.gmv), 0))} icon={<DollarSign />} color="var(--primary)" />
                  <StatCard label="Doanh thu Thực" value={formatVND(revenueData.reduce((acc, curr) => acc + parseFloat(curr.actual_revenue), 0))} icon={<TrendingUp />} color="var(--success)" />
                  <StatCard label="Số chuyến xe" value={revenueData.reduce((acc, curr) => acc + parseInt(curr.order_count), 0)} icon={<Grid />} color="var(--secondary)" />
                  <StatCard label="Giá trị TB (AOV)" value={formatVND(revenueData.length > 0 ? (revenueData.reduce((acc, curr) => acc + parseFloat(curr.gmv), 0) / revenueData.reduce((acc, curr) => acc + parseInt(curr.order_count), 0)) : 0)} icon={<TrendingUp />} color="var(--warning)" />
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '2rem', fontWeight: 800 }}>Biến động Doanh thu & GMV</h3>
                  <Chart options={revenueChartOptions} series={[{ name: 'GMV', data: revenueData.map(d => d.gmv) }, { name: 'Thực thu', data: revenueData.map(d => d.actual_revenue) }]} type="line" height={350} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                  <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Cơ cấu theo Loại xe</h3>
                    <Chart options={vehicleChartOptions} series={detailedData.vehicle_types.map(d => parseFloat(d.total_revenue))} type="donut" height={300} />
                  </div>
                  <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Doanh thu theo Dịch vụ</h3>
                    <Chart options={rideTypeChartOptions} series={[{ name: 'Doanh thu', data: detailedData.ride_types.map(d => d.total_revenue) }]} type="bar" height={300} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'area' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
                <div className="card" style={{ padding: '2rem' }}>
                  <h3 style={{ marginBottom: '2rem', fontWeight: 800 }}>Phân bổ Doanh thu Khu vực</h3>
                  <Chart options={{ ...revenueChartOptions, chart: { type: 'bar' }, xaxis: { categories: areaData.map(d => d.area) } }} series={[{ name: 'Doanh thu', data: areaData.map(d => d.total_revenue) }]} type="bar" height={400} />
                </div>
                <div className="card" style={{ padding: '0' }}>
                  <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontWeight: 800 }}>Bảng chi tiết Địa lý</h3>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Khu vực</th>
                          <th>Số chuyến</th>
                          <th>Doanh thu</th>
                          <th>Tỷ lệ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {areaData.map((row, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 600 }}>{row.area || 'Khác'}</td>
                            <td>{row.total_rides}</td>
                            <td style={{ fontWeight: 800 }}>{formatVND(row.total_revenue)}</td>
                            <td>{((row.total_revenue / areaData.reduce((a, c) => a + parseFloat(c.total_revenue), 0)) * 100).toFixed(1)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'commission' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="stats-grid">
                  {commissionData.summary.map((item, i) => (
                    <div key={i} className="card glass-hover" style={{ borderLeft: `4px solid ${item.driver_group_type == 1 ? 'var(--primary)' : 'var(--secondary)'}`, padding: '1.5rem' }}>
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.group_label}</p>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>{formatVND(item.system_commission)}</h2>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.8125rem' }}>
                        <span>Tổng GD:</span>
                        <span style={{ fontWeight: 700 }}>{formatVND(item.gmv)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: '0' }}>
                  <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontWeight: 800 }}>Chi tiết Đối soát Giao dịch</h3>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Mã chuyến</th>
                          <th>Tài xế</th>
                          <th>Tổng tiền</th>
                          <th>Hoa hồng</th>
                          <th>%</th>
                          <th>Ngày thu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {commissionData.details.map((row, i) => (
                          <tr key={i}>
                            <td style={{ fontWeight: 800, color: 'var(--primary)' }}>#{row.ride_id}</td>
                            <td>{row.driver_name}</td>
                            <td>{formatVND(row.total_amount)}</td>
                            <td style={{ color: 'var(--error)', fontWeight: 800 }}>{formatVND(row.commission_amount)}</td>
                            <td>{Math.round(row.commission_percent)}%</td>
                            <td>{new Date(row.completed_at).toLocaleDateString('vi-VN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && orderStats && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="stats-grid">
                  <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="stat-icon" style={{ background: 'rgba(6, 214, 160, 0.1)', color: 'var(--success)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck /></div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>HOÀN THÀNH</p>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{orderStats.completion_rate}%</h2>
                    </div>
                  </div>
                  <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div className="stat-icon" style={{ background: 'rgba(255, 77, 109, 0.1)', color: 'var(--error)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><XCircle /></div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800 }}>BỊ HỦY</p>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{orderStats.cancellation_rate}%</h2>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                  <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Trạng thái Đơn hàng</h3>
                    <Chart options={{ chart: { type: 'donut' }, labels: ['Hoàn thành', 'Bị hủy', 'Khác'], colors: ['#06d6a0', '#ff4d6d', '#ffb703'], legend: { position: 'bottom' } }} series={[orderStats.completed_orders, orderStats.cancelled_orders, orderStats.total_orders - orderStats.completed_orders - orderStats.cancelled_orders]} type="donut" height={300} />
                  </div>
                  <div className="card" style={{ padding: '2rem' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontWeight: 800 }}>Lý do Hủy chuyến Phổ biến</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {orderStats.cancel_reasons.map((reason, i) => (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.875rem' }}>
                            <span>{reason.cancel_reason}</span>
                            <span style={{ fontWeight: 800 }}>{reason.count}</span>
                          </div>
                          <div style={{ height: '8px', background: 'var(--bg-soft)', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: `${(reason.count / orderStats.cancelled_orders) * 100}%`, height: '100%', background: 'var(--error)' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }) => (
  <div className="card glass-hover" style={{ padding: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div>
        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>{value}</h2>
      </div>
      <div style={{ padding: '10px', background: `${color}15`, color: color, borderRadius: '10px' }}>
        {icon}
      </div>
    </div>
  </div>
);

export default Reports;
