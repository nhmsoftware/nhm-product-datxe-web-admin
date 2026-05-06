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
  MoreVertical,
  Edit2,
  Trash2,
  Power,
  X,
  CheckCircle2,
  ChevronRight
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
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa quy tắc này?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
      confirmButtonText: 'Xóa ngay',
      cancelButtonText: 'Hủy',
      background: 'var(--card)',
      color: 'var(--text)',
      borderRadius: '20px'
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
        <div>
          <h1 className="page-title">Cấu hình Quy tắc Xử phạt</h1>
          <p className="text-muted">Thiết lập các tiêu chuẩn tự động xử lý vi phạm trong hệ thống</p>
        </div>
        <button className="btn btn-premium" onClick={handleCreate}>
          <Plus size={20} />
          Thêm quy tắc mới
        </button>
      </div>

      <div className="rules-grid">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton h-48 w-full rounded-2xl"></div>)
        ) : rules.length === 0 ? (
          <div className="empty-state full-width">
            <ShieldAlert size={48} className="text-muted mb-4" />
            <h3>Chưa có quy tắc nào</h3>
            <p>Hãy bắt đầu bằng việc tạo quy tắc đầu tiên để bảo vệ hệ thống</p>
          </div>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className={`rule-card glass ${!rule.is_active ? 'inactive' : ''}`}>
              <div className="rule-card-header">
                <div className={`rule-icon ${
                  rule.penalty_type === 3 ? 'danger' : (rule.penalty_type === 2 ? 'warning' : 'primary')
                }`}>
                  {rule.penalty_type === 1 && <MessageSquare size={20} />}
                  {rule.penalty_type === 2 && <Ban size={20} />}
                  {rule.penalty_type === 3 && <UserX size={20} />}
                  {rule.penalty_type === 4 && <Coins size={20} />}
                  {rule.penalty_type === 5 && <History size={20} />}
                </div>
                <div className="rule-actions">
                  <button className="btn-icon" onClick={() => handleEdit(rule)}><Edit2 size={16} /></button>
                  <button className={`btn-icon ${rule.is_active ? 'text-success' : 'text-muted'}`} onClick={() => toggleStatus(rule)}>
                    <Power size={16} />
                  </button>
                  <button className="btn-icon text-error" onClick={() => handleDelete(rule.id)}><Trash2 size={16} /></button>
                </div>
              </div>

              <div className="rule-card-body">
                <h3 className="rule-name">{rule.name}</h3>
                <div className="rule-meta">
                  <span className="badge badge-glass">{ViolationTypeLabels[rule.violation_type]}</span>
                  <span className="badge badge-glass">{ApplicableRoleLabels[rule.applicable_role]}</span>
                </div>
                
                <div className="rule-logic">
                  <div className="logic-item">
                    <span className="label">Ngưỡng vi phạm:</span>
                    <span className="value">{rule.violation_threshold} lần</span>
                  </div>
                  <div className="logic-item">
                    <span className="label">Hình phạt:</span>
                    <span className="value font-bold text-primary">{PenaltyTypeLabels[rule.penalty_type]}</span>
                  </div>
                  {rule.penalty_duration && (
                    <div className="logic-item">
                      <span className="label">Thời gian:</span>
                      <span className="value">{rule.penalty_duration} phút</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">{currentRule ? 'Cập nhật quy tắc' : 'Thêm quy tắc xử phạt'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body form-grid">
                <div className="full-width">
                  <label className="label">Tên quy tắc</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="VD: Khóa tài khoản do hủy chuyến quá nhiều"
                    required
                  />
                </div>

                <div>
                  <label className="label">Loại vi phạm</label>
                  <select 
                    className="select-input w-full"
                    value={formData.violation_type}
                    onChange={e => setFormData({...formData, violation_type: parseInt(e.target.value)})}
                  >
                    {Object.entries(ViolationTypeLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Đối tượng áp dụng</label>
                  <select 
                    className="select-input w-full"
                    value={formData.applicable_role}
                    onChange={e => setFormData({...formData, applicable_role: parseInt(e.target.value)})}
                  >
                    {Object.entries(ApplicableRoleLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Ngưỡng (Số lần vi phạm)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={formData.violation_threshold}
                    onChange={e => setFormData({...formData, violation_threshold: parseInt(e.target.value)})}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="label">Hình thức xử phạt</label>
                  <select 
                    className="select-input w-full"
                    value={formData.penalty_type}
                    onChange={e => setFormData({...formData, penalty_type: parseInt(e.target.value)})}
                  >
                    {Object.entries(PenaltyTypeLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>

                {formData.penalty_type === 2 && (
                  <div>
                    <label className="label">Thời gian khóa (phút)</label>
                    <input 
                      type="number" 
                      className="input" 
                      value={formData.penalty_duration}
                      onChange={e => setFormData({...formData, penalty_duration: e.target.value})}
                      placeholder="Nhập số phút"
                    />
                  </div>
                )}

                {formData.penalty_type === 4 && (
                  <div>
                    <label className="label">Số tiền phạt (đ)</label>
                    <input 
                      type="number" 
                      className="input" 
                      value={formData.monetary_amount}
                      onChange={e => setFormData({...formData, monetary_amount: e.target.value})}
                      placeholder="VNĐ"
                    />
                  </div>
                )}

                {formData.penalty_type === 5 && (
                  <div>
                    <label className="label">Điểm uy tín trừ</label>
                    <input 
                      type="number" 
                      className="input" 
                      value={formData.reputation_points}
                      onChange={e => setFormData({...formData, reputation_points: e.target.value})}
                      placeholder="Số điểm"
                    />
                  </div>
                )}

                <div className="full-width">
                  <label className="label">Mô tả chi tiết</label>
                  <textarea 
                    className="input" 
                    style={{ height: '80px' }}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="full-width flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="is_active"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  />
                  <label htmlFor="is_active" className="font-semibold">Kích hoạt quy tắc ngay</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-glass" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu quy tắc</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .penalty-rules-page {
          padding: 2rem;
          animation: fadeIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .rules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .rule-card {
          padding: 1.5rem;
          border-radius: 24px;
          border: 1px solid var(--border);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .rule-card:hover {
          transform: translateY(-5px);
          border-color: var(--primary);
          box-shadow: 0 12px 30px rgba(99, 102, 241, 0.15);
        }

        .rule-card.inactive {
          opacity: 0.6;
          filter: grayscale(0.5);
        }

        .rule-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.25rem;
        }

        .rule-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rule-icon.primary { background: rgba(99, 102, 241, 0.1); color: var(--primary); }
        .rule-icon.warning { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .rule-icon.danger { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .rule-actions {
          display: flex;
          gap: 0.5rem;
        }

        .rule-name {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }

        .rule-meta {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .rule-logic {
          background: var(--bg-soft);
          padding: 1rem;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .logic-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }

        .logic-item .label { color: var(--text-muted); }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .full-width { grid-column: span 2; }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 5rem 2rem;
          background: var(--card);
          border-radius: 24px;
          border: 2px dashed var(--border);
          text-align: center;
        }

        .btn-icon {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-soft);
          border: none;
          color: var(--text-muted);
          transition: all 0.2s;
          cursor: pointer;
        }

        .btn-icon:hover {
          background: var(--border);
          color: var(--primary);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default PenaltyRules;
