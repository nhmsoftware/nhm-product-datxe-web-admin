import React, { useState, useEffect } from 'react';
import { XCircle, Plus, Save, Trash2, Edit2, Clock, AlertTriangle, Loader2, X, FileText, CheckCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const CancellationConfigs = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCancellationConfigs();
      // API may return { data: [...] }, [...], or other shapes — always extract an array
      const raw = response?.data ?? response;
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
      setConfigs(list);
    } catch (error) {
      toast.error('Không thể tải cấu hình hủy chuyến');
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingConfig.id) {
        await adminService.updateCancellationConfig(editingConfig.id, editingConfig);
        toast.success('Cập nhật cấu hình thành công');
      } else {
        // Uncomment and implement create method when API supports it
        // await adminService.createCancellationConfig(editingConfig);
        toast.error('Tính năng thêm mới chưa được hỗ trợ trên API này');
      }
      setShowModal(false);
      fetchConfigs();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa cấu hình này?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy bỏ',
      background: document.body.className.includes('dark') ? '#1e293b' : '#fff',
      color: document.body.className.includes('dark') ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      // Implement delete logic here if API supports
      toast.error('Tính năng xóa chưa được hỗ trợ trên API này');
    }
  };

  return (
    <div className="cancellation-page">
      <div className="page-header">
        <div className="header-content">
          <div className="icon-wrapper">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h1 className="page-title">Cấu hình Hủy chuyến</h1>
            <p className="page-subtitle">Quản lý các quy tắc và phí phạt khi hủy chuyến xe đặt trước</p>
          </div>
        </div>
        <button className="btn btn-primary shadow-btn" onClick={() => {
          setEditingConfig({ 
            minutes_before: 30, 
            penalty_fee: 20000, 
            description: '',
            is_active: true 
          });
          setShowModal(true);
        }}>
          <Plus size={20} /> Thêm quy tắc
        </button>
      </div>

      <div className="content-card glass">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Thời gian tối thiểu</th>
                <th>Phí phạt (VND)</th>
                <th>Mô tả quy tắc</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="5">
                      <div className="skeleton-row"></div>
                    </td>
                  </tr>
                ))
              ) : configs.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-icon">
                        <FileText size={48} />
                      </div>
                      <h3>Chưa có quy tắc nào</h3>
                      <p>Hãy thêm quy tắc hủy chuyến để quản lý chế tài cho tài xế/khách hàng.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                configs.map(config => (
                  <tr key={config.id} className="hover-row">
                    <td>
                      <div className="time-badge">
                        <Clock size={16} />
                        Dưới {config.minutes_before} phút
                      </div>
                    </td>
                    <td>
                      <div className="fee-text">
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(config.penalty_fee)}
                      </div>
                    </td>
                    <td>
                      <div className="desc-text">{config.description || 'Không có mô tả'}</div>
                    </td>
                    <td>
                      <span className={`status-badge ${config.is_active ? 'active' : 'inactive'}`}>
                        {config.is_active ? <CheckCircle size={14}/> : <XCircle size={14}/>}
                        {config.is_active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-action edit" onClick={() => { setEditingConfig(config); setShowModal(true); }} title="Chỉnh sửa">
                          <Edit2 size={18} />
                        </button>
                        <button className="btn-action delete" onClick={() => handleDelete(config.id)} title="Xóa">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setShowModal(false)}>
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingConfig.id ? 'Cập nhật Quy tắc' : 'Thêm Quy tắc mới'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Hủy trước khi bắt đầu (Phút)</label>
                <div className="input-with-icon">
                  <Clock size={18} className="input-icon" />
                  <input 
                    type="number" 
                    value={editingConfig.minutes_before}
                    onChange={e => setEditingConfig({...editingConfig, minutes_before: e.target.value})}
                    placeholder="Ví dụ: 30"
                    required
                  />
                </div>
                <p className="help-text">Nếu thao tác hủy diễn ra trong khoảng thời gian này trở xuống, phí phạt sẽ được áp dụng.</p>
              </div>

              <div className="form-group">
                <label>Phí phạt áp dụng (VND)</label>
                <div className="input-with-icon">
                  <span className="input-icon font-bold pl-1">đ</span>
                  <input 
                    type="number" 
                    value={editingConfig.penalty_fee}
                    onChange={e => setEditingConfig({...editingConfig, penalty_fee: e.target.value})}
                    placeholder="Ví dụ: 20000"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả quy tắc (Tùy chọn)</label>
                <textarea 
                  value={editingConfig.description}
                  onChange={e => setEditingConfig({...editingConfig, description: e.target.value})}
                  placeholder="Diễn giải rõ hơn về quy tắc này..."
                  rows="3"
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={editingConfig.is_active}
                    onChange={e => setEditingConfig({...editingConfig, is_active: e.target.checked})}
                  />
                  <span>Kích hoạt quy tắc này ngay lập tức</span>
                </label>
              </div>

              <div className="warning-box">
                <AlertTriangle size={20} />
                <p>Mọi thay đổi sẽ ảnh hưởng trực tiếp đến các chuyến xe đặt trước trong tương lai.</p>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary shadow-btn" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  <span>{saving ? 'Đang lưu...' : 'Lưu quy tắc'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .cancellation-page { 
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); 
          padding-bottom: 2rem;
        }
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }

        /* Header Styles */
        .cancellation-page .page-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 2rem; 
          flex-wrap: wrap;
          gap: 1rem;
        }
        .cancellation-page .header-content {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .cancellation-page .icon-wrapper {
          width: 56px;
          height: 56px;
          background: rgba(0, 77, 160, 0.1);
          color: var(--primary);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cancellation-page .page-title { 
          font-size: 1.5rem; 
          font-weight: 800; 
          color: var(--text); 
          margin: 0 0 0.25rem 0;
        }
        .cancellation-page .page-subtitle { 
          font-size: 0.9rem; 
          color: var(--text-muted); 
          margin: 0;
        }

        /* Buttons */
        .cancellation-page .shadow-btn {
          box-shadow: 0 4px 14px 0 rgba(0, 77, 160, 0.39);
          transition: all 0.2s ease;
        }
        .cancellation-page .shadow-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 77, 160, 0.23);
        }

        /* Card & Table Styles */
        .cancellation-page .content-card {
          border-radius: 24px;
          background: var(--card);
          padding: 1.5rem;
          box-shadow: var(--shadow);
        }
        .cancellation-page .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        .cancellation-page .custom-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 0.5rem;
        }
        .cancellation-page .custom-table th {
          text-align: left;
          padding: 1rem;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          font-weight: 700;
          border-bottom: 1px solid var(--border);
        }
        .cancellation-page .custom-table td {
          padding: 1rem;
          background: var(--bg-soft);
          border-top: 1px solid transparent;
          border-bottom: 1px solid transparent;
          transition: var(--transition);
        }
        .cancellation-page .custom-table td:first-child {
          border-left: 1px solid transparent;
          border-top-left-radius: 12px;
          border-bottom-left-radius: 12px;
        }
        .cancellation-page .custom-table td:last-child {
          border-right: 1px solid transparent;
          border-top-right-radius: 12px;
          border-bottom-right-radius: 12px;
        }
        .cancellation-page .hover-row:hover td {
          background: var(--bg);
          border-color: var(--primary);
          box-shadow: 0 2px 10px rgba(0,0,0,0.02);
        }

        /* Badges & Text */
        .cancellation-page .time-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.75rem;
          background: rgba(0, 77, 160, 0.1);
          color: var(--primary);
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .cancellation-page .fee-text {
          font-weight: 800;
          color: var(--error);
          font-size: 1.1rem;
        }
        .cancellation-page .desc-text {
          font-size: 0.9rem;
          color: var(--text);
          max-width: 300px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cancellation-page .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .cancellation-page .status-badge.active { background: rgba(0, 144, 106, 0.1); color: var(--success); }
        .cancellation-page .status-badge.inactive { background: rgba(100, 116, 139, 0.1); color: var(--text-muted); }

        /* Action Buttons */
        .cancellation-page .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
        .cancellation-page .btn-action {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--text-muted);
          transition: all 0.2s;
          cursor: pointer;
        }
        .cancellation-page .btn-action.edit:hover { color: var(--primary); border-color: var(--primary); background: rgba(0,77,160,0.05); transform: translateY(-2px); }
        .cancellation-page .btn-action.delete:hover { color: var(--error); border-color: var(--error); background: rgba(239,68,68,0.05); transform: translateY(-2px); }

        /* Empty State */
        .cancellation-page .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }
        .cancellation-page .empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: var(--bg);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          opacity: 0.5;
        }
        .cancellation-page .empty-state h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; }
        .cancellation-page .empty-state p { color: var(--text-muted); font-size: 0.95rem; }

        /* Modal Styles */
        .cancellation-page .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        .cancellation-page .modal-container {
          background: var(--card);
          width: 100%;
          max-width: 500px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }
        .cancellation-page .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cancellation-page .modal-header h2 { font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--text); }
        .cancellation-page .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: 0.2s; }
        .cancellation-page .close-btn:hover { background: var(--bg-soft); color: var(--error); }

        .cancellation-page .modal-form { padding: 2rem; }
        .cancellation-page .form-group { margin-bottom: 1.5rem; }
        .cancellation-page .form-group label { display: block; font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text); }
        .cancellation-page .input-with-icon { position: relative; display: flex; align-items: center; }
        .cancellation-page .input-icon { position: absolute; left: 1rem; color: var(--text-muted); }
        .cancellation-page .input-with-icon input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-soft);
          color: var(--text);
          font-size: 1rem;
          transition: 0.2s;
        }
        .cancellation-page .input-with-icon input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(0,77,160,0.1); outline: none; }
        .cancellation-page .form-group textarea {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-soft);
          color: var(--text);
          font-size: 0.95rem;
          resize: vertical;
          transition: 0.2s;
        }
        .cancellation-page .form-group textarea:focus { border-color: var(--primary); outline: none; }
        .cancellation-page .help-text { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem; line-height: 1.4; }

        .cancellation-page .checkbox-group { margin-top: 2rem; }
        .cancellation-page .checkbox-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; font-weight: 600 !important; }
        .cancellation-page .checkbox-label input { width: 1.25rem; height: 1.25rem; accent-color: var(--primary); cursor: pointer; }

        .cancellation-page .warning-box {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(239, 68, 68, 0.08);
          border: 1px dashed rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          margin-bottom: 2rem;
          color: var(--error);
        }
        .cancellation-page .warning-box p { margin: 0; font-size: 0.85rem; font-weight: 600; line-height: 1.4; }

        .cancellation-page .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }
        .cancellation-page .btn-cancel {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text);
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }
        .cancellation-page .btn-cancel:hover { background: var(--bg-soft); }

        .cancellation-page .skeleton-row { height: 60px; background: var(--bg-soft); animation: pulse 1.5s infinite; border-radius: 12px; }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}} />
    </div>
  );
};

export default CancellationConfigs;
