import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { 
  Banknote, Plus, Search, Edit2, Trash2, 
  CheckCircle2, AlertCircle, Calendar, 
  MapPin, Globe, Utensils, Bike, Package,
  Filter, X, Save, Loader2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

// Native helpers to replace date-fns
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 16);
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const CommissionConfig = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    service_type: 2, // Default to Food (Merchant) as requested
    scope: 1, // System
    area_id: '',
    commission_rate: 20,
    min_commission: '',
    max_commission: '',
    is_active: true,
    effective_from: new Date().toISOString().slice(0, 16),
    effective_to: ''
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await adminService.getCommissionRules();
      setRules(res.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách hoa hồng!');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (rule = null) => {
    if (rule) {
      setEditingRule(rule);
      setForm({
        ...rule,
        effective_from: formatDateForInput(rule.effective_from),
        effective_to: formatDateForInput(rule.effective_to)
      });
    } else {
      setEditingRule(null);
      setForm({
        name: '',
        service_type: 2,
        scope: 1,
        area_id: '',
        commission_rate: 20,
        min_commission: '',
        max_commission: '',
        is_active: true,
        effective_from: new Date().toISOString().slice(0, 16),
        effective_to: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = { ...form };
      if (!payload.min_commission) delete payload.min_commission;
      if (!payload.max_commission) delete payload.max_commission;
      if (!payload.effective_to) delete payload.effective_to;
      if (payload.scope === 1) payload.area_id = null;

      await adminService.saveCommissionRule(payload);
      toast.success(editingRule ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
      setShowModal(false);
      fetchRules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      text: "Hành động này sẽ hủy kích hoạt và xóa quy tắc này.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Xác nhận xóa',
      cancelButtonText: 'Hủy',
      background: document.body.className.includes('dark') ? '#1e293b' : '#fff',
      color: document.body.className.includes('dark') ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        await adminService.deleteCommissionRule(id);
        toast.success('Đã xóa quy tắc!');
        fetchRules();
      } catch (error) {
        toast.error('Không thể xóa quy tắc!');
      }
    }
  };

  const SERVICE_TYPES = {
    1: { label: 'Chuyến xe', icon: <Bike size={16} />, color: 'var(--primary)', bg: 'rgba(67, 97, 238, 0.1)' },
    2: { label: 'Nhà hàng (Food)', icon: <Utensils size={16} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    3: { label: 'Giao hàng', icon: <Package size={16} />, color: '#00906a', bg: 'rgba(0, 144, 106, 0.1)' }
  };

  const filteredRules = rules.filter(r => filterType === 'all' || r.service_type === parseInt(filterType));

  return (
    <div className="commission-page">
      <Toaster position="top-right" />
      
      <div className="page-header">
        <div className="header-text">
          <h1 className="title">Cấu hình Hoa hồng hệ thống</h1>
          <p className="subtitle">Quản lý tỷ lệ chiết khấu cho Tài xế, Nhà hàng và Giao hàng</p>
        </div>
        <button className="btn-premium" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Tạo cấu hình mới
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card glass">
          <div className="stat-icon" style={{ background: 'rgba(67, 97, 238, 0.1)', color: 'var(--primary)' }}>
            <Banknote size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tổng quy tắc</span>
            <span className="stat-value">{rules.length}</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon" style={{ background: 'rgba(0, 144, 106, 0.1)', color: '#00906a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Đang hoạt động</span>
            <span className="stat-value">{rules.filter(r => r.is_active).length}</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Utensils size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Hoa hồng Nhà hàng</span>
            <span className="stat-value">{rules.filter(r => r.service_type === 2).length}</span>
          </div>
        </div>
      </div>

      <div className="content-card glass">
        <div className="card-header">
          <div className="filter-group">
            <div className={`filter-item ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>Tất cả</div>
            <div className={`filter-item ${filterType === '1' ? 'active' : ''}`} onClick={() => setFilterType('1')}>Chuyến xe</div>
            <div className={`filter-item ${filterType === '2' ? 'active' : ''}`} onClick={() => setFilterType('2')}>Nhà hàng</div>
            <div className={`filter-item ${filterType === '3' ? 'active' : ''}`} onClick={() => setFilterType('3')}>Giao hàng</div>
          </div>
        </div>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Tên cấu hình</th>
                <th>Dịch vụ</th>
                <th>Phạm vi</th>
                <th>Tỷ lệ (%)</th>
                <th>Min/Max</th>
                <th>Hiệu lực</th>
                <th>Trạng thái</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8">
                    <Loader2 className="animate-spin inline-block mr-2" /> Đang tải...
                  </td>
                </tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-muted">
                    Chưa có cấu hình nào.
                  </td>
                </tr>
              ) : filteredRules.map(rule => (
                <tr key={rule.id}>
                  <td>
                    <div className="rule-name">{rule.name || 'Cấu hình mặc định'}</div>
                    <div className="rule-id">{rule.id}</div>
                  </td>
                  <td>
                    <span className="service-badge" style={{ background: SERVICE_TYPES[rule.service_type]?.bg, color: SERVICE_TYPES[rule.service_type]?.color }}>
                      {SERVICE_TYPES[rule.service_type]?.icon}
                      {SERVICE_TYPES[rule.service_type]?.label}
                    </span>
                  </td>
                  <td>
                    {rule.scope === 1 ? (
                      <span className="scope-badge system"><Globe size={12} /> Hệ thống</span>
                    ) : (
                      <span className="scope-badge regional"><MapPin size={12} /> {rule.area_id || 'Khu vực'}</span>
                    )}
                  </td>
                  <td className="rate-cell">{rule.commission_rate}%</td>
                  <td>
                    <div className="min-max">
                      <span>Min: {rule.min_commission ? Number(rule.min_commission).toLocaleString() : 'N/A'}</span>
                      <span>Max: {rule.max_commission ? Number(rule.max_commission).toLocaleString() : 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-info">
                      <span>Từ: {formatDisplayDate(rule.effective_from)}</span>
                      {rule.effective_to && <span>Đến: {formatDisplayDate(rule.effective_to)}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${rule.is_active ? 'active' : ''}`}>
                      {rule.is_active ? 'Kích hoạt' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="text-right">
                    <div className="action-btns">
                      <button className="icon-btn edit" onClick={() => handleOpenModal(rule)}><Edit2 size={16} /></button>
                      <button className="icon-btn delete" onClick={() => handleDelete(rule.id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card glass shadow-2xl">
            <div className="modal-header">
              <h3>{editingRule ? 'Chỉnh sửa cấu hình' : 'Tạo cấu hình mới'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full">
                    <label>Tên cấu hình (Ghi chú)</label>
                    <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="VD: Hoa hồng Nhà hàng nội thành" />
                  </div>
                  
                  <div className="form-group">
                    <label>Loại dịch vụ</label>
                    <select value={form.service_type} onChange={e => setForm({...form, service_type: parseInt(e.target.value)})}>
                      <option value={1}>Chuyến xe (Ride)</option>
                      <option value={2}>Nhà hàng (Food Merchant)</option>
                      <option value={3}>Giao hàng (Delivery)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Phạm vi áp dụng</label>
                    <select value={form.scope} onChange={e => setForm({...form, scope: parseInt(e.target.value)})}>
                      <option value={1}>Toàn hệ thống</option>
                      <option value={2}>Theo khu vực</option>
                    </select>
                  </div>

                  {form.scope === 2 && (
                    <div className="form-group full">
                      <label>Mã khu vực (Area ID)</label>
                      <input type="text" value={form.area_id} onChange={e => setForm({...form, area_id: e.target.value})} placeholder="VD: HCM_01" />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Tỷ lệ hoa hồng (%)</label>
                    <input type="number" step="0.1" value={form.commission_rate} onChange={e => setForm({...form, commission_rate: parseFloat(e.target.value)})} required />
                  </div>

                  <div className="form-group">
                    <label>Thời gian hiệu lực (Bắt đầu)</label>
                    <input type="datetime-local" value={form.effective_from} onChange={e => setForm({...form, effective_from: e.target.value})} required />
                  </div>

                  <div className="form-group">
                    <label>Hoa hồng tối thiểu (Min)</label>
                    <input type="number" value={form.min_commission} onChange={e => setForm({...form, min_commission: e.target.value})} placeholder="Không giới hạn" />
                  </div>

                  <div className="form-group">
                    <label>Hoa hồng tối đa (Max)</label>
                    <input type="number" value={form.max_commission} onChange={e => setForm({...form, max_commission: e.target.value})} placeholder="Không giới hạn" />
                  </div>

                  <div className="form-group full">
                    <label className="toggle-label">
                      <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                      <span>Kích hoạt cấu hình ngay</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Lưu cấu hình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .commission-page { padding: 1.5rem; animation: slideUp 0.4s ease-out; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
        .title { font-size: 2rem; font-weight: 800; color: var(--text); margin-bottom: 0.5rem; letter-spacing: -0.5px; }
        .subtitle { color: var(--text-muted); font-size: 1rem; }

        .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card { padding: 1.5rem; border-radius: 20px; display: flex; align-items: center; gap: 1.25rem; border: 1px solid var(--border); transition: transform 0.2s; }
        .stat-card:hover { transform: scale(1.02); }
        .stat-icon { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
        .stat-label { font-size: 0.85rem; color: var(--text-muted); display: block; font-weight: 600; }
        .stat-value { font-size: 1.75rem; font-weight: 800; color: var(--text); }

        .content-card { border-radius: 24px; border: 1px solid var(--border); overflow: hidden; background: var(--card); }
        .card-header { padding: 1.25rem 2rem; border-bottom: 1px solid var(--border); background: rgba(var(--primary-rgb), 0.02); }
        .filter-group { display: flex; gap: 0.5rem; }
        .filter-item { padding: 0.5rem 1.25rem; border-radius: 10px; font-size: 0.875rem; font-weight: 600; cursor: pointer; color: var(--text-muted); transition: 0.2s; }
        .filter-item:hover { background: var(--bg-soft); color: var(--text); }
        .filter-item.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3); }

        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 1.25rem 1.5rem; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); font-weight: 800; border-bottom: 2px solid var(--border); }
        td { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
        tr:hover td { background: rgba(var(--primary-rgb), 0.01); }

        .rule-name { font-weight: 700; color: var(--text); margin-bottom: 0.25rem; }
        .rule-id { font-size: 0.65rem; color: var(--text-muted); font-family: monospace; }
        
        .service-badge { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.75rem; border-radius: 10px; font-size: 0.8rem; font-weight: 700; }
        .scope-badge { display: inline-flex; align-items: center; gap: 0.35rem; font-size: 0.8rem; font-weight: 600; }
        .scope-badge.system { color: var(--primary); }
        .scope-badge.regional { color: var(--secondary); }

        .rate-cell { font-size: 1.25rem; font-weight: 800; color: var(--primary); }
        .min-max { font-size: 0.75rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 2px; }
        .date-info { font-size: 0.75rem; display: flex; flex-direction: column; gap: 2px; font-weight: 600; color: var(--text-muted); }
        
        .status-pill { padding: 0.35rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: #fee2e2; color: #ef4444; }
        .status-pill.active { background: #d1fae5; color: #00906a; }

        .action-btns { display: flex; gap: 0.5rem; }
        .icon-btn { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); transition: 0.2s; background: white; }
        .icon-btn.edit:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }
        .icon-btn.delete:hover { border-color: var(--error); color: var(--error); transform: translateY(-2px); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .modal-card { width: 100%; max-width: 650px; background: var(--card); border-radius: 28px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 2rem; max-height: 70vh; overflow-y: auto; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group.full { grid-column: span 2; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 0.5rem; }
        .form-group input, .form-group select { width: 100%; padding: 0.85rem; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-soft); color: var(--text); outline: none; font-weight: 600; }
        .form-group input:focus { border-color: var(--primary); background: var(--bg); }
        
        .toggle-label { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
        .toggle-label input { width: 20px; height: 20px; }
        
        .modal-footer { padding: 1.5rem 2rem; background: var(--bg-soft); display: flex; justify-content: flex-end; gap: 1rem; }
        .btn-cancel { padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; color: var(--text-muted); transition: 0.2s; }
        .btn-cancel:hover { color: var(--text); }
        .btn-save { padding: 0.75rem 2rem; border-radius: 12px; background: var(--primary); color: white; font-weight: 700; display: flex; align-items: center; gap: 0.5rem; box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3); }
        .btn-save:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(var(--primary-rgb), 0.4); }

        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
      `}} />
    </div>
  );
};

export default CommissionConfig;
