import React, { useState } from 'react';
import { 
  Search, Filter, Eye, CheckCircle, XCircle, AlertCircle, 
  Clock, MoreVertical, MessageSquare, User, Car, Calendar,
  ArrowRight, ShieldCheck, Download, ChevronRight, ExternalLink
} from 'lucide-react';

const ComplaintList = () => {
  const [showDetail, setShowDetail] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [complaints] = useState([
    {
      id: 'CP-1001',
      sender: 'Nguyễn Văn A',
      sender_role: 'Customer',
      type: 'Thái độ tài xế',
      ride_id: 'RIDE-8892',
      status: 'PENDING',
      created_at: '2026-05-12 10:30',
      priority: 'HIGH',
      content: 'Tài xế đi quá nhanh và có thái độ quát mắng khi tôi yêu cầu đi chậm lại.',
      evidence: ['https://placehold.co/600x400/2563eb/white?text=Evidence+1']
    },
    {
      id: 'CP-1002',
      sender: 'Trần Thị B',
      sender_role: 'Driver',
      type: 'Khách hàng không trả tiền',
      ride_id: 'RIDE-8845',
      status: 'HANDLED',
      created_at: '2026-05-12 09:15',
      priority: 'MEDIUM',
      content: 'Khách hàng xuống xe và bỏ chạy không trả tiền mặt.',
      evidence: []
    }
  ]);

  const openDetail = (item) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-warning"><Clock size={12} /> Đang chờ</span>;
      case 'HANDLED':
        return <span className="badge badge-success"><CheckCircle size={12} /> Đã xử lý</span>;
      case 'REJECTED':
        return <span className="badge badge-error"><XCircle size={12} /> Từ chối</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ padding: '2rem' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Trung tâm Khiếu nại</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Quản lý và giải quyết các phản hồi từ khách hàng và đối tác</p>
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
              placeholder="Tìm mã khiếu nại, tên..." 
              style={{ background: 'none', border: 'none', color: 'var(--text)', marginLeft: '0.75rem', width: '100%', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>
          <button className="btn btn-glass" style={{ borderRadius: '16px' }}><Filter size={18} /> Lọc</button>
          <button className="btn btn-primary" style={{ borderRadius: '16px' }}><Download size={18} /> Xuất báo cáo</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        {[
          { label: 'Tổng khiếu nại', value: '1,284', icon: <MessageSquare />, color: 'var(--primary)', trend: '+12%' },
          { label: 'Đang chờ xử lý', value: '12', icon: <Clock />, color: 'var(--warning)', trend: '-2' },
          { label: 'Đã xử lý (Tháng)', value: '458', icon: <ShieldCheck />, color: 'var(--success)', trend: '+5%' },
          { label: 'Cần xử lý gấp', value: '03', icon: <AlertCircle />, color: 'var(--error)', trend: 'High' },
        ].map((stat, idx) => (
          <div key={idx} className="stat-card glass glass-hover" style={{
            padding: '1.75rem',
            borderRadius: '24px',
            background: 'var(--card)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '14px', 
                background: `rgba(${stat.color === 'var(--primary)' ? '0, 73, 172' : stat.color === 'var(--warning)' ? '183, 131, 0' : stat.color === 'var(--success)' ? '0, 144, 106' : '255, 77, 109'}, 0.1)`, 
                color: stat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {stat.icon}
              </div>
              <span style={{ 
                fontSize: '0.75rem', 
                fontWeight: 800, 
                padding: '0.35rem 0.75rem', 
                borderRadius: '8px',
                background: 'var(--bg-soft)',
                color: stat.trend.includes('+') ? 'var(--success)' : (stat.trend.includes('-') ? 'var(--warning)' : 'var(--error)')
              }}>
                {stat.trend}
              </span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{stat.value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginTop: '0.25rem' }}>{stat.label}</div>
            
            <div style={{ 
              position: 'absolute', 
              right: '-15px', 
              bottom: '-15px', 
              opacity: 0.03, 
              transform: 'scale(4)',
              color: 'var(--text)'
            }}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Card */}
      <div className="card glass animate-slide-up" style={{ borderRadius: '24px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={thStyle}>Mã KN</th>
                <th style={thStyle}>Người gửi</th>
                <th style={thStyle}>Loại khiếu nại</th>
                <th style={thStyle}>Chuyến xe</th>
                <th style={thStyle}>Ưu tiên</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Thời gian</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((item) => (
                <tr key={item.id} className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}><span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.id}</span></td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', 
                        background: 'var(--bg-soft)', border: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' 
                      }}>
                        {item.sender_role === 'Driver' ? <Car size={18} /> : <User size={18} />}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--text)', fontWeight: 700 }}>{item.sender}</span>
                        <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.sender_role}</small>
                      </div>
                    </div>
                  </td>
                  <td style={tdStyle}><span style={{ color: 'var(--text)', fontWeight: 500 }}>{item.type}</span></td>
                  <td style={tdStyle}><span style={{ color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>{item.ride_id}</span></td>
                  <td style={tdStyle}>
                    <span style={{ 
                      color: item.priority === 'HIGH' ? 'var(--error)' : 'var(--warning)',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 8px currentColor' }}></div>
                      {item.priority}
                    </span>
                  </td>
                  <td style={tdStyle}>{getStatusBadge(item.status)}</td>
                  <td style={tdStyle}><span style={{ color: 'var(--text-muted)' }}>{item.created_at}</span></td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <button onClick={() => openDetail(item)} className="icon-btn" style={{ color: 'var(--primary)', borderColor: 'rgba(0, 73, 172, 0.2)' }} title="Xem chi tiết">
                        <Eye size={18} />
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

      {/* Detail Modal */}
      {showDetail && selectedItem && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowDetail(false)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '1000px' }}>
            <div className="modal-header">
              <h2 style={{ color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 800 }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0, 73, 172, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <MessageSquare color="var(--primary)" size={24} />
                </div>
                Chi tiết Khiếu nại {selectedItem.id}
              </h2>
              <button onClick={() => setShowDetail(false)} className="btn-icon">
                <XCircle size={24} />
              </button>
            </div>

            <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem' }}>
              {/* Left Side: Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="info-section">
                  <h4 style={sectionTitleStyle}>Nội dung khiếu nại</h4>
                  <div style={contentBoxStyle}>
                    {selectedItem.content}
                  </div>
                </div>

                <div className="info-section">
                  <h4 style={sectionTitleStyle}>Bằng chứng đính kèm</h4>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    {selectedItem.evidence.length > 0 ? selectedItem.evidence.map((img, i) => (
                      <div key={i} className="hover-scale" style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                        <img src={img} alt="Evidence" style={{ width: '180px', height: '120px', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.3s' }} className="img-overlay">
                          <Eye color="#fff" />
                        </div>
                      </div>
                    )) : (
                      <div style={{ padding: '2rem', background: 'var(--bg-soft)', borderRadius: '16px', width: '100%', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
                        Không có hình ảnh đính kèm.
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, height: '54px', borderRadius: '16px' }}>
                    <CheckCircle size={20} /> Phê duyệt hoàn tiền
                  </button>
                  <button className="btn btn-glass" style={{ flex: 1, height: '54px', borderRadius: '16px', color: 'var(--error)', borderColor: 'rgba(255, 77, 109, 0.2)' }}>
                    <AlertCircle size={20} /> Cảnh báo tài xế
                  </button>
                </div>
              </div>

              {/* Right Side: Meta Info */}
              <div style={sidebarBoxStyle}>
                <h4 style={{ color: 'var(--text)', marginBottom: '1.75rem', fontSize: '1.1rem', fontWeight: 800 }}>Thông tin liên quan</h4>
                
                <div style={metaItemStyle}>
                  <div style={metaIconStyle}><User size={18} /></div>
                  <div>
                    <div style={metaLabelStyle}>Người khiếu nại</div>
                    <div style={{ color: 'var(--text)', fontWeight: 700 }}>{selectedItem.sender}</div>
                    <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{selectedItem.sender_role}</small>
                  </div>
                </div>

                <div style={metaItemStyle}>
                  <div style={{ ...metaIconStyle, color: 'var(--primary)', background: 'rgba(0, 73, 172, 0.1)' }}><Car size={18} /></div>
                  <div>
                    <div style={metaLabelStyle}>Mã chuyến xe</div>
                    <div style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'underline', cursor: 'pointer' }}>
                      {selectedItem.ride_id} <ExternalLink size={14} />
                    </div>
                  </div>
                </div>

                <div style={metaItemStyle}>
                  <div style={metaIconStyle}><Calendar size={18} /></div>
                  <div>
                    <div style={metaLabelStyle}>Thời gian gửi</div>
                    <div style={{ color: 'var(--text)', fontWeight: 700 }}>{selectedItem.created_at}</div>
                  </div>
                </div>

                <div className="glass" style={{ marginTop: '2rem', padding: '1.25rem', background: 'rgba(239, 68, 68, 0.03)', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                  <div style={{ color: 'var(--error)', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <AlertCircle size={18} /> Tiền lệ vi phạm
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
                    Đối tượng này đã có <strong style={{ color: 'var(--error)' }}>2 lần</strong> bị khiếu nại tương tự trong 30 ngày qua.
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

const thStyle = { padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 800, borderBottom: '1px solid var(--border)' };
const tdStyle = { padding: '1.25rem 1.5rem', fontSize: '0.95rem' };

const sectionTitleStyle = { color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1.5px', marginBottom: '1rem', fontWeight: 700 };
const contentBoxStyle = { background: 'var(--bg-soft)', padding: '1.5rem', borderRadius: '24px', color: 'var(--text)', lineHeight: 1.8, fontSize: '1rem', border: '1px solid var(--border)' };
const sidebarBoxStyle = { background: 'var(--bg-soft)', padding: '2rem', borderRadius: '32px', border: '1px solid var(--border)' };
const metaItemStyle = { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.75rem' };
const metaIconStyle = { width: '40px', height: '40px', borderRadius: '12px', background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' };
const metaLabelStyle = { color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 };

export default ComplaintList;

