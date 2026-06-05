import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Plus, 
  Search, 
  Filter, 
  Settings2, 
  AlertTriangle, 
  UserX, 
  Ban, 
  MessageSquare, 
  Coins, 
  History,
  Edit2,
  Trash2,
  Power,
  X,
  CheckCircle2,
  ChevronRight,
  Gavel,
  Clock,
  ArrowRight
} from 'lucide-react';
import { riskService } from '../../services/riskService';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const ViolationTypeLabels = {
  1: 'Hủy chuyến quá nhiều',
  2: 'Gian lận voucher',
  3: 'Tạo đơn ảo',
  4: 'Không hoàn thành đơn',
  5: 'Spam đặt xe'
};

const ApplicableRoleLabels = {
  1: 'Tài xế',
  2: 'Khách hàng',
  3: 'Merchant'
};

const PenaltyTypeLabels = {
  1: 'Cảnh báo',
  2: 'Khóa tài khoản tạm thời',
  3: 'Khóa tài khoản vĩnh viễn',
  4: 'Phạt tiền',
  5: 'Giảm điểm uy tín'
};

const PenaltyRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentRule, setCurrentRule] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    violation_type: 1,
    applicable_role: 1,
    violation_threshold: 5,
    penalty_type: 1,
    penalty_duration: '',
    monetary_amount: '',
    reputation_points: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await riskService.listPenaltyRules();
      // res.data is the paginator object from backend (v1/admin/risk/penalty-rules)
      setRules(res.data.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách quy tắc');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setCurrentRule(null);
    setFormData({
      name: '',
      violation_type: 1,
      applicable_role: 1,
      violation_threshold: 5,
      penalty_type: 1,
      penalty_duration: '',
      monetary_amount: '',
      reputation_points: '',
      description: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (rule) => {
    setCurrentRule(rule);
    setFormData({
      name: rule.name,
      violation_type: rule.violation_type,
      applicable_role: rule.applicable_role,
      violation_threshold: rule.violation_threshold,
      penalty_type: rule.penalty_type,
      penalty_duration: rule.penalty_duration || '',
      monetary_amount: rule.monetary_amount || '',
      reputation_points: rule.reputation_points || '',
      description: rule.description || '',
      is_active: rule.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Frontend Validation
    if (!formData.name || !formData.violation_type || !formData.applicable_role || !formData.penalty_type) {
      return toast.error('Vui lòng nhập đầy đủ thông tin quy tắc.');
    }
    
    if (Number(formData.violation_threshold) < 1) {
      return toast.error('Số lần vi phạm không hợp lệ.');
    }

    try {
      if (currentRule) {
        await riskService.updatePenaltyRule(currentRule.id, formData);
        toast.success('Cập nhật quy tắc thành công');
      } else {
        await riskService.createPenaltyRule(formData);
        toast.success('Tạo quy tắc mới thành công');
      }
      setShowModal(false);
      fetchRules();
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        const firstError = Object.values(errorData.errors)[0][0];
        toast.error(firstError);
      } else {
        toast.error(errorData?.message || 'Có lỗi xảy ra');
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa quy tắc này?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      background: 'var(--card)',
      color: 'var(--text)',
      borderRadius: '24px',
      customClass: {
        popup: 'premium-swal-popup',
      }
    });

    if (result.isConfirmed) {
      try {
        await riskService.deletePenaltyRule(id);
        toast.success('Đã xóa quy tắc');
        fetchRules();
      } catch (error) {
        toast.error('Không thể xóa quy tắc');
      }
    }
  };

  const toggleStatus = async (rule) => {
    try {
      await riskService.togglePenaltyRuleStatus(rule.id, !rule.is_active);
      toast.success(`Đã ${!rule.is_active ? 'kích hoạt' : 'vô hiệu hóa'} quy tắc`);
      fetchRules();
    } catch (error) {
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  return (
    <div className="penalty-rules-page">
      <div className="page-header-container">
        <div className="header-left">
          <div className="header-icon-main">
            <Gavel size={28} />
          </div>
          <div>
            <h1 className="page-title">Quy tắc Xử phạt</h1>
            <p className="page-subtitle">Quản lý các tiêu chuẩn tự động chế tài hành vi vi phạm</p>
          </div>
        </div>
        <button className="btn btn-premium" onClick={handleCreate}>
          <Plus size={20} />
          Tạo quy tắc mới
        </button>
      </div>

      <div className="rules-grid">
        {loading ? (
          [1, 2, 3, 4].map(i => (
            <div key={i} className="rule-card skeleton-card">
              <div className="skeleton h-12 w-12 rounded-xl mb-4"></div>
              <div className="skeleton h-6 w-3/4 mb-2"></div>
              <div className="skeleton h-4 w-1/2 mb-4"></div>
              <div className="skeleton h-20 w-full rounded-xl"></div>
            </div>
          ))
        ) : rules.length === 0 ? (
          <div className="empty-state-full glass">
            <div className="empty-icon-wrapper">
              <ShieldAlert size={48} />
            </div>
            <h3>Chưa có quy tắc xử phạt</h3>
            <p>Hệ thống đang hoạt động mà không có tiêu chuẩn chế tài tự động. Hãy thêm quy tắc để bảo vệ hệ thống.</p>
            <button className="btn btn-primary mt-4" onClick={handleCreate}>
              <Plus size={20} /> Thêm ngay
            </button>
          </div>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className={`rule-card-premium glass ${!rule.is_active ? 'is-inactive' : ''}`}>
              <div className="rule-card-top">
                <div className={`rule-type-icon ${
                  rule.penalty_type === 3 ? 'danger' : (rule.penalty_type === 2 ? 'warning' : 'info')
                }`}>
                  {rule.penalty_type === 1 && <MessageSquare size={24} />}
                  {rule.penalty_type === 2 && <Clock size={24} />}
                  {rule.penalty_type === 3 && <Ban size={24} />}
                  {rule.penalty_type === 4 && <Coins size={24} />}
                  {rule.penalty_type === 5 && <History size={24} />}
                </div>
                
                <div className="rule-card-actions">
                  <button className="action-btn edit" onClick={() => handleEdit(rule)} title="Chỉnh sửa">
                    <Edit2 size={16} />
                  </button>
                  <button 
                    className={`action-btn toggle ${rule.is_active ? 'active' : ''}`} 
                    onClick={() => toggleStatus(rule)}
                    title={rule.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                  >
                    <Power size={16} />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(rule.id)} title="Xóa">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="rule-card-content">
                <div className="rule-badge-group">
                  <span className="premium-badge role">
                    <UserX size={12} /> {ApplicableRoleLabels[rule.applicable_role]}
                  </span>
                  <span className="premium-badge type">
                    {ViolationTypeLabels[rule.violation_type]}
                  </span>
                </div>
                
                <h3 className="rule-display-name">{rule.name}</h3>
                
                <div className="rule-logic-display">
                  <div className="logic-row">
                    <span className="logic-label">Điều kiện:</span>
                    <span className="logic-value">Vi phạm <b>{rule.violation_threshold}</b> lần</span>
                  </div>
                  <div className="logic-row highlight">
                    <span className="logic-label">Chế tài:</span>
                    <span className="logic-value-result">
                      {PenaltyTypeLabels[rule.penalty_type]}
                      {rule.penalty_type === 2 && rule.penalty_duration && <span className="duration">: {rule.penalty_duration} phút</span>}
                      {rule.penalty_type === 4 && rule.monetary_amount && <span className="duration">: {Number(rule.monetary_amount).toLocaleString()}đ</span>}
                      {rule.penalty_type === 5 && rule.reputation_points && <span className="duration">: -{rule.reputation_points} điểm</span>}
                    </span>
                  </div>
                </div>
                
                {rule.description && (
                  <p className="rule-desc-text">{rule.description}</p>
                )}
              </div>
              
              <div className="rule-card-footer">
                <div className="status-indicator">
                  <span className={`dot ${rule.is_active ? 'pulse' : ''}`}></span>
                  {rule.is_active ? 'Đang hoạt động' : 'Đang tạm dừng'}
                </div>
                <ChevronRight size={16} className="arrow-icon" />
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-root">
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
          <div className="modal-wrapper">
            <div className="modal-container-premium glass">
              <div className="modal-header-premium">
                <div className="header-title-box">
                  <div className="title-icon">
                    {currentRule ? <Edit2 size={20} /> : <Plus size={20} />}
                  </div>
                  <h2>{currentRule ? 'Cập nhật quy tắc' : 'Cấu hình quy tắc mới'}</h2>
                </div>
                <button className="close-modal-btn" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="premium-form">
                <div className="modal-scroll-area">
                  <div className="form-section">
                    <label className="premium-label">Tên quy tắc định danh</label>
                    <input 
                      type="text" 
                      className="premium-input" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="VD: Chế tài hủy chuyến dành cho Tài xế"
                      required
                    />
                  </div>

                  <div className="form-row-dual">
                    <div className="form-section">
                      <label className="premium-label">Đối tượng áp dụng</label>
                      <select 
                        className="premium-select"
                        value={formData.applicable_role}
                        onChange={e => setFormData({...formData, applicable_role: parseInt(e.target.value)})}
                      >
                        {Object.entries(ApplicableRoleLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-section">
                      <label className="premium-label">Loại vi phạm</label>
                      <select 
                        className="premium-select"
                        value={formData.violation_type}
                        onChange={e => setFormData({...formData, violation_type: parseInt(e.target.value)})}
                      >
                        {Object.entries(ViolationTypeLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row-dual">
                    <div className="form-section">
                      <label className="premium-label">Ngưỡng vi phạm (lần)</label>
                      <input 
                        type="number" 
                        className="premium-input" 
                        value={formData.violation_threshold}
                        onChange={e => setFormData({...formData, violation_threshold: parseInt(e.target.value)})}
                        min="1"
                        required
                      />
                    </div>
                    <div className="form-section">
                      <label className="premium-label">Hình thức xử phạt</label>
                      <select 
                        className="premium-select"
                        value={formData.penalty_type}
                        onChange={e => setFormData({...formData, penalty_type: parseInt(e.target.value)})}
                      >
                        {Object.entries(PenaltyTypeLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {formData.penalty_type === 2 && (
                    <div className="form-section animate-slide-down">
                      <label className="premium-label">Thời gian khóa tài khoản (phút)</label>
                      <div className="input-with-icon">
                        <Clock size={18} className="inner-icon" />
                        <input 
                          type="number" 
                          className="premium-input icon-padding" 
                          value={formData.penalty_duration}
                          onChange={e => setFormData({...formData, penalty_duration: e.target.value})}
                          placeholder="VD: 30, 60, 1440..."
                        />
                      </div>
                    </div>
                  )}

                  {formData.penalty_type === 4 && (
                    <div className="form-section animate-slide-down">
                      <label className="premium-label">Số tiền phạt ước tính (VNĐ)</label>
                      <div className="input-with-icon">
                        <Coins size={18} className="inner-icon" />
                        <input 
                          type="number" 
                          className="premium-input icon-padding" 
                          value={formData.monetary_amount}
                          onChange={e => setFormData({...formData, monetary_amount: e.target.value})}
                          placeholder="Nhập số tiền..."
                        />
                      </div>
                    </div>
                  )}

                  {formData.penalty_type === 5 && (
                    <div className="form-section animate-slide-down">
                      <label className="premium-label">Điểm uy tín trừ tối đa</label>
                      <div className="input-with-icon">
                        <History size={18} className="inner-icon" />
                        <input 
                          type="number" 
                          className="premium-input icon-padding" 
                          value={formData.reputation_points}
                          onChange={e => setFormData({...formData, reputation_points: e.target.value})}
                          placeholder="VD: 5, 10..."
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-section">
                    <label className="premium-label">Ghi chú & Mô tả chi tiết</label>
                    <textarea 
                      className="premium-textarea" 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Mô tả cụ thể về lý do và cách thức áp dụng quy tắc này..."
                    ></textarea>
                  </div>

                  <div className="form-toggle-section">
                    <label className="toggle-container">
                      <input 
                        type="checkbox" 
                        checked={formData.is_active}
                        onChange={e => setFormData({...formData, is_active: e.target.checked})}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <div className="toggle-text">
                      <span className="toggle-title">Kích hoạt quy tắc</span>
                      <p className="toggle-desc">Quy tắc sẽ có hiệu lực ngay lập tức sau khi lưu</p>
                    </div>
                  </div>
                </div>

                <div className="modal-footer-premium">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                  <button type="submit" className="btn-save">
                    {currentRule ? 'Cập nhật thay đổi' : 'Xác nhận cấu hình'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .penalty-rules-page {
          padding: 2.5rem;
          max-width: 1500px;
          margin: 0 auto;
          animation: pageFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes pageFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3.5rem;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-icon-main {
          width: 64px;
          height: 64px;
          background: var(--primary);
          color: white;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 25px rgba(0, 73, 172, 0.3);
        }

        .page-title {
          font-size: 2.25rem;
          font-weight: 850;
          margin: 0;
          letter-spacing: -0.03em;
          background: var(--text);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .page-subtitle {
          color: var(--text-muted);
          margin-top: 0.25rem;
          font-size: 1.05rem;
          font-weight: 500;
        }

        .rules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }

        .rule-card-premium {
          padding: 2rem;
          border-radius: 32px;
          border: 1px solid var(--border);
          background: var(--card);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .rule-card-premium:hover {
          transform: translateY(-10px);
          border-color: var(--primary);
          box-shadow: 0 25px 50px rgba(99, 102, 241, 0.15);
        }

        .rule-card-premium.is-inactive {
          opacity: 0.6;
          filter: grayscale(0.8);
        }

        .rule-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .rule-type-icon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rule-type-icon.info { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
        .rule-type-icon.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .rule-type-icon.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .rule-card-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          border: none;
          background: var(--bg-soft);
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover { background: var(--border); color: var(--primary); transform: scale(1.1); }
        .action-btn.toggle.active { color: #00906a; background: rgba(0, 144, 106, 0.1); }
        .action-btn.delete:hover { color: #ff4d6d; background: rgba(255, 77, 109, 0.1); }

        .rule-badge-group {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .premium-badge {
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .premium-badge.role { background: rgba(99, 102, 241, 0.08); color: var(--primary); border: 1px solid rgba(99, 102, 241, 0.15); }
        .premium-badge.type { background: var(--bg-soft); color: var(--text-muted); border: 1px solid var(--border); }

        .rule-display-name {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text);
          margin: 0 0 1.5rem;
          line-height: 1.3;
        }

        .rule-logic-display {
          background: var(--bg-soft);
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid var(--border);
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .logic-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logic-label { font-size: 0.9rem; color: var(--text-muted); font-weight: 500; }
        .logic-value { font-size: 1rem; font-weight: 600; color: var(--text); }
        .logic-value-result { font-size: 1.1rem; font-weight: 800; color: var(--primary); display: flex; align-items: center; gap: 0.5rem; }
        .logic-value-result .duration { font-size: 0.85rem; color: var(--text-muted); font-weight: 500; }

        .rule-desc-text {
          font-size: 0.95rem;
          color: var(--text-muted);
          line-height: 1.6;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rule-card-footer {
          padding-top: 1.5rem;
          border-top: 1px dashed var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text);
        }

        .dot { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; }
        .dot.pulse { background: #00906a; box-shadow: 0 0 0 0 rgba(0, 144, 106, 0.7); animation: statusPulse 2s infinite; }

        @keyframes statusPulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 144, 106, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(0, 144, 106, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 144, 106, 0); }
        }

        .arrow-icon { color: var(--border); transition: all 0.3s; }
        .rule-card-premium:hover .arrow-icon { color: var(--primary); transform: translateX(5px); }

        /* Modal Roots */
        .modal-root { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .modal-backdrop { position: absolute; inset: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(12px); animation: fadeIn 0.3s; }
        .modal-wrapper { position: relative; width: 100%; max-width: 700px; z-index: 10; }

        .modal-container-premium {
          background: var(--card);
          border-radius: 36px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .modal-header-premium {
          padding: 2.5rem 3rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-soft);
        }

        .header-title-box { display: flex; align-items: center; gap: 1.25rem; }
        .title-icon { width: 44px; height: 44px; background: var(--card); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: var(--primary); box-shadow: 0 5px 15px rgba(0,0,0,0.05); }
        .header-title-box h2 { font-size: 1.5rem; font-weight: 850; margin: 0; letter-spacing: -0.02em; }

        .close-modal-btn { background: var(--card); border: none; width: 40px; height: 40px; border-radius: 14px; cursor: pointer; color: var(--text-muted); transition: all 0.2s; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .close-modal-btn:hover { background: #fee2e2; color: #ef4444; transform: rotate(90deg); }

        .modal-scroll-area { padding: 3rem; max-height: 60vh; overflow-y: auto; }

        .form-section { margin-bottom: 2rem; }
        .form-row-dual { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }

        .premium-label { display: block; font-size: 0.95rem; font-weight: 700; color: var(--text); margin-bottom: 1rem; }
        
        .premium-input, .premium-select, .premium-textarea {
          width: 100%;
          padding: 1.25rem 1.5rem;
          background: var(--bg-soft);
          border: 2px solid var(--border);
          border-radius: 20px;
          color: var(--text);
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.2s;
          outline: none;
        }

        .premium-input:focus, .premium-select:focus, .premium-textarea:focus {
          border-color: var(--primary);
          background: var(--card);
          box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.1);
        }

        .premium-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1.5rem center; background-size: 1.2rem; }

        .premium-textarea { height: 120px; resize: none; }

        .input-with-icon { position: relative; }
        .inner-icon { position: absolute; left: 1.5rem; top: 50%; transform: translateY(-50%); color: var(--primary); }
        .icon-padding { padding-left: 3.5rem; }

        .form-toggle-section {
          background: var(--bg-soft);
          padding: 1.5rem;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          border: 1px solid var(--border);
        }

        .toggle-container { position: relative; display: inline-block; width: 56px; height: 30px; }
        .toggle-container input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; }
        .toggle-slider:before { position: absolute; content: ""; height: 22px; width: 22px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .toggle-slider { background-color: #00906a; }
        input:checked + .toggle-slider:before { transform: translateX(26px); }

        .toggle-title { display: block; font-weight: 800; font-size: 1rem; color: var(--text); }
        .toggle-desc { margin: 0.25rem 0 0; font-size: 0.85rem; color: var(--text-muted); }

        .modal-footer-premium { padding: 2rem 3rem; background: var(--bg-soft); border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 1.25rem; }

        .btn-cancel { padding: 1.25rem 2rem; border-radius: 18px; border: 1px solid var(--border); background: var(--card); font-weight: 700; cursor: pointer; color: var(--text-muted); transition: all 0.2s; }
        .btn-save { padding: 1.25rem 2.5rem; border-radius: 18px; border: none; background: var(--primary); color: #ffffff; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); transition: all 0.2s; }
        .btn-save:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(99, 102, 241, 0.3); filter: brightness(1.1); }

        .btn-premium { background: var(--primary); color: white; border: none; padding: 1rem 2.25rem; border-radius: 20px; font-weight: 850; font-size: 1rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: all 0.3s; box-shadow: 0 10px 20px rgba(0, 73, 172, 0.25); }
        .btn-premium:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 20px 40px rgba(0, 73, 172, 0.4); }

        /* Empty State */
        .empty-state-full { padding: 6rem 3rem; text-align: center; border-radius: 40px; border: 2px dashed var(--border); background: var(--card); grid-column: 1 / -1; }
        .empty-icon-wrapper { width: 100px; height: 100px; background: var(--bg-soft); border-radius: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; color: var(--text-muted); border: 1px solid var(--border); }
        .empty-state-full h3 { font-size: 1.75rem; font-weight: 850; color: var(--text); margin-bottom: 1rem; }
        .empty-state-full p { color: var(--text-muted); font-size: 1.1rem; max-width: 500px; margin: 0 auto 2.5rem; line-height: 1.6; }

        /* Skeletons */
        .skeleton-card { background: var(--card); border-radius: 32px; padding: 2rem; border: 1px solid var(--border); }
        .skeleton { background: var(--bg-soft); animation: pulse 1.5s infinite; border-radius: 8px; }

        .animate-slide-down { animation: slideDown 0.3s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .premium-swal-popup { border-radius: 32px !important; padding: 2rem !important; }
      `}</style>
    </div>
  );
};

export default PenaltyRules;
