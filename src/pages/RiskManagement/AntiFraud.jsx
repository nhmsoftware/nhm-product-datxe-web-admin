import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Eye, 
  User, 
  Truck, 
  CreditCard, 
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  X,
  FileText,
  SlidersHorizontal
} from 'lucide-react';
import { riskService } from '../../services/riskService';
import { toast } from 'react-hot-toast';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';

const AntiFraud = () => {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20
  });
  const [filters, setFilters] = useState({
    keyword: '',
    risk_level: '',
    status: '',
    target_type: '',
    page: 1
  });
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, alertsRes] = await Promise.all([
        riskService.getOverview(),
        riskService.listAlerts({ ...filters, per_page: 20 })
      ]);
      setStats(statsRes.data || statsRes);
      
      // Robust data extraction for paginated results
      const alertsData = alertsRes.data || alertsRes;
      const alertsList = Array.isArray(alertsData.data) ? alertsData.data : (Array.isArray(alertsData) ? alertsData : []);
      setAlerts(alertsList);
      
      setPagination({
        current_page: alertsData.current_page || 1,
        last_page: alertsData.last_page || 1,
        total: alertsData.total || 0,
        per_page: alertsData.per_page || 20
      });
    } catch (error) {
      toast.error('Lỗi khi tải dữ liệu chống gian lận');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const getRiskBadge = (level) => {
    const configs = {
      1: { label: 'Thấp', class: 'bg-green-100 text-green-700' },
      2: { label: 'Trung bình', class: 'bg-amber-100 text-amber-700' },
      3: { label: 'Cao', class: 'bg-orange-100 text-orange-700' },
      4: { label: 'Nghiêm trọng', class: 'bg-red-100 text-red-700' }
    };
    const config = configs[level] || { label: 'N/A', class: 'bg-gray-100 text-gray-700' };
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.class}`}>{config.label}</span>;
  };

  const getStatusBadge = (status) => {
    const configs = {
      1: { label: 'Chờ xử lý', icon: <Clock size={14} />, class: 'text-amber-600 bg-amber-50' },
      2: { label: 'Đang điều tra', icon: <Search size={14} />, class: 'text-blue-600 bg-blue-50' },
      3: { label: 'Đã giải quyết', icon: <CheckCircle2 size={14} />, class: 'text-green-600 bg-green-50' },
      4: { label: 'Bị bác bỏ', icon: <X size={14} />, class: 'text-gray-500 bg-gray-50' }
    };
    const config = configs[status] || { label: 'N/A', icon: null, class: 'text-gray-500 bg-gray-50' };
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${config.class}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const getTargetIcon = (type) => {
    switch (type) {
      case 1: return <User size={16} className="text-blue-500" />;
      case 2: return <Truck size={16} className="text-orange-500" />;
      case 3: return <ShieldAlert size={16} style={{ color: 'var(--primary)' }} />;
      case 4: return <CreditCard size={16} className="text-green-500" />;
      default: return <AlertTriangle size={16} />;
    }
  };

  const chartData = stats?.risk_level_summary ? [
    { name: 'Thấp', value: parseInt(stats.risk_level_summary['1'] || 0), color: '#00906a' },
    { name: 'Trung bình', value: parseInt(stats.risk_level_summary['2'] || 0), color: '#b78300' },
    { name: 'Cao', value: parseInt(stats.risk_level_summary['3'] || 0), color: '#f97316' },
    { name: 'Nghiêm trọng', value: parseInt(stats.risk_level_summary['4'] || 0), color: '#ef4444' },
  ].filter(d => d.value > 0) : [];

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  return (
    <div className="anti-fraud-container">
      <div className="anti-fraud-header">
        <div className="header-info">
          <div className="header-icon">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h1>Hệ thống Chống Gian lận</h1>
            <p>Giám sát, phát hiện và xử lý các hành vi bất thường trong thời gian thực</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-action-premium secondary" onClick={() => toast.success('Đang mở bộ lọc nâng cao...')}>
            <SlidersHorizontal size={18} /> Lọc dữ liệu
          </button>
          <button className="btn-action-premium primary" onClick={() => toast.success('Đang xuất báo cáo định dạng PDF...')}>
            <FileText size={18} /> Xuất báo cáo
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card critical">
          <div className="stat-icon-wrapper"><AlertTriangle size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Cảnh báo hoạt động</span>
            <span className="stat-value">{stats?.active_alerts_count || 0}</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon-wrapper"><Search size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Rủi ro Nghiêm trọng</span>
            <span className="stat-value">{stats?.risk_level_summary['4'] || 0}</span>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon-wrapper"><ShieldCheck size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Tỷ lệ đã xử lý</span>
            <span className="stat-value">85%</span>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon-wrapper"><Clock size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">Thời gian phản hồi</span>
            <span className="stat-value">12m</span>
          </div>
        </div>
      </div>

      <div className="main-content-grid">
        <div className="chart-section shadow-premium">
          <h3 className="section-title"><Filter size={18} /> Phân bổ Rủi ro</h3>
          <div className="chart-container">
            <div style={{ width: '100%', height: '220px', minHeight: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="chart-legend">
            {chartData.map(d => (
              <div key={d.name} className="legend-item">
                <span className="dot" style={{ background: d.color }}></span>
                <span className="label">{d.name}:</span>
                <span className="value">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="table-section shadow-premium">
          <div className="section-header">
            <h3 className="section-title"><Clock size={18} /> Danh sách Cảnh báo</h3>
            <div className="table-filters">
              <div className="search-box-mini">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Tìm ID, đối tượng..." 
                  value={filters.keyword}
                  onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value, page: 1 }))}
                />
              </div>
              <select 
                value={filters.risk_level}
                onChange={(e) => setFilters(prev => ({ ...prev, risk_level: e.target.value, page: 1 }))}
                className="filter-select-mini"
              >
                <option value="">Mọi rủi ro</option>
                <option value="1">Thấp</option>
                <option value="2">Trung bình</option>
                <option value="3">Cao</option>
                <option value="4">Nghiêm trọng</option>
              </select>
              <select 
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="filter-select-mini"
              >
                <option value="">Mọi trạng thái</option>
                <option value="1">Chờ xử lý</option>
                <option value="2">Điều tra</option>
                <option value="3">Giải quyết</option>
                <option value="4">Bác bỏ</option>
              </select>
            </div>
          </div>

          <div className="table-responsive">
            <table className="premium-table">
              <thead>
                <tr>
                  <th>Đối tượng</th>
                  <th>Loại vi phạm</th>
                  <th>Mức độ</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-table-cell">
                      <div className="empty-state">
                        <ShieldAlert size={48} />
                        <p>Không có cảnh báo nào được tìm thấy</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  alerts.map(alert => (
                    <tr key={alert.id}>
                      <td>
                        <div className="target-cell">
                          <div className="target-icon">{getTargetIcon(alert.target_type)}</div>
                          <div>
                            <div className="target-id">{alert.target_id}</div>
                            <div className="target-type">{alert.target_type_label}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="fraud-type-cell">
                          <div className="main-type">{alert.fraud_type_label}</div>
                          <div className="sub-type">{alert.title}</div>
                        </div>
                      </td>
                      <td>{getRiskBadge(alert.risk_level)}</td>
                      <td>{getStatusBadge(alert.status)}</td>
                      <td className="time-cell">
                        {new Date(alert.detected_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-group">
                          <button 
                            onClick={() => {
                              setSelectedAlert(alert);
                              setShowDetailModal(true);
                            }}
                            className="btn-action primary-action"
                            title="Xem chi tiết"
                          >
                            <Eye size={18} />
                          </button>
                          {alert.status === 1 && (
                            <button 
                              className="btn-action success-action" 
                              title="Xử lý nhanh"
                              onClick={() => toast.success('Đã đưa vào danh sách xử lý nhanh')}
                            >
                              <ShieldCheck size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-wrapper">
            <div className="pagination-info">
              {pagination.total > 0 ? (
                <>Hiển thị <b>{(pagination.current_page - 1) * pagination.per_page + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)}</b> trên tổng số <b>{pagination.total}</b> cảnh báo</>
              ) : (
                <>Không có dữ liệu</>
              )}
            </div>
            <div className="pagination-actions">
              <button 
                className="btn-page" 
                disabled={pagination.current_page === 1}
                onClick={() => handlePageChange(pagination.current_page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              
              {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                let pageNum;
                if (pagination.last_page <= 5) pageNum = i + 1;
                else if (pagination.current_page <= 3) pageNum = i + 1;
                else if (pagination.current_page >= pagination.last_page - 2) pageNum = pagination.last_page - 4 + i;
                else pageNum = pagination.current_page - 2 + i;

                return (
                  <button 
                    key={pageNum}
                    className={`btn-page ${pagination.current_page === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button 
                className="btn-page"
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => handlePageChange(pagination.current_page + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDetailModal && selectedAlert && (
        <div className="modal-overlay">
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><ShieldAlert size={20} style={{ color: '#ef4444' }} /> Chi tiết Cảnh báo Gian lận</h2>
              <button className="btn-close" onClick={() => setShowDetailModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="alert-summary-box">
                <div className="summary-left">
                  <div className="summary-icon">{getTargetIcon(selectedAlert.target_type)}</div>
                  <div>
                    <span className="label">{selectedAlert.target_type_label}</span>
                    <div className="value">{selectedAlert.target_id}</div>
                  </div>
                </div>
                <div className="summary-right">
                  <span className="label">Mức độ rủi ro</span>
                  {getRiskBadge(selectedAlert.risk_level)}
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Loại hành vi</label>
                  <div className="detail-value behavior">{selectedAlert.fraud_type_label}</div>
                </div>
                <div className="detail-item">
                  <label>Trạng thái</label>
                  <div className="detail-value">{getStatusBadge(selectedAlert.status)}</div>
                </div>
              </div>

              <div className="detail-item">
                <label>Bằng chứng kỹ thuật</label>
                <div className="metadata-box">
                  <pre>{JSON.stringify(selectedAlert.evidence_metadata, null, 2)}</pre>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
              <div className="footer-actions">
                <button className="btn-warn" onClick={() => toast.success('Đã gửi cảnh báo tới đối tượng!')}>Cảnh cáo đối tượng</button>
                <button className="btn-primary" onClick={() => toast.success('Đang bắt đầu quy trình xử lý gian lận...')}>Xử lý ngay</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .anti-fraud-container {
          padding: 2rem;
          background: var(--bg);
          min-height: 100vh;
          font-family: 'Be Vietnam Pro', sans-serif;
        }

        .anti-fraud-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-action-premium {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 14px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
        }

        .btn-action-premium.secondary {
          background: var(--card);
          color: var(--text);
          border: 1px solid var(--border);
        }

        .btn-action-premium.secondary:hover {
          border-color: var(--primary);
          color: var(--primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .btn-action-premium.primary {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .btn-action-premium.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(99, 102, 241, 0.3);
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .header-icon {
          width: 60px;
          height: 60px;
          background: var(--card);
          color: var(--red);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 20px;
          box-shadow: var(--shadow);
          border: 1px solid var(--border);
        }

        .header-info h1 {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--text);
          margin: 0;
          letter-spacing: -0.02em;
        }

        .header-info p {
          color: var(--text-muted);
          margin: 0.25rem 0 0;
          font-weight: 500;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          background: var(--card);
          padding: 1.5rem;
          border-radius: 24px;
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 1.25rem;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow);
          border-color: var(--primary);
        }

        .stat-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-card.critical .stat-icon-wrapper { background: rgba(239, 68, 68, 0.1); color: var(--red); }
        .stat-card.warning .stat-icon-wrapper { background: rgba(245, 158, 11, 0.1); color: var(--amber); }
        .stat-card.success .stat-icon-wrapper { background: rgba(0, 144, 106, 0.1); color: var(--success); }
        .stat-card.info .stat-icon-wrapper { background: rgba(99, 102, 241, 0.1); color: var(--primary); }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text);
        }

        /* Layout Main */
        .main-content-grid {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 2rem;
        }

        @media (max-width: 1024px) {
          .main-content-grid { grid-template-columns: 1fr; }
        }

        .shadow-premium {
          background: var(--card);
          border-radius: 28px;
          border: 1px solid var(--border);
          padding: 1.75rem;
          box-shadow: var(--shadow);
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text);
          margin: 0 0 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .chart-container {
          height: 220px;
          margin-bottom: 1.5rem;
        }

        .chart-legend {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .legend-item .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-item .label { color: var(--text-muted); }
        .legend-item .value { color: var(--text); }

        /* Table Section */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header .section-title { margin: 0; }

        .btn-text {
          background: transparent;
          border: none;
          color: var(--primary);
          font-weight: 700;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-text:hover { transform: translateX(3px); }

        .premium-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .premium-table th {
          text-align: left;
          padding: 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid var(--border);
        }

        .premium-table td {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }

        .empty-table-cell { padding: 4rem 0 !important; }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: var(--text-muted); opacity: 0.5; }
        .empty-state p { font-weight: 600; font-size: 0.9rem; }

        .target-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .target-icon {
          width: 40px;
          height: 40px;
          background: var(--bg-soft);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .target-id { font-weight: 800; font-size: 0.9rem; color: var(--text); }
        .target-type { font-size: 0.75rem; color: var(--text-muted); }

        .main-type { font-weight: 700; font-size: 0.9rem; color: var(--text); margin-bottom: 2px; }
        .sub-type { font-size: 0.7rem; color: var(--text-muted); }

        .time-cell { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }

        .action-group { display: flex; gap: 0.85rem; justify-content: flex-end; }
        .btn-action {
          width: 36px;
          height: 36px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .primary-action { color: var(--primary); }
        .success-action { color: var(--success); }
        
        .btn-action svg {
          display: block !important;
          stroke: currentColor;
          width: 18px !important;
          height: 18px !important;
          min-width: 18px !important;
          min-height: 18px !important;
        }
        
        .btn-action:hover { 
          background: #f8fafc; 
          transform: translateY(-2px); 
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .primary-action:hover { border-color: var(--primary); }
        .success-action:hover { border-color: var(--success); }

        .table-filters { display: flex; gap: 0.75rem; align-items: center; }
        .search-box-mini { position: relative; display: flex; align-items: center; background: white; border-radius: 10px; padding: 0 0.75rem; border: 1px solid var(--border); }
        .search-box-mini input { border: none; background: transparent; padding: 0.5rem; font-size: 0.85rem; color: var(--text); outline: none; width: 140px; }
        .search-box-mini svg { color: var(--text-muted); }
        .filter-select-mini { background: white; border: 1px solid var(--border); border-radius: 10px; padding: 0.5rem; font-size: 0.85rem; color: var(--text); outline: none; cursor: pointer; transition: 0.2s; }
        .filter-select-mini:hover { border-color: var(--primary); background: #fbfdff; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1.5rem;
        }

        .modal-container {
          background: var(--card);
          width: 100%;
          max-width: 650px;
          border-radius: 32px;
          box-shadow: var(--shadow);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          border: 1px solid var(--border);
        }

        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }

        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--card);
        }

        .modal-header h2 { font-size: 1.25rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 0.75rem; color: var(--text); }

        .btn-close { background: var(--bg-soft); border: none; width: 36px; height: 36px; border-radius: 12px; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; }

        .modal-body { padding: 2rem; max-height: 70vh; overflow-y: auto; background: var(--card); }

        .alert-summary-box {
          background: var(--bg-soft);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          border: 1px solid var(--border);
        }

        .summary-left { display: flex; align-items: center; gap: 1.25rem; }
        .summary-icon { width: 50px; height: 50px; background: var(--card); border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow); border: 1px solid var(--border); }
        .summary-left .label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; }
        .summary-left .value { font-size: 1.25rem; font-weight: 800; color: var(--primary); }

        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem; }
        .detail-item label { display: block; font-size: 0.75rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.75rem; }
        .detail-value { padding: 1rem; background: var(--bg-soft); border-radius: 14px; font-weight: 700; border: 1px solid var(--border); color: var(--text); }
        .detail-value.behavior { color: var(--primary); background: rgba(0, 73, 172, 0.1); }

        .metadata-box { background: #0f172a; color: #38bdf8; padding: 1.5rem; border-radius: 16px; font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; overflow-x: auto; border: 1px solid rgba(255,255,255,0.1); }

        .modal-footer { padding: 1.5rem 2rem; background: var(--bg-soft); border-top: 1px solid var(--border); display: flex; justify-content: space-between; }

        .btn-secondary { background: var(--card); border: 1px solid var(--border); padding: 0.875rem 1.5rem; border-radius: 14px; font-weight: 700; cursor: pointer; color: var(--text-muted); }
        .btn-primary { background: var(--primary); color: white; border: none; padding: 0.875rem 1.5rem; border-radius: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 10px 20px rgba(0, 73, 172, 0.2); transition: all 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 25px rgba(0, 73, 172, 0.3); background: var(--primary-hover); }
        .btn-warn { background: rgba(183, 131, 0, 0.1); color: #b78300; border: 1px solid rgba(183, 131, 0, 0.2); padding: 0.875rem 1.5rem; border-radius: 14px; font-weight: 700; cursor: pointer; margin-right: 0.75rem; }

        .footer-actions { display: flex; }

        /* Pagination */
        .pagination-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .pagination-info {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .pagination-info b {
          color: var(--text);
        }

        .pagination-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-page {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-page:hover:not(:disabled) {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--bg-soft);
        }

        .btn-page.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
        }

        .btn-page:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .pagination-wrapper {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      ` }} />
    </div>
  );
};

export default AntiFraud;
