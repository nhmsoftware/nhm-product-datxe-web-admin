import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { 
  Banknote, Plus, Search, Edit2, Trash2, 
  CheckCircle2, AlertCircle, Calendar, 
  MapPin, Globe, Utensils, Bike, Package,
  Filter, X, Save, Loader2, User, Store,
  Info, TrendingUp, DollarSign, ArrowRight,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { COMMISSION_SERVICE_LABEL_MAP, COMMISSION_SERVICE_OPTIONS } from '../../constants/serviceCatalog';

// Native helpers
const formatDateForInput = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 16);
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return 'Vô thời hạn';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const VIETNAM_PROVINCES = [
  "Hà Nội", "Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Cần Thơ", 
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
].sort();

const CommissionConfig = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterTarget, setFilterTarget] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [saving, setSaving] = useState(false);

  const [simAmount, setSimAmount] = useState(100000);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    target_type: 1, // 1: Driver, 2: Merchant
    service_type: 1, // 1: Ride, 2: Food, 3: Delivery
    scope: 1, // 1: System, 2: Regional
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
        target_type: 1,
        service_type: 1,
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

  const handleSubmit = async (e) => {
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
      text: "Quy tắc này sẽ bị gỡ bỏ khỏi hệ thống.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Xác nhận xóa',
      cancelButtonText: 'Hủy',
      background: document.body.className.includes('dark') ? '#111823' : '#fff',
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
    1: { label: COMMISSION_SERVICE_LABEL_MAP[1], icon: <Bike size={16} />, color: 'var(--primary)', bg: 'rgba(0, 73, 172, 0.1)' },
    2: { label: COMMISSION_SERVICE_LABEL_MAP[2], icon: <Utensils size={16} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    3: { label: COMMISSION_SERVICE_LABEL_MAP[3], icon: <Package size={16} />, color: '#00906a', bg: 'rgba(0, 144, 106, 0.1)' },
    6: { label: COMMISSION_SERVICE_LABEL_MAP[6], icon: <Globe size={16} />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    7: { label: COMMISSION_SERVICE_LABEL_MAP[7], icon: <MapPin size={16} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' }
  };

  const TARGET_TYPES = {
    1: { label: 'Tài xế', icon: <User size={14} />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    2: { label: 'Cửa hàng / Đối tác', icon: <Store size={14} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' }
  };

  const COMMISSION_MODEL_LABELS = {
    '1_1': { label: 'Hoa hồng Tài xế Đặt xe', icon: <Bike size={16} />, color: 'var(--primary)', bg: 'rgba(0, 73, 172, 0.1)' },
    '2_2': { label: 'Hoa hồng Quán ăn', icon: <Store size={16} />, color: '#ec4899', bg: 'rgba(236, 72, 153, 0.1)' },
    '1_2': { label: 'Hoa hồng Tài xế Giao đồ ăn', icon: <Utensils size={16} />, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
    '1_3': { label: 'Hoa hồng Giao hàng', icon: <Package size={16} />, color: '#00906a', bg: 'rgba(0, 144, 106, 0.1)' },
    '1_6': { label: 'Hoa hồng Đặt xe Đi tỉnh', icon: <Globe size={16} />, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    '1_7': { label: 'Hoa hồng Đặt xe Sân bay', icon: <MapPin size={16} />, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)' },
  };

  const filteredRules = rules.filter(r => {
    const typeMatch = filterType === 'all' || r.service_type === parseInt(filterType);
    const targetMatch = filterTarget === 'all' || r.target_type === parseInt(filterTarget);
    return typeMatch && targetMatch;
  });

  const calculateSim = () => {
    const rate = form.commission_rate / 100;
    let commission = simAmount * rate;
    if (form.min_commission && commission < form.min_commission) commission = parseFloat(form.min_commission);
    if (form.max_commission && commission > form.max_commission) commission = parseFloat(form.max_commission);
    return {
      commission,
      net: simAmount - commission
    };
  };

  const simResult = calculateSim();

  return (
    <div className="commission-page">
      
      <div className="page-header-container">
        <div className="header-left">
           <button 
             onClick={() => navigate('/finance/driver-summary')} 
             className="btn-icon animate-pulse" 
             style={{ 
               width: '44px', 
               height: '44px', 
               borderRadius: '14px', 
               border: '1.5px solid var(--border)', 
               background: 'var(--card)', 
               color: 'var(--text)', 
               cursor: 'pointer', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center',
               transition: 'var(--transition)',
               boxShadow: 'var(--shadow)',
               marginRight: '0.5rem'
             }}
             title="Quay lại Quản lý Tài chính"
           >
             <ArrowLeft size={20} />
           </button>
           <div className="header-icon-main">
              <TrendingUp size={28} />
           </div>
           <div>
              <h1 className="page-title">Quản lý Mô hình Hoa hồng</h1>
              <p className="page-subtitle">Thiết lập tỷ lệ chiết khấu cho Tài xế đối tác và Merchant (UC-119)</p>
           </div>
        </div>
        <button className="btn btn-premium" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Tạo cấu hình mới
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass glass-hover">
          <div className="stat-icon" style={{ background: 'rgba(0, 73, 172, 0.1)', color: 'var(--primary)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Tổng số quy tắc:</span>
            <span className="stat-value">{rules.length}</span>
          </div>
        </div>
        <div className="stat-card glass glass-hover">
          <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            <User size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Hoa hồng Tài xế:</span>
            <span className="stat-value">{rules.filter(r => r.target_type === 1).length}</span>
          </div>
        </div>
        <div className="stat-card glass glass-hover">
          <div className="stat-icon" style={{ background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
            <Store size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Hoa hồng Đối tác:</span>
            <span className="stat-value">{rules.filter(r => r.target_type === 2).length}</span>
          </div>
        </div>
        <div className="stat-card glass glass-hover">
          <div className="stat-icon" style={{ background: 'rgba(0, 144, 106, 0.1)', color: '#00906a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Đang hoạt động:</span>
            <span className="stat-value">{rules.filter(r => r.is_active).length}</span>
          </div>
        </div>
      </div>

      <div className="filter-board glass mt-8">
        <div className="filter-row flex items-center">
          <div className="filter-group">
            <span className="filter-label"><Filter size={14} /> LOẠI DỊCH VỤ:</span>
            <div className="tabs-container m-0">
              <button className={`tab-item ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>Tất cả</button>
              {COMMISSION_SERVICE_OPTIONS.map((service) => (
                <button key={service.id} className={`tab-item ${filterType === String(service.id) ? 'active' : ''}`} onClick={() => setFilterType(String(service.id))}>
                  {service.label}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group ml-8">
            <span className="filter-label"><User size={14} /> ĐỐI TƯỢNG:</span>
            <div className="tabs-container m-0">
              <button className={`tab-item ${filterTarget === 'all' ? 'active' : ''}`} onClick={() => setFilterTarget('all')}>Tất cả</button>
              <button className={`tab-item ${filterTarget === '1' ? 'active' : ''}`} onClick={() => setFilterTarget('1')}>Tài xế</button>
              <button className={`tab-item ${filterTarget === '2' ? 'active' : ''}`} onClick={() => setFilterTarget('2')}>Đối tác</button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-container glass mt-4">
        <table className="animate-fade-in">
          <thead>
            <tr>
               <th className="whitespace-nowrap">ID Cấu hình</th>
               <th className="whitespace-nowrap">Loại mô hình</th>
               <th className="whitespace-nowrap">Phạm vi</th>
               <th className="whitespace-nowrap">Hoa hồng (%)</th>
               <th className="whitespace-nowrap">Giới hạn (Min/Max)</th>
               <th className="whitespace-nowrap">Hiệu lực</th>
               <th className="whitespace-nowrap">Trạng thái</th>
              <th className="text-right whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="text-center py-12">
                  <Loader2 className="animate-spin inline-block mr-3 text-primary" size={32} />
                  <span className="text-muted font-medium">Đang tải dữ liệu hoa hồng...</span>
                </td>
              </tr>
            ) : filteredRules.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ border: 'none', padding: '5rem 0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '1rem', border: '1px dashed var(--border)', marginLeft: 'auto', marginRight: 'auto' }}>
                      <AlertCircle size={32} style={{ opacity: 0.3 }} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: 'var(--text-muted)' }}>Không tìm thấy cấu hình hoa hồng phù hợp</h4>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', opacity: 0.6 }}>Vui lòng kiểm tra lại bộ lọc hoặc tạo cấu hình mới.</p>
                  </div>
                </td>
              </tr>
            ) : filteredRules.map(rule => (
              <tr key={rule.id} className="hover-row">
                <td>
                  <div className="text-xs text-muted font-mono">{rule.id.substring(0, 8)}...</div>
                </td>
                <td>
                  {(() => {
                    const modelKey = `${rule.target_type}_${rule.service_type}`;
                    const model = COMMISSION_MODEL_LABELS[modelKey] || { label: rule.name || 'Khác', icon: <Info size={16} />, color: '#64748b', bg: '#f1f5f9' };
                    return (
                      <span className="badge" style={{ background: model.bg, color: model.color }}>
                        {model.icon}
                        {model.label}
                      </span>
                    );
                  })()}
                </td>
                <td>
                  {rule.scope === 1 ? (
                    <span className="flex items-center gap-1.5 text-primary text-xs font-bold"><Globe size={14} /> Toàn quốc</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-secondary text-xs font-bold"><MapPin size={14} /> {rule.area_id}</span>
                  )}
                </td>
                <td>
                  <div className="text-lg font-black text-primary">{rule.commission_rate}%</div>
                </td>
                <td>
                  <div className="flex flex-col text-[11px] text-muted font-medium">
                    <span>Min: {rule.min_commission ? Number(rule.min_commission).toLocaleString() : '—'} ₫</span>
                    <span>Max: {rule.max_commission ? Number(rule.max_commission).toLocaleString() : '—'} ₫</span>
                  </div>
                </td>
                <td className="whitespace-nowrap">
                  <div className="flex flex-col gap-1.5 py-1">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(0,144,106,0.5)]"></div>
                      <span className="text-[11px] font-bold text-success">Bắt đầu: {formatDisplayDate(rule.effective_from)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted/50"></div>
                      <span className="text-[11px] font-bold text-muted">Kết thúc: {rule.effective_to ? formatDisplayDate(rule.effective_to) : 'Vô thời hạn'}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${rule.is_active ? 'badge-success' : 'badge-error'}`}>
                    {rule.is_active ? 'Đang chạy' : 'Đã dừng'}
                  </span>
                </td>
                <td className="text-right">
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', alignItems: 'center' }}>
                    <button 
                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--primary)', background: 'rgba(0, 73, 172, 0.05)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} 
                      title="Chỉnh sửa" 
                      onClick={() => handleOpenModal(rule)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--error)', background: 'rgba(239, 68, 68, 0.05)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} 
                      title="Xóa" 
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-root">
          <div className="modal-backdrop" onClick={() => setShowModal(false)}></div>
          <div className="modal-wrapper" style={{ maxWidth: '1150px' }}>
            <div className="modal-container-premium">
              <div className="modal-header-premium">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Plus size={20} />
                  </div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{editingRule ? 'Cập nhật cấu hình' : 'Tạo cấu hình mới'}</h2>
                </div>
                <button className="btn-icon" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
            
              <form onSubmit={handleSubmit} className="premium-form m-0">
                <div className="modal-scroll-area p-0" style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', padding: '2rem' }}>
                      {/* Column 1: Thông tin cơ bản */}
                      <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                            <Info size={16} />
                          </div>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Cơ bản</h4>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div>
                            <label className="premium-label" style={{ fontSize: '0.65rem' }}>Loại mô hình hoa hồng</label>
                            <select 
                              className="premium-select" 
                              style={{ padding: '0.65rem 1rem' }} 
                              value={`${form.target_type}_${form.service_type}`} 
                              onChange={e => {
                                const [target, service] = e.target.value.split('_').map(Number);
                                setForm({...form, target_type: target, service_type: service, name: ''});
                              }}
                            >
                              <option value="1_1">Hoa hồng Tài xế Đặt xe</option>
                              <option value="2_2">Hoa hồng Quán ăn (Merchant)</option>
                              <option value="1_2">Hoa hồng Tài xế Giao đồ ăn</option>
                              <option value="1_3">Hoa hồng Giao hàng</option>
                              <option value="1_6">Hoa hồng Tài xế Đi tỉnh</option>
                              <option value="1_7">Hoa hồng Tài xế Sân bay</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Thông số tài chính */}
                      <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--success-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                            <DollarSign size={16} />
                          </div>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Tài chính</h4>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                              <label className="premium-label" style={{ fontSize: '0.65rem' }}>Phạm vi</label>
                              <select className="premium-select" style={{ padding: '0.65rem 1rem' }} value={form.scope} onChange={e => setForm({...form, scope: parseInt(e.target.value)})}>
                                <option value={1}>Toàn quốc</option>
                                <option value={2}>Khu vực</option>
                              </select>
                            </div>
                            <div>
                              <label className="premium-label" style={{ fontSize: '0.65rem' }}>Khu vực (Tỉnh/Huyện)</label>
                              <select 
                                className="premium-select" 
                                style={{ padding: '0.65rem 1rem' }} 
                                disabled={form.scope === 1} 
                                value={form.area_id} 
                                onChange={e => setForm({...form, area_id: e.target.value})}
                              >
                                <option value="">-- Chọn khu vực --</option>
                                {VIETNAM_PROVINCES.map(province => (
                                  <option key={province} value={province}>{province}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          <div>
                            <label className="premium-label" style={{ fontSize: '0.65rem' }}>Tỷ lệ hoa hồng (%)</label>
                            <div className="relative">
                              <input className="premium-input" style={{ padding: '0.65rem 1rem', fontWeight: 800, color: 'var(--primary)' }} type="number" step="0.1" min="0" onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }} value={form.commission_rate} onChange={e => setForm({...form, commission_rate: Math.max(0, parseFloat(e.target.value) || 0)})} required />
                              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--primary)', fontSize: '0.8rem' }}>%</span>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                              <label className="premium-label" style={{ fontSize: '0.65rem' }}>Tối thiểu (₫)</label>
                              <input className="premium-input" style={{ padding: '0.65rem 1rem' }} type="number" min="0" onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }} value={form.min_commission} onChange={e => setForm({...form, min_commission: e.target.value ? Math.max(0, parseInt(e.target.value)) : ''})} placeholder="0" />
                            </div>
                            <div>
                              <label className="premium-label" style={{ fontSize: '0.65rem' }}>Tối đa (₫)</label>
                              <input className="premium-input" style={{ padding: '0.65rem 1rem' }} type="number" min="0" onKeyDown={(e) => { if (e.key === '-') e.preventDefault(); }} value={form.max_commission} onChange={e => setForm({...form, max_commission: e.target.value ? Math.max(0, parseInt(e.target.value)) : ''})} placeholder="∞" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Column 3: Hiệu lực */}
                      <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--warning-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
                            <Calendar size={16} />
                          </div>
                          <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Hiệu lực</h4>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div>
                            <label className="premium-label" style={{ fontSize: '0.65rem' }}>Bắt đầu</label>
                            <input className="premium-input" style={{ padding: '0.65rem 1rem' }} type="datetime-local" value={form.effective_from} onChange={e => setForm({...form, effective_from: e.target.value})} required />
                          </div>
                          <div>
                            <label className="premium-label" style={{ fontSize: '0.65rem' }}>Kết thúc</label>
                            <input className="premium-input" style={{ padding: '0.65rem 1rem' }} type="datetime-local" value={form.effective_to} onChange={e => setForm({...form, effective_to: e.target.value})} />
                          </div>
                          <div className="form-toggle-section" style={{ padding: '0.65rem', borderRadius: '12px', background: 'var(--bg-soft)', marginTop: '0.25rem' }}>
                             <label className="toggle-container" style={{ width: '36px', height: '18px' }}>
                               <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} />
                               <span className="toggle-slider" style={{ borderRadius: '18px' }}></span>
                             </label>
                             <div className="toggle-text">
                               <span className="toggle-title" style={{ fontSize: '0.8rem' }}>Kích hoạt ngay</span>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Simulation (Horizontal) */}
                    <div style={{ padding: '0 2rem 2rem 2rem' }}>
                      <div className="glass" style={{ padding: '1.25rem 2rem', borderRadius: '24px', background: 'var(--bg-soft)', display: 'flex', alignItems: 'center', gap: '3rem', border: '1px dashed var(--primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                            <TrendingUp size={20} />
                          </div>
                          <div style={{ whiteSpace: 'nowrap' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 850 }}>Giả lập dòng tiền</h4>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Xem trước kết quả</p>
                          </div>
                        </div>

                        <div style={{ flex: 1, maxWidth: '200px' }}>
                          <label className="premium-label" style={{ fontSize: '0.6rem', marginBottom: '0.25rem', whiteSpace: 'nowrap' }}>Đơn hàng mẫu (₫)</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="text" 
                              style={{ width: '100%', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0.5rem 1rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', outline: 'none' }}
                              value={simAmount.toLocaleString('vi-VN')}
                              onChange={e => {
                                const raw = e.target.value.replace(/\D/g, '');
                                setSimAmount(parseInt(raw) || 0);
                              }}
                            />
                            <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)', fontSize: '0.8rem' }}>₫</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 2, minWidth: 'fit-content' }}>
                           <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Khấu trừ hoa hồng</span>
                              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--error)' }}>-{simResult.commission.toLocaleString()} ₫</div>
                           </div>
                           <div style={{ height: '30px', width: '1px', background: 'var(--border)', flexShrink: 0 }}></div>
                           <div style={{ whiteSpace: 'nowrap' }}>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase' }}>Đối tác thực nhận</span>
                              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--success)' }}>{simResult.net.toLocaleString()} ₫</div>
                           </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.75rem 0', background: 'rgba(0, 73, 172, 0.03)', borderTop: '1px solid var(--border)', opacity: 0.8 }}>
                        <div style={{ color: 'var(--primary)', display: 'flex' }}><Info size={14} /></div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Mẹo hệ thống: Quy tắc cấp khu vực sẽ được ưu tiên áp dụng trước quy tắc toàn quốc.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="modal-footer-premium">
                  <button type="button" className="btn-cancel-new" onClick={() => setShowModal(false)}>Hủy bỏ</button>
                  <button type="submit" className="btn-save-new" disabled={saving} style={{ padding: '0.85rem 3.5rem' }}>
                    {saving ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} style={{ marginRight: '8px' }} />}
                    {editingRule ? 'Cập nhật thay đổi' : 'Lưu cấu hình'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .commission-page { padding: 1.5rem; }
        .mt-8 { margin-top: 2rem; }
        .mt-6 { margin-top: 1.5rem; }
        .mt-2 { margin-top: 0.5rem; }
        .ml-8 { margin-left: 2rem; }
        .m-0 { margin: 0; }
        .p-0 { padding: 0 !important; }
        .p-8 { padding: 2rem !important; }
        .px-8 { padding-left: 2rem; padding-right: 2rem; }
        .px-10 { padding-left: 2.5rem; padding-right: 2.5rem; }
        
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

        .filter-board { padding: 1rem 1.5rem; border-radius: 20px; }
        .filter-row { display: flex; align-items: center; }
        .filter-group { display: flex; align-items: center; gap: 1rem; }
        .filter-label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; text-transform: uppercase; }

        .table-container { border-radius: 24px; overflow: hidden; border: 1px solid var(--border); }
        .hover-row:hover td { background: rgba(0, 73, 172, 0.02); }
        
        /* Modal Styles */
        .modal-root { position: fixed; inset: 0; z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
        .modal-backdrop { position: absolute; inset: 0; background: rgba(10, 14, 20, 0.6); backdrop-filter: blur(16px); animation: fadeIn 0.3s; }
        .modal-wrapper { position: relative; width: 100%; z-index: 10; margin-left: 0; } /* Ensure it's not shifted by sidebar if fixed root works */

        .modal-container-premium { background: var(--card); border-radius: 40px; box-shadow: 0 40px 100px rgba(0,0,0,0.3); overflow: hidden; border: 1px solid var(--border); animation: modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        
        .modal-header-premium {
          padding: 1.25rem 2.5rem;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-soft);
        }

        .premium-form { margin: 0; }
        .modal-scroll-area { max-height: 80vh; overflow-y: auto; }
        .modal-scroll-area::-webkit-scrollbar { width: 6px; }
        .modal-scroll-area::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        .premium-label { font-size: 0.8rem; font-weight: 750; color: var(--text-muted); margin-bottom: 0.5rem; display: block; text-transform: uppercase; letter-spacing: 0.5px; }
        .premium-input, .premium-select { 
           width: 100%;
           background: var(--bg-soft); 
           border: 1.5px solid var(--border); 
           border-radius: 14px; 
           padding: 0.85rem 1.15rem; 
           font-size: 0.9rem; 
           color: var(--text);
           font-weight: 600;
           transition: all 0.2s;
           outline: none;
        }
        .premium-input:focus, .premium-select:focus {
           background: var(--card);
           border-color: var(--primary);
           box-shadow: 0 0 0 4px rgba(0, 73, 172, 0.1);
        }

        .btn-save-new {
           background: var(--primary);
           color: #ffffff;
           padding: 0.85rem 2.5rem;
           border-radius: 14px;
           font-weight: 800;
           font-size: 0.95rem;
           border: none;
           cursor: pointer;
           transition: all 0.2s;
           box-shadow: 0 8px 20px rgba(0, 73, 172, 0.25);
           display: flex;
           align-items: center;
           justify-content: center;
        }
        .btn-save-new:hover { transform: translateY(-2px); filter: brightness(1.1); box-shadow: 0 12px 25px rgba(0, 73, 172, 0.35); }
        .btn-save-new:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        
        .btn-cancel-new {
           background: var(--card);
           color: var(--text-muted);
           padding: 0.85rem 2rem;
           border-radius: 14px;
           font-weight: 700;
           border: 1.5px solid var(--border);
           cursor: pointer;
           transition: all 0.2s;
           font-size: 0.95rem;
        }
        .btn-cancel-new:hover { background: var(--bg-soft); color: var(--text); }

        .modal-footer-premium { padding: 1.5rem 2.5rem; background: var(--bg-soft); border-top: 1px solid var(--border); display: flex; justify-content: center; gap: 1.25rem; }

        /* Simulation Styles */
        .simulation-container { background: var(--bg-soft); border-radius: 28px; padding: 1.5rem; height: 100%; border: 1.5px dashed var(--border); display: flex; flex-direction: column; justify-content: center; }
        .glass-card { background: var(--card); border: 1.5px solid var(--border); border-radius: 20px; box-shadow: var(--shadow); }
        .simulation-card { padding: 1.25rem; }
        .simulation-input-wrapper { position: relative; display: flex; align-items: baseline; }
        .simulation-input { background: transparent; border: none; outline: none; font-weight: 900; color: var(--primary); width: 100%; padding: 0; }
        .currency-label { margin-left: 0.5rem; font-weight: 700; color: var(--text-muted); }
        .result-item { display: flex; justify-content: space-between; align-items: center; padding: 0.85rem; border-radius: 12px; background: var(--card); border: 1px solid var(--border); }
        .divider-icon { width: 28px; height: 28px; background: var(--bg-soft); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--text-muted); margin: 0.25rem auto; border: 1px solid var(--border); }
        .result-final { padding: 1.25rem; border-radius: 20px; background: rgba(0, 73, 172, 0.05); border: 2px solid rgba(0, 73, 172, 0.1); display: flex; flex-direction: column; align-items: center; }
        .final-value { font-size: 1.75rem; font-weight: 900; color: var(--primary); }

        /* Toggle Styles */
        .form-toggle-section { display: flex; align-items: center; gap: 1rem; padding: 0.85rem; background: var(--card); border-radius: 14px; border: 1.5px solid var(--border); }
        .toggle-container { position: relative; display: inline-block; width: 44px; height: 22px; }
        .toggle-container input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; inset: 0; background-color: #cbd5e1; transition: .4s; border-radius: 22px; }
        .toggle-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .toggle-slider { background-color: var(--success); }
        input:checked + .toggle-slider:before { transform: translateX(22px); }
        .toggle-title { font-weight: 700; color: var(--text); display: block; font-size: 0.9rem; }
        .toggle-desc { font-size: 0.7rem; color: var(--text-muted); margin: 0; }
        
        @keyframes modalSlideUp { from { opacity: 0; transform: translateY(40px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}} />
    </div>
  );
};

export default CommissionConfig;
