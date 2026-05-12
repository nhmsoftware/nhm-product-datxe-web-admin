import React, { useState } from 'react';
import { 
  Search, Filter, Banknote, CheckCircle, XCircle, Clock, 
  Download, DollarSign, Wallet, RefreshCcw,
  Calendar, User, ExternalLink, CreditCard, ArrowUpRight,
  ChevronRight, Eye, MoreVertical
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
      case 'PENDING': return <span className="badge badge-warning"><Clock size={12} /> Chờ duyệt</span>;
      case 'APPROVED': return <span className="badge badge-info"><CheckCircle size={12} /> Đã duyệt</span>;
      case 'COMPLETED': return <span className="badge badge-success"><CheckCircle size={12} /> Hoàn tất</span>;
      case 'REJECTED': return <span className="badge badge-error"><XCircle size={12} /> Từ chối</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ padding: '2rem' }}>
      {/* Header with Search & Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">Quản lý Hoàn tiền</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Theo dõi và phê duyệt các yêu cầu hoàn trả tài chính hệ thống</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="glass" style={{ 
            display: 'flex', alignItems: 'center', padding: '0.625rem 1.25rem', borderRadius: '16px',
            background: 'var(--bg-soft)', border: '1px solid var(--border)', minWidth: '350px',
            boxShadow: 'var(--shadow)'
          }}>
            <Search size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              placeholder="Tìm theo tên khách hàng hoặc mã RF..." 
              style={{ background: 'none', border: 'none', color: 'var(--text)', marginLeft: '0.75rem', width: '100%', outline: 'none', fontSize: '0.95rem' }} 
            />
          </div>
          <button className="btn btn-glass" style={{ borderRadius: '16px' }}>
            <Filter size={18} /> Lọc
          </button>
          <button className="btn btn-primary" style={{ borderRadius: '16px' }}>
            <Download size={18} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { label: 'Tổng hoàn tiền (Tháng)', value: '12,500,000đ', icon: <DollarSign />, color: 'var(--primary)', sub: '+15% so với tháng trước' },
          { label: 'Yêu cầu đang chờ', value: '08', icon: <RefreshCcw />, color: 'var(--warning)', sub: 'Cần xử lý trong 24h' },
          { label: 'Số dư ví hệ thống', value: '1.24 tỷ', icon: <Wallet />, color: 'var(--success)', sub: 'Trạng thái: An toàn' },
          { label: 'Tỷ lệ hoàn tiền', value: '1.2%', icon: <Banknote />, color: '#8b5cf6', sub: '-0.2% cải thiện' },
        ].map((stat, idx) => (
          <div key={idx} className="stat-card glass glass-hover" style={{
            padding: '1.75rem',
            borderRadius: '24px',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '14px', 
                background: stat.color === '#8b5cf6' ? 'rgba(139, 92, 246, 0.1)' : `rgba(${stat.color === 'var(--primary)' ? '0, 73, 172' : stat.color === 'var(--warning)' ? '183, 131, 0' : '0, 144, 106'}, 0.1)`, 
                color: stat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
              <ArrowUpRight size={20} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text)' }}>{stat.value}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem' }}>{stat.label}</div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: stat.sub.includes('+') ? 'var(--error)' : 'var(--success)', 
                marginTop: '1rem', 
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></div>
                {stat.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="card glass animate-slide-up" style={{ borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={thStyle}>Mã yêu cầu</th>
                <th style={thStyle}>Khách hàng</th>
                <th style={thStyle}>Số tiền</th>
                <th style={thStyle}>Phương thức</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Ngày tạo</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {refunds.map((item) => (
                <tr key={item.id} className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}><span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.id}</span></td>
                  <td style={tdStyle}>
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
                  <td style={tdStyle}><span style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1.05rem' }}>{formatCurrency(item.amount)}</span></td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      <CreditCard size={16} /> {item.payment_method}
                    </div>
                  </td>
                  <td style={tdStyle}>{getStatusBadge(item.status)}</td>
                  <td style={tdStyle}><span style={{ color: 'var(--text-muted)' }}>{item.created_at}</span></td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <button onClick={() => openDetail(item)} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                        Chi tiết
                      </button>
                      <button className="icon-btn">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Modal */}
      {showDetail && selectedItem && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowDetail(false)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '950px' }}>
            <div className="modal-header">
              <h2 style={{ color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 800 }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0, 73, 172, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Banknote color="var(--primary)" size={24} />
                </div>
                Phê duyệt Hoàn tiền {selectedItem.id}
              </h2>
              <button onClick={() => setShowDetail(false)} className="btn-icon">
                <XCircle size={24} />
              </button>
            </div>

            <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem' }}>
              <div>
                <h4 style={sectionTitleStyle}>Lý do hoàn trả hệ thống</h4>
                <div style={reasonBoxStyle}>
                  {selectedItem.reason}
                </div>

                <h4 style={{ ...sectionTitleStyle, marginTop: '2.5rem' }}>Phản hồi khách hàng (Gửi qua App)</h4>
                <textarea 
                  placeholder="Nhập nội dung giải thích cho khách hàng về việc hoàn tiền..."
                  style={textareaStyle}
                />

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, height: '54px', borderRadius: '16px', background: 'var(--success)', boxShadow: '0 8px 20px rgba(0, 144, 106, 0.2)' }}>
                    <CheckCircle size={20} /> Xác nhận hoàn tiền
                  </button>
                  <button className="btn btn-glass" style={{ flex: 1, height: '54px', borderRadius: '16px', color: 'var(--error)', borderColor: 'rgba(255, 77, 109, 0.2)' }}>
                    <XCircle size={20} /> Từ chối yêu cầu
                  </button>
                </div>
              </div>

              <div style={sidebarBoxStyle}>
                <h4 style={{ color: 'var(--text)', marginBottom: '1.75rem', fontSize: '1.1rem', fontWeight: 800 }}>Tóm tắt tài chính</h4>
                
                <div style={metaRowStyle}>
                  <div style={metaIconStyle}><User size={18} /></div>
                  <div>
                    <div style={metaLabelStyle}>Khách hàng</div>
                    <div style={{ color: 'var(--text)', fontWeight: 700 }}>{selectedItem.customer}</div>
                  </div>
                </div>

                <div style={metaRowStyle}>
                  <div style={{ ...metaIconStyle, color: 'var(--success)', background: 'rgba(0, 144, 106, 0.1)' }}><Banknote size={18} /></div>
                  <div>
                    <div style={metaLabelStyle}>Số tiền hoàn</div>
                    <div style={{ color: 'var(--success)', fontSize: '1.35rem', fontWeight: 800 }}>{formatCurrency(selectedItem.amount)}</div>
                  </div>
                </div>

                <div style={metaRowStyle}>
                  <div style={{ ...metaIconStyle, color: 'var(--primary)', background: 'rgba(0, 73, 172, 0.1)' }}><RefreshCcw size={18} /></div>
                  <div>
                    <div style={metaLabelStyle}>Liên kết chuyến xe</div>
                    <div style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'underline', cursor: 'pointer' }}>
                      {selectedItem.ride_id} <ExternalLink size={14} />
                    </div>
                  </div>
                </div>

                <div className="glass" style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(0, 73, 172, 0.03)', borderRadius: '20px', border: '1px solid rgba(0, 73, 172, 0.1)' }}>
                  <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <Wallet size={18} /> Nguồn hoàn tiền
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
                    Số tiền sẽ được trích xuất trực tiếp từ <strong>Ví tổng hệ thống</strong> và cộng vào <strong>Ví khách hàng</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 1rem; border-radius: 12px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
        .row-hover:hover { background: rgba(255, 255, 255, 0.02); }
      `}} />
    </div>
  );
};

// Styles objects
const thStyle = { padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 800, borderBottom: '1px solid var(--border)' };
const tdStyle = { padding: '1.25rem 1.5rem', fontSize: '0.95rem' };

const sectionTitleStyle = { color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1.5px', marginBottom: '1rem', fontWeight: 700 };
const reasonBoxStyle = { background: 'var(--bg-soft)', padding: '1.5rem', borderRadius: '24px', color: 'var(--text)', lineHeight: 1.8, fontSize: '1rem', border: '1px solid var(--border)' };
const textareaStyle = { width: '100%', height: '140px', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.25rem', color: 'var(--text)', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s', resize: 'none' };
const sidebarBoxStyle = { background: 'var(--bg-soft)', padding: '2rem', borderRadius: '32px', border: '1px solid var(--border)' };
const metaRowStyle = { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.75rem' };
const metaIconStyle = { width: '40px', height: '40px', borderRadius: '12px', background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' };
const metaLabelStyle = { color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 };

export default RefundList;

