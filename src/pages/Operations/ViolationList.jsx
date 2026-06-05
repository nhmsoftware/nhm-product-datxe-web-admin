import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Eye, CheckCircle, XCircle, AlertCircle, 
  Clock, MoreVertical, ShieldAlert, User, Car, Calendar,
  ArrowRight, ShieldCheck, Download, ChevronRight, ChevronLeft, ExternalLink, X,
  Gavel, AlertTriangle, ShieldOff, AlertOctagon, History
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { riskService } from '../../services/riskService';
import Swal from 'sweetalert2';

const ViolationList = () => {
  const [showDetail, setShowDetail] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const ViolationTypeLabels = {
    'ATTITUDE': 'Thái độ không phù hợp',
    'CANCELLATION': 'Hủy chuyến sai quy định',
    'INCOMPLETE_TRIP': 'Không hoàn thành chuyến đi',
    'LATE_DELIVERY': 'Giao hàng trễ',
    'FRAUD': 'Gian lận',
    'SPAM_BOOKING': 'Spam đặt chuyến',
    'VOUCHER_ABUSE': 'Lạm dụng khuyến mãi',
    'HARASSMENT': 'Quấy rối',
    'OTHER': 'Khác'
  };

  const getViolationTypeLabel = (type) => {
    return ViolationTypeLabels[type] || type;
  };

  const regulations = [
    {
      title: "I. Phân loại vi phạm",
      content: [
        { level: "Nhẹ", items: ["Thái độ chưa chuyên nghiệp", "Giao tiếp thiếu lịch sự lần đầu", "Hủy chuyến có lý do nhưng sát giờ"] },
        { level: "Trung bình", items: ["Tự ý thu thêm phí ngoài App", "Đi sai lộ trình cố ý", "Sử dụng ngôn ngữ khiếm nhã", "Spam đặt/hủy chuyến"] },
        { level: "Nghiêm trọng", items: ["Hành vi đe dọa, xúc phạm thân thể", "Gian lận tài chính hệ thống", "Vi phạm pháp luật khi đang sử dụng dịch vụ"] }
      ]
    },
    {
      title: "II. Khung hình phạt (Quy tắc 3-5-7)",
      content: [
        { step: "Vi phạm lần 3", punishment: "Khóa tài khoản tạm thời 24h & trừ 50 điểm uy tín." },
        { step: "Vi phạm lần 5", punishment: "Khóa tài khoản 7 ngày & hoàn thành khóa đào tạo lại quy chuẩn." },
        { step: "Vi phạm lần 7", punishment: "Khóa tài khoản vĩnh viễn (Vô hiệu hóa số điện thoại trên toàn hệ thống)." }
      ]
    },
    {
      title: "III. Quy trình khiếu nại",
      content: "Người dùng có 48h kể từ khi nhận thông báo kỷ luật để gửi đơn khiếu nại qua 'Trung tâm hỗ trợ'. Admin sẽ phản hồi và ra quyết định cuối cùng trong vòng 24h làm việc."
    }
  ];

  const fetchViolations = async (page = 1) => {
    try {
      setLoading(true);
      const res = await riskService.listViolations({ page, per_page: 20 });
      const payload = res.data || {};
      
      setViolations(payload.data || []);
      
      if (payload.meta) {
        setCurrentPage(payload.meta.current_page || 1);
        setTotalPages(payload.meta.last_page || 1);
        setTotalRecords(payload.meta.total || 0);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách vi phạm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  const openDetail = (item) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const handleSuspend = async (item) => {
    const result = await Swal.fire({
      title: 'Khóa tài khoản?',
      html: `Thực hiện khóa tài khoản của <strong>${item.subject}</strong>. Hành động này có thể được hoàn tác.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Khóa ngay',
      cancelButtonText: 'Hủy',
    });
    if (result.isConfirmed) {
      toast.success(`Đã gửi lệnh khóa tài khoản: ${item.subject}`);
      setShowDetail(false);
      fetchViolations(currentPage);
    }
  };

  const handleDismiss = async (item) => {
    toast.success(`Đã bỏ qua và lưu vết vi phạm ID: ${item.id}`);
    setShowDetail(false);
  };

  const handleExportReport = () => {
    const headers = ['Mã VP', 'Đối tượng', 'Vai trò', 'Loại vi phạm', 'Số lần VP', 'Trạng thái', 'Ngày tạo'];
    const rows = violations.map(v => [
      v.id, v.subject, v.role, getViolationTypeLabel(v.type), v.count, v.status, v.created_at
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `violation-report-${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Xuất báo cáo thành công!');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'WARNED':
        return <span className="badge badge-warning"><AlertTriangle size={12} /> Cảnh cáo</span>;
      case 'SUSPENDED':
        return <span className="badge badge-error"><ShieldOff size={12} /> Đã khóa</span>;
      case 'CLEARED':
        return <span className="badge badge-success"><CheckCircle size={12} /> Đã gỡ</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Nhật ký Vi phạm & Kỷ luật</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Theo dõi và thực thi các biện pháp xử phạt người dùng hệ thống.</p>
      </div>

      <div className="glass glass-hover" style={{
        background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.02) 100%)', 
        borderColor: 'rgba(239, 68, 68, 0.2)',
        padding: '1.5rem 2rem', borderRadius: '24px', display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '2.5rem'
      }}>
        <div style={{ 
          background: 'var(--error)', 
          color: '#fff', 
          width: '56px', 
          height: '56px', 
          borderRadius: '16px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)' 
        }}>
          <Gavel size={28} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: 'var(--error)', margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Chính sách Kỷ luật (Quy tắc 3-5-7)</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.95rem' }}>
            Vi phạm lần 3: <span style={{ color: 'var(--text)', fontWeight: 600 }}>Khóa 24h</span> | Vi phạm lần 5: <span style={{ color: 'var(--text)', fontWeight: 600 }}>Khóa 7 ngày</span> | Vi phạm lần 7: <strong style={{ color: 'var(--error)' }}>Khóa vĩnh viễn</strong>.
          </p>
        </div>
        <button 
          onClick={() => setShowRules(true)}
          className="btn btn-glass" 
          style={{ 
            color: 'var(--text)',
            padding: '0.75rem 1.5rem',
          }}
        >
          Chi tiết quy định <ChevronRight size={18} />
        </button>
      </div>

      <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', borderRadius: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm tên người dùng, số điện thoại..." 
            style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', transition: 'var(--transition)' }}
            className="input-focus"
          />
        </div>
        <button className="btn btn-glass" style={{ borderRadius: '14px' }}>
          <Filter size={18} /> Lọc
        </button>
        <button className="btn btn-primary" style={{ borderRadius: '14px' }} onClick={handleExportReport}>
          <Download size={18} /> Xuất Báo cáo
        </button>
      </div>

      <div className="glass" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)' }}>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Mã VP</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Đối tượng</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Loại vi phạm</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Số lần VP</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Trạng thái</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Ngày tạo</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((item) => (
                <tr key={item.id} className="glass-hover" style={{ borderBottom: '1px solid var(--border)', transition: 'all 0.2s' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}><span style={{ color: 'var(--error)', fontWeight: 800 }}>{item.id}</span></td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', 
                        background: 'var(--bg-soft)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' 
                      }}>
                        {item.role === 'Driver' ? <Car size={18} /> : <User size={18} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--text)', fontWeight: 700 }}>{item.subject}</span>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.role} • {item.phone}</small>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--error)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600 }}>
                      {getViolationTypeLabel(item.type)}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                    <span style={{ 
                      width: '28px', height: '28px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                      background: item.count >= 3 ? 'var(--error)' : 'var(--bg-soft)',
                      color: item.count >= 3 ? '#fff' : 'var(--text)',
                      fontWeight: 700, fontSize: '0.85rem'
                    }}>
                      {item.count}
                    </span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>{getStatusBadge(item.status)}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}><span style={{ color: 'var(--text-muted)' }}>{item.created_at}</span></td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <button onClick={() => openDetail(item)} className="btn-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }} title="Xem chi tiết">
                        <Eye size={18} />
                      </button>
                      <button className="btn-icon" onClick={() => handleSuspend(item)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }} title="Khóa tài khoản">
                        <ShieldOff size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-wrapper" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Hiển thị <b>{violations.length > 0 ? (currentPage - 1) * 20 + 1 : 0} - {Math.min(currentPage * 20, totalRecords)}</b> trên tổng số <b>{totalRecords}</b> bản ghi
          </div>
          <div className="pagination-actions" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-page" disabled={currentPage === 1} onClick={() => fetchViolations(currentPage - 1)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent' }}><ChevronLeft size={16} /></button>
            <button className="btn-page active" style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--primary)', color: 'white' }}>{currentPage}</button>
            <button className="btn-page" disabled={currentPage >= totalPages} onClick={() => fetchViolations(currentPage + 1)} style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent' }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <ShieldAlert size={24} className="text-error" /> Hồ sơ kỷ luật
              </h2>
              <button className="btn-icon" onClick={() => setShowDetail(false)}><X size={20} /></button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '24px',
                  background: 'var(--error)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)'
                }}>
                  <User size={48} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{selectedItem.subject}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>ID Vi phạm: {selectedItem.id}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>{selectedItem.role}</span>
                    <span className="badge badge-error">VI PHẠM LẦN {selectedItem.count}</span>
                    <span className={`badge ${selectedItem.status === 'WARNED' ? 'badge-warning' : 'badge-error'}`}>
                      {selectedItem.status === 'WARNED' ? 'CẢNH CÁO' : 'ĐÃ KHÓA'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Thông tin đối tượng</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} className="text-primary" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Họ và tên</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedItem.subject}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={16} className="text-primary" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ngày ghi nhận</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedItem.created_at}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Chi tiết sự việc</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Car size={16} className="text-primary" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mã chuyến xe</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {selectedItem.ride_id} <ExternalLink size={10} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--error-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={16} className="text-error" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Loại vi phạm</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--error)' }}>{getViolationTypeLabel(selectedItem.type)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Nội dung chi tiết</div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text)' }}>{selectedItem.reason}</p>
              </div>

              <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', marginTop: '1.25rem', background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertOctagon size={16} /> Đề xuất xử lý hệ thống
                </div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                  Dựa trên lịch sử <strong>{selectedItem.count} lần vi phạm</strong>, đề xuất thực hiện lệnh <strong>{selectedItem.count >= 3 ? 'Khóa tài khoản (48h)' : 'Cảnh báo chính thức'}</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem', background: 'var(--error)', borderColor: 'var(--error)' }}
                  onClick={() => handleSuspend(selectedItem)}
                >
                  <ShieldOff size={18} /> Khóa tài khoản
                </button>
                <button
                  className="btn btn-glass"
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem' }}
                  onClick={() => handleDismiss(selectedItem)}
                >
                  <CheckCircle size={18} /> Bỏ qua &amp; Lưu vết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regulations Modal */}
      {showRules && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Gavel size={24} className="text-primary" /> Chi tiết quy định kỷ luật
              </h2>
              <button className="btn-icon" onClick={() => setShowRules(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              {regulations.map((reg, i) => (
                <div key={i} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', marginBottom: '1.25rem' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', fontWeight: 800 }}>{reg.title}</h4>
                  {Array.isArray(reg.content) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {reg.content.map((item, j) => (
                        <div key={j} style={{ background: 'var(--bg-soft)', padding: '1rem', borderRadius: '12px' }}>
                          <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>
                            {item.level || item.step}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                            {item.punishment || item.items.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{reg.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 1rem; border-radius: 12px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
        .badge-primary { background: rgba(0, 73, 172, 0.1); color: var(--primary); border: 1px solid rgba(0, 73, 172, 0.2); }
        .badge-error { background: rgba(239, 68, 68, 0.1); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.2); }
        .badge-warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.2); }
        .badge-success { background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); }
      `}} />
    </div>
  );
};

export default ViolationList;
