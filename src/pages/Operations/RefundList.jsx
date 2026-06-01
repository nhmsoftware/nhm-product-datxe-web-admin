import React, { useState } from 'react';
import { 
  Search, Filter, Eye, CheckCircle, XCircle, AlertCircle, 
  Clock, MoreVertical, Banknote, User, Car, Calendar,
  ArrowRight, ShieldCheck, Download, ChevronRight, ChevronLeft, ExternalLink, X,
  Wallet, CreditCard, RefreshCcw
} from 'lucide-react';

const RefundList = () => {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refunds] = useState([
    {
      id: 'RF-5501',
      customer: 'Nguyễn Văn A',
      amount: 55000,
      reason: 'Hủy chuyến sau khi đã thanh toán bằng ví điện tử. Khách hàng yêu cầu hoàn lại vào ví chính do lỗi hệ thống tự trừ tiền.',
      status: 'PENDING',
      created_at: '2026-05-12 10:45',
      ride_id: 'RIDE-8892',
      payment_method: 'E-Wallet',
      customer_phone: '0901234567'
    },
    {
      id: 'RF-5502',
      customer: 'Trần Thị H',
      amount: 120000,
      reason: 'Chuyến đi không thực hiện được do lỗi kết nối GPS từ phía hệ thống, tài xế không thể nhận điểm đón.',
      status: 'APPROVED',
      created_at: '2026-05-12 08:30',
      ride_id: 'RIDE-8812',
      payment_method: 'Credit Card',
      customer_phone: '0912233445'
    }
  ]);

  const openDetail = (item) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-warning"><Clock size={12} /> Chờ duyệt</span>;
      case 'APPROVED':
        return <span className="badge badge-info"><CheckCircle size={12} /> Đã duyệt</span>;
      case 'COMPLETED':
        return <span className="badge badge-success"><CheckCircle size={12} /> Hoàn tất</span>;
      case 'REJECTED':
        return <span className="badge badge-error"><XCircle size={12} /> Từ chối</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Quản lý Hoàn tiền</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Theo dõi và phê duyệt các yêu cầu hoàn trả tài chính hệ thống.</p>
      </div>

      <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', borderRadius: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm mã RF, tên khách hàng..." 
            style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', transition: 'var(--transition)' }}
            className="input-focus"
          />
        </div>
        <button className="btn btn-glass" style={{ borderRadius: '14px' }}>
          <Filter size={18} /> Lọc
        </button>
        <button className="btn btn-primary" style={{ borderRadius: '14px' }}>
          <Download size={18} /> Xuất Excel
        </button>
      </div>

      <div className="glass" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)' }}>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Mã RF</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Khách hàng</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Số tiền</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Phương thức</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Trạng thái</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Ngày tạo</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((item) => (
                <tr key={item.id} className="glass-hover" style={{ borderBottom: '1px solid var(--border)', transition: 'all 0.2s' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}><span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.id}</span></td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', 
                        background: 'var(--bg-soft)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' 
                      }}>
                        <User size={18} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--text)', fontWeight: 700 }}>{item.customer}</span>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.customer_phone}</small>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}><span style={{ color: 'var(--success)', fontWeight: 800 }}>{formatCurrency(item.amount)}</span></td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      <CreditCard size={16} /> {item.payment_method}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>{getStatusBadge(item.status)}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}><span style={{ color: 'var(--text-muted)' }}>{item.created_at}</span></td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <button onClick={() => openDetail(item)} className="btn-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }} title="Xem chi tiết">
                        <Eye size={18} />
                      </button>
                      <button className="btn-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }} title="Từ chối">
                        <XCircle size={18} />
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
            Hiển thị <b>1 - {refunds.length}</b> trên tổng số <b>{refunds.length}</b> yêu cầu
          </div>
          <div className="pagination-actions" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-page" disabled style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent' }}><ChevronLeft size={16} /></button>
            <button className="btn-page active" style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--primary)', color: 'white' }}>1</button>
            <button className="btn-page" disabled style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent' }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetail && selectedItem && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ maxWidth: '900px' }}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Banknote size={24} className="text-primary" /> Chi tiết hoàn tiền
              </h2>
              <button className="btn-icon" onClick={() => setShowDetail(false)}><X size={20} /></button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '24px',
                  background: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 10px 20px rgba(0, 144, 106, 0.2)'
                }}>
                  <Banknote size={48} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{selectedItem.customer}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>ID Yêu cầu: {selectedItem.id}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>{selectedItem.payment_method}</span>
                    <span className={`badge ${selectedItem.status === 'PENDING' ? 'badge-warning' : 'badge-success'}`}>
                      {selectedItem.status === 'PENDING' ? 'CHỜ DUYỆT' : 'ĐÃ XỬ LÝ'}
                    </span>
                    <span className="badge" style={{ background: 'rgba(0, 144, 106, 0.1)', color: 'var(--success)', border: '1px solid rgba(0, 144, 106, 0.2)' }}>
                      {formatCurrency(selectedItem.amount)}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Thông tin khách hàng</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={16} className="text-primary" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tên khách hàng</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedItem.customer}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={16} className="text-primary" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ngày yêu cầu</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedItem.created_at}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Chi tiết giao dịch</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <RefreshCcw size={16} className="text-primary" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Mã chuyến xe</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {selectedItem.ride_id} <ExternalLink size={10} />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={16} className="text-primary" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Phương thức thanh toán</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedItem.payment_method}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Lý do hoàn tiền</div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text)' }}>{selectedItem.reason}</p>
              </div>

              <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', marginTop: '1.25rem', background: 'rgba(0, 144, 106, 0.03)', border: '1px solid rgba(0, 144, 106, 0.1)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Wallet size={16} /> Nguồn hoàn tiền
                </div>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>
                  Số tiền sẽ được trích xuất trực tiếp từ <strong>Ví tổng hệ thống</strong> và cộng vào <strong>Ví khách hàng</strong> sau khi lệnh được phê duyệt.
                </p>
              </div>

              {selectedItem.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem', background: 'var(--success)', borderColor: 'var(--success)' }}>
                    <CheckCircle size={18} /> Xác nhận hoàn tiền
                  </button>
                  <button className="btn btn-glass" style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.3)', fontSize: '0.9rem' }}>
                    <XCircle size={18} /> Từ chối yêu cầu
                  </button>
                </div>
              )}
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
        .badge-info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border: 1px solid rgba(59, 130, 246, 0.2); }
      `}} />
    </div>
  );
};

export default RefundList;
