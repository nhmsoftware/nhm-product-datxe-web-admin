import React, { useState } from 'react';
import { 
  Search, Filter, Eye, CheckCircle, XCircle, AlertCircle, 
  Clock, MoreVertical, MessageSquare, User, Car, Calendar,
  ArrowRight, ShieldCheck, Download, ChevronRight, ExternalLink, X, ChevronLeft
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
    <div className="page-container" style={{ padding: '2rem' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Trung tâm Khiếu nại</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Quản lý và giải quyết các phản hồi từ khách hàng và đối tác.</p>
      </div>

      <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', borderRadius: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm mã khiếu nại, tên người gửi..." 
            style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', transition: 'var(--transition)' }}
            className="input-focus"
          />
        </div>
        <button className="btn btn-glass" style={{ borderRadius: '14px' }}>
          <Filter size={18} /> Lọc
        </button>
        <button className="btn btn-primary" style={{ borderRadius: '14px' }}>
          <Download size={18} /> Xuất báo cáo
        </button>
      </div>

      <div className="glass" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
        <div className="table-container">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-soft)' }}>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Mã KN</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Người gửi</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Loại khiếu nại</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Chuyến xe</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Ưu tiên</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Trạng thái</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Thời gian</th>
                <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((item) => (
                <tr key={item.id} className="glass-hover" style={{ borderBottom: '1px solid var(--border)', transition: 'all 0.2s' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}><span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.id}</span></td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
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
                  <td style={{ padding: '1.25rem 1.5rem' }}><span style={{ color: 'var(--text)', fontWeight: 500 }}>{item.type}</span></td>
                  <td style={{ padding: '1.25rem 1.5rem' }}><span style={{ color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>{item.ride_id}</span></td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
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
                  <td style={{ padding: '1.25rem 1.5rem' }}>{getStatusBadge(item.status)}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}><span style={{ color: 'var(--text-muted)' }}>{item.created_at}</span></td>
                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                      <button onClick={() => openDetail(item)} className="btn-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }} title="Xem chi tiết">
                        <Eye size={18} />
                      </button>
                      <button className="btn-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }} title="Khóa">
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
            Hiển thị <b>1 - {complaints.length}</b> trên tổng số <b>{complaints.length}</b> khiếu nại
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
                <User size={24} className="text-primary" /> Chi tiết khiếu lại
              </h2>
              <button className="btn-icon" onClick={() => setShowDetail(false)}><X size={20} /></button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center' }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '24px',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 10px 20px rgba(0, 77, 160, 0.2)'
                }}>
                  <User size={48} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{selectedItem.sender}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>ID: {selectedItem.id}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>{selectedItem.sender_role}</span>
                    <span className={`badge ${selectedItem.priority === 'HIGH' ? 'badge-error' : 'badge-warning'}`}>
                      {selectedItem.priority === 'HIGH' ? 'NGHIÊM TRỌNG' : 'TRUNG BÌNH'}
                    </span>
                    <span className={`badge ${selectedItem.status === 'PENDING' ? 'badge-warning' : 'badge-success'}`}>
                      {selectedItem.status === 'PENDING' ? 'CHỜ XỬ LÝ' : 'HOÀN TẤT'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Thông tin khiếu nại</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertCircle size={16} className="text-primary" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Loại khiếu nại</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedItem.type}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={16} className="text-primary" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ngày gửi</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{selectedItem.created_at.split(' ')[0]}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Thông tin chuyến xe</div>
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
                        <AlertCircle size={16} className="text-error" />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tiền lệ vi phạm</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--error)' }}>2 lần / 30 ngày</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Nội dung chi tiết</div>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--text)' }}>{selectedItem.content}</p>
              </div>

              <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', marginTop: '1.25rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Bằng chứng đính kèm</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {selectedItem.evidence.length > 0 ? selectedItem.evidence.map((img, i) => (
                    <div key={i} className="hover-scale" style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <img src={img} alt="Evidence" style={{ width: '100px', height: '65px', objectFit: 'cover' }} />
                    </div>
                  )) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Không có hình ảnh đính kèm.</div>
                  )}
                </div>
              </div>

              {selectedItem.status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', fontSize: '0.9rem' }}>
                    <CheckCircle size={18} /> Duyệt khiếu nại
                  </button>
                  <button className="btn btn-glass" style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.3)', fontSize: '0.9rem' }}>
                    <XCircle size={18} /> Từ chối
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .badge { display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.45rem 1rem; border-radius: 12px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
        .row-hover:hover { background: rgba(255, 255, 255, 0.02); }
        .badge-primary { background: rgba(0, 73, 172, 0.1); color: var(--primary); border: 1px solid rgba(0, 73, 172, 0.2); }
        .badge-error { background: rgba(239, 68, 68, 0.1); color: var(--error); border: 1px solid rgba(239, 68, 68, 0.2); }
        .badge-warning { background: rgba(245, 158, 11, 0.1); color: var(--warning); border: 1px solid rgba(245, 158, 11, 0.2); }
        .badge-success { background: rgba(16, 185, 129, 0.1); color: var(--success); border: 1px solid rgba(16, 185, 129, 0.2); }
      `}} />
    </div>
  );
};

export default ComplaintList;
