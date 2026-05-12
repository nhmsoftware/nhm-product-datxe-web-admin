import React, { useState } from 'react';
import { 
  Search, Filter, ShieldAlert, User, Car, AlertTriangle, 
  Info, History, Gavel, XCircle, CheckCircle, Clock,
  Calendar, ExternalLink, ShieldOff, AlertOctagon, MoreVertical,
  ChevronRight, Eye
} from 'lucide-react';

const ViolationList = () => {
  const [showDetail, setShowDetail] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [violations] = useState([
    {
      id: 'VL-701',
      subject: 'Lê Văn T',
      role: 'Driver',
      type: 'Thái độ không phù hợp',
      reason: 'Quát mắng khách hàng khi đang di chuyển và yêu cầu tip thêm tiền mặt trái quy định.',
      count: 2,
      created_at: '2026-05-12 11:10',
      status: 'WARNED',
      ride_id: 'RIDE-8892',
      phone: '0988123456'
    },
    {
      id: 'VL-702',
      subject: 'Trần Minh K',
      role: 'Customer',
      type: 'Spam đặt chuyến',
      reason: 'Đặt 5 chuyến liên tiếp rồi hủy không lý do trong vòng 15 phút, gây ảnh hưởng vận hành.',
      count: 3,
      created_at: '2026-05-12 09:40',
      status: 'SUSPENDED',
      ride_id: 'N/A',
      phone: '0977445566'
    }
  ]);

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

  const openDetail = (item) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'WARNED': return <span className="badge badge-warning"><AlertTriangle size={12} /> Cảnh cáo</span>;
      case 'SUSPENDED': return <span className="badge badge-error"><ShieldOff size={12} /> Đã khóa</span>;
      case 'CLEARED': return <span className="badge badge-success"><CheckCircle size={12} /> Đã gỡ</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ padding: '2rem' }}>
      {/* Header with Toolbelt */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
        <div>
          <h1 className="page-title">Nhật ký Vi phạm & Kỷ luật</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>Theo dõi và thực thi các biện pháp xử phạt người dùng hệ thống</p>
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
              placeholder="Tìm tên người dùng, số điện thoại..." 
              style={{ background: 'none', border: 'none', color: 'var(--text)', marginLeft: '0.75rem', width: '100%', outline: 'none', fontSize: '0.95rem' }} 
            />
          </div>
          <button className="btn btn-glass" style={{ borderRadius: '16px' }}><History size={18} /> Lịch sử</button>
        </div>
      </div>

      {/* Rules Banner */}
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
          className="btn btn-premium" 
          style={{ 
            background: 'rgba(255, 255, 255, 0.05)', 
            border: '1px solid var(--border)', 
            color: 'var(--text)',
            padding: '0.75rem 1.5rem',
            boxShadow: 'none'
          }}
        >
          Chi tiết quy định <ChevronRight size={18} />
        </button>
      </div>

      {/* Main Content Table */}
      <div className="card glass animate-slide-up" style={{ borderRadius: '24px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
              <th style={thStyle}>Mã VP</th>
              <th style={thStyle}>Đối tượng</th>
              <th style={thStyle}>Loại vi phạm</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Số lần VP</th>
              <th style={thStyle}>Trạng thái</th>
              <th style={thStyle}>Ngày ghi nhận</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {violations.map((item) => (
              <tr key={item.id} className="row-hover" style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={tdStyle}><span style={{ color: 'var(--error)', fontWeight: 800 }}>{item.id}</span></td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{ 
                      width: '44px', height: '44px', borderRadius: '12px', 
                      background: 'var(--bg-soft)', border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' 
                    }}>
                      {item.role === 'Driver' ? <Car size={20} /> : <User size={20} />}
                    </div>
                    <div>
                      <div style={{ color: 'var(--text)', fontWeight: 700 }}>{item.subject}</div>
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.role} • {item.phone}</small>
                    </div>
                  </div>
                </td>
                <td style={tdStyle}><span style={violationBadgeStyle}>{item.type}</span></td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{ 
                    ...countBadgeStyle,
                    background: item.count >= 3 ? 'var(--error)' : 'var(--bg-soft)',
                    border: `1px solid ${item.count >= 3 ? 'var(--error)' : 'var(--border)'}`,
                    boxShadow: item.count >= 3 ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none',
                    color: item.count >= 3 ? '#fff' : 'var(--text)'
                  }}>
                    {item.count}
                  </span>
                </td>
                <td style={tdStyle}>{getStatusBadge(item.status)}</td>
                <td style={tdStyle}><span style={{ color: 'var(--text-muted)' }}>{item.created_at}</span></td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button onClick={() => openDetail(item)} className="icon-btn" style={{ color: 'var(--primary)', borderColor: 'rgba(0, 73, 172, 0.2)' }} title="Xem hồ sơ">
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

      {/* Violation Detail Modal */}
      {showDetail && selectedItem && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowDetail(false)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '950px' }}>
            <div className="modal-header">
              <h2 style={{ color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 800 }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <ShieldAlert color="var(--error)" size={24} />
                </div>
                Hồ sơ kỷ luật {selectedItem.id}
              </h2>
              <button onClick={() => setShowDetail(false)} className="btn-icon">
                <XCircle size={24} />
              </button>
            </div>

            <div style={{ padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem' }}>
              <div>
                <h4 style={sectionTitleStyle}>Nội dung vi phạm chi tiết</h4>
                <div style={reasonBoxStyle}>
                  {selectedItem.reason}
                </div>

                <div className="glass" style={{ 
                  marginTop: '2rem', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.03)', 
                  borderRadius: '24px', border: '1px solid rgba(245, 158, 11, 0.1)' 
                }}>
                  <div style={{ color: 'var(--warning)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
                    <AlertOctagon size={20} /> Đề xuất xử lý hệ thống
                  </div>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem', lineHeight: 1.7 }}>
                    Dựa trên lịch sử <strong style={{ color: 'var(--text)' }}>{selectedItem.count} lần vi phạm</strong>, Admin nên thực hiện lệnh <strong style={{ color: selectedItem.count >= 3 ? 'var(--error)' : 'var(--warning)' }}>{selectedItem.count >= 3 ? 'Khóa tài khoản tạm thời (48h)' : 'Cảnh báo chính thức'}</strong> để đảm bảo quy chuẩn vận hành.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                  <button className="btn btn-primary" style={{ flex: 1, background: 'var(--error)', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.2)', borderRadius: '16px', height: '54px' }}>
                    <ShieldOff size={20} /> Khóa tài khoản
                  </button>
                  <button className="btn btn-glass" style={{ flex: 1, borderRadius: '16px', height: '54px' }}>
                    <CheckCircle size={20} /> Bỏ qua & Lưu vết
                  </button>
                </div>
              </div>

              <div style={sidebarBoxStyle}>
                <h4 style={{ color: 'var(--text)', marginBottom: '1.75rem', fontSize: '1.1rem', fontWeight: 800 }}>Thông tin đối tượng</h4>
                
                <div style={metaRowStyle}>
                  <div style={metaIconStyle}><User size={18} /></div>
                  <div>
                    <div style={metaLabelStyle}>Họ và tên</div>
                    <div style={metaValueStyle}>{selectedItem.subject}</div>
                  </div>
                </div>

                <div style={metaRowStyle}>
                  <div style={{ ...metaIconStyle, color: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)' }}><AlertTriangle size={18} /></div>
                  <div>
                    <div style={metaLabelStyle}>Mức độ vi phạm</div>
                    <div style={{ ...metaValueStyle, color: 'var(--error)' }}>Cấp độ {selectedItem.count}</div>
                  </div>
                </div>

                <div style={metaRowStyle}>
                  <div style={{ ...metaIconStyle, color: 'var(--primary)', background: 'rgba(0, 73, 172, 0.1)' }}><ExternalLink size={18} /></div>
                  <div>
                    <div style={metaLabelStyle}>Chuyến xe liên quan</div>
                    <div style={{ ...metaValueStyle, color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer' }}>{selectedItem.ride_id}</div>
                  </div>
                </div>

                <div style={metaRowStyle}>
                  <div style={metaIconStyle}><Calendar size={18} /></div>
                  <div>
                    <div style={metaLabelStyle}>Ngày ghi nhận</div>
                    <div style={metaValueStyle}>{selectedItem.created_at}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Regulations Modal */}
      {showRules && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && setShowRules(false)}>
          <div className="modal-content animate-slide-up" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2 style={{ color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem', fontWeight: 800 }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0, 73, 172, 0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Gavel color="var(--primary)" size={24} />
                </div>
                Chi tiết Quy định Kỷ luật
              </h2>
              <button onClick={() => setShowRules(false)} className="btn-icon">
                <XCircle size={24} />
              </button>
            </div>
            
            <div style={{ padding: '2.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {regulations.map((reg, idx) => (
                <div key={idx} style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }}></div>
                    {reg.title}
                  </h3>
                  
                  {Array.isArray(reg.content) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {reg.content.map((item, i) => (
                        <div key={i} className="glass" style={{ padding: '1.25rem', borderRadius: '16px', background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{item.level || item.step}</span>
                            {item.level === 'Nghiêm trọng' && <span className="badge badge-error" style={{ fontSize: '0.65rem' }}>Cực kỳ quan trọng</span>}
                          </div>
                          {item.items ? (
                            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                              {item.items.map((li, j) => <li key={j}>{li}</li>)}
                            </ul>
                          ) : (
                            <div style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.punishment}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                      {reg.content}
                    </div>
                  )}
                </div>
              ))}
              
              <div style={{ 
                marginTop: '2rem', padding: '1.5rem', borderRadius: '20px', 
                background: 'rgba(0, 73, 172, 0.05)', border: '1px dashed var(--primary)',
                textAlign: 'center' 
              }}>
                <p style={{ color: 'var(--primary)', fontWeight: 600, margin: 0 }}>
                  Quy định này có hiệu lực kể từ ngày 01/01/2026 và áp dụng cho toàn bộ người dùng trên nền tảng.
                </p>
              </div>
            </div>
            
            <div className="modal-footer" style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid var(--border)', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setShowRules(false)} style={{ borderRadius: '12px' }}>
                Tôi đã hiểu
              </button>
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

// Styles
const thStyle = { padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', fontWeight: 800, borderBottom: '1px solid var(--border)' };
const tdStyle = { padding: '1.25rem 1.5rem', fontSize: '0.95rem' };
const violationBadgeStyle = { background: 'var(--bg-soft)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', border: '1px solid var(--border)', fontWeight: 600 };
const countBadgeStyle = { width: '34px', height: '34px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontWeight: 800 };

const sectionTitleStyle = { color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1.5px', marginBottom: '1rem', fontWeight: 700 };
const reasonBoxStyle = { background: 'rgba(239, 68, 68, 0.03)', padding: '1.5rem', borderRadius: '24px', color: 'var(--text)', lineHeight: 1.8, fontSize: '1rem', border: '1px solid rgba(239, 68, 68, 0.08)' };
const sidebarBoxStyle = { background: 'var(--bg-soft)', padding: '2rem', borderRadius: '32px', border: '1px solid var(--border)' };
const metaRowStyle = { display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.75rem' };
const metaIconStyle = { width: '40px', height: '40px', borderRadius: '12px', background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' };
const metaLabelStyle = { color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 };
const metaValueStyle = { color: 'var(--text)', fontWeight: 700, marginTop: '0.15rem' };

export default ViolationList;

