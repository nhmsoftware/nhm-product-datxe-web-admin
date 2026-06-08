import React, { useEffect, useState } from 'react';
import { 
  Search, Filter, Check, X, Ban, Unlock, Eye, 
  MapPin, Calendar, Smartphone, ShieldCheck, 
  Mail, Info, Store, ChevronLeft, ChevronRight,
  FileText, User, RefreshCcw, Lock, Edit, Plus,
  Trash2, Download, Upload, Clock, PlusCircle
} from 'lucide-react';
import merchantService from '../../services/merchantService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const formatDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const MerchantFormModal = ({ open, mode, merchant, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    owner_name: '',
    phone: '',
    email: '',
    store_name: '',
    store_address: '',
    latitude: '',
    longitude: '',
    business_type: '',
    business_license: '',
    opening_time: '',
    closing_time: '',
    registered_at: '',
    status: '1',
    is_active: true,
    password: '',
    lock_reason: '',
    business_license_image: null,
    store_image: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm({
      owner_name: merchant?.user?.customer_profile?.full_name || '',
      phone: merchant?.user?.phone || '',
      email: merchant?.user?.email || '',
      store_name: merchant?.store_name || '',
      store_address: merchant?.store_address || '',
      latitude: merchant?.latitude || '',
      longitude: merchant?.longitude || '',
      business_type: merchant?.business_type ? String(merchant.business_type) : '',
      business_license: merchant?.business_license || '',
      opening_time: merchant?.opening_time || '',
      closing_time: merchant?.closing_time || '',
      registered_at: formatDateInputValue(merchant?.user?.created_at),
      status: merchant?.status ? String(merchant.status) : '1',
      is_active: merchant?.user?.is_active ?? true,
      password: '',
      lock_reason: '',
      business_license_image: null,
      store_image: null,
    });
  }, [open, merchant, mode]);

  if (!open) return null;

  const title = mode === 'create' ? 'Tạo Merchant mới' : 'Chỉnh sửa Merchant';
  const subtitle = mode === 'create'
    ? 'Tạo tài khoản Merchant và thông tin cửa hàng từ Admin Portal.'
    : 'Cập nhật thông tin chủ sở hữu, cửa hàng và trạng thái Merchant.';

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.owner_name.trim()) return toast.error('Vui lòng nhập họ tên chủ sở hữu.');
    if (!form.phone.trim()) return toast.error('Vui lòng nhập số điện thoại chủ sở hữu.');
    if (!/^0[3-9]\d{8}$/.test(form.phone.trim())) return toast.error('Số điện thoại không hợp lệ.');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error('Email không đúng định dạng.');
    if (!form.store_name.trim()) return toast.error('Vui lòng nhập tên cửa hàng.');
    if (!form.store_address.trim()) return toast.error('Vui lòng nhập địa chỉ cửa hàng.');
    if (form.closing_time && form.opening_time && form.closing_time <= form.opening_time) return toast.error('Giờ đóng cửa phải sau giờ mở cửa.');
    if (mode === 'create' && form.password && form.password.length < 8) return toast.error('Mật khẩu tạm thời phải có ít nhất 8 ký tự.');
    if (!form.is_active && !form.lock_reason.trim()) return toast.error('Vui lòng nhập lý do khóa/ngừng hoạt động.');

    const fd = new FormData();
    fd.append('owner_name', form.owner_name.trim());
    fd.append('phone', form.phone.trim());
    fd.append('email', form.email.trim() || '');
    fd.append('store_name', form.store_name.trim());
    fd.append('store_address', form.store_address.trim());
    if (form.latitude !== '') fd.append('latitude', String(form.latitude));
    if (form.longitude !== '') fd.append('longitude', String(form.longitude));
    if (form.business_type) fd.append('business_type', form.business_type);
    if (form.business_license) fd.append('business_license', form.business_license.trim());
    if (form.opening_time) fd.append('opening_time', form.opening_time);
    if (form.closing_time) fd.append('closing_time', form.closing_time);
    if (form.registered_at) fd.append('registered_at', form.registered_at);
    if (form.status) fd.append('status', form.status);
    fd.append('is_active', form.is_active ? '1' : '0');
    if (form.lock_reason) fd.append('lock_reason', form.lock_reason.trim());
    if (mode === 'create' && form.password) fd.append('password', form.password);
    if (form.business_license_image) fd.append('business_license_image', form.business_license_image);
    if (form.store_image) fd.append('store_image', form.store_image);

    setSubmitting(true);
    try {
      await onSubmit(fd);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '980px', width: '95vw' }}>
        <div className="modal-header">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), rgba(0, 144, 106, 0.75))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Store size={22} />
              </div>
              {title}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{subtitle}</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Chủ sở hữu</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Họ và tên <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input value={form.owner_name} onChange={(e) => handleChange('owner_name', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Số điện thoại <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email</label>
                    <input value={form.email} onChange={(e) => handleChange('email', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ngày đăng ký</label>
                    <input type="date" value={form.registered_at} onChange={(e) => handleChange('registered_at', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  {mode === 'create' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mật khẩu tạm thời</label>
                      <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Bỏ trống để hệ thống tự sinh" style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                    </div>
                  )}
                </div>
              </div>

              <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Cửa hàng</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tên cửa hàng <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input value={form.store_name} onChange={(e) => handleChange('store_name', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Địa chỉ <span style={{ color: 'var(--error)' }}>*</span></label>
                    <textarea value={form.store_address} onChange={(e) => handleChange('store_address', e.target.value)} rows={3} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Vĩ độ</label>
                    <input type="number" value={form.latitude} onChange={(e) => handleChange('latitude', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Kinh độ</label>
                    <input type="number" value={form.longitude} onChange={(e) => handleChange('longitude', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Loại hình</label>
                    <select value={form.business_type} onChange={(e) => handleChange('business_type', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}>
                      <option value="">Chưa chọn</option>
                      <option value="1">Nhà hàng</option>
                      <option value="2">Cà phê</option>
                      <option value="3">Trà sữa</option>
                      <option value="4">Đồ ăn nhanh</option>
                      <option value="5">Đồ ăn đường phố</option>
                      <option value="6">Tiệm bánh</option>
                      <option value="7">Tạp hóa</option>
                      <option value="8">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mã số thuế / GPKD</label>
                    <input value={form.business_license} onChange={(e) => handleChange('business_license', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Trạng thái & tài liệu</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Trạng thái phê duyệt</label>
                  <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}>
                    <option value="1">Chờ duyệt</option>
                    <option value="2">Đã duyệt</option>
                    <option value="3">Từ chối</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Trạng thái hoạt động</label>
                  <select value={form.is_active ? '1' : '0'} onChange={(e) => handleChange('is_active', e.target.value === '1')} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}>
                    <option value="1">Hoạt động</option>
                    <option value="0">Tạm ngưng / Khóa</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Giờ hoạt động</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="time" value={form.opening_time} onChange={(e) => handleChange('opening_time', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                    <input type="time" value={form.closing_time} onChange={(e) => handleChange('closing_time', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                </div>
                {!form.is_active && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Lý do khóa / ngừng hoạt động</label>
                    <textarea value={form.lock_reason} onChange={(e) => handleChange('lock_reason', e.target.value)} rows={3} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', resize: 'vertical' }} />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ảnh GPKD</label>
                  <input type="file" accept="image/*" onChange={(e) => handleChange('business_license_image', e.target.files?.[0] || null)} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ảnh cửa hàng</label>
                  <input type="file" accept="image/*" onChange={(e) => handleChange('store_image', e.target.files?.[0] || null)} style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1.25rem 1.5rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-glass" onClick={onClose} disabled={submitting}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: 180 }}>
              {submitting ? 'Đang lưu...' : (mode === 'create' ? 'Tạo Merchant' : 'Lưu thay đổi')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const MerchantDetailModal = ({ merchantId, onClose, onRefresh, onEdit, onDelete }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [merchantId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await merchantService.getMerchantDetail(merchantId);
      setData(response.data.data);
    } catch (error) {
      toast.error('Không thể tải chi tiết Merchant');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '4rem' }}>
          <RefreshCcw size={48} className="animate-spin text-primary" style={{ margin: '0 auto 1.5rem' }} />
          <div className="skeleton" style={{ width: '200px', height: '2rem', margin: '0 auto 1rem' }}></div>
          <div className="skeleton" style={{ width: '150px', height: '1.5rem', margin: '0 auto' }}></div>
        </div>
      </div>
    </div>
  );

  const { merchant } = data;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Store size={24} className="text-primary" /> Chi tiết Merchant
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {data?.merchant && (
              <>
                <button className="btn-icon" onClick={() => onEdit(data.merchant)} title="Chỉnh sửa Merchant">
                  <Edit size={18} />
                </button>
                <button className="btn-icon" onClick={() => onDelete(data.merchant)} title="Xóa Merchant">
                  <Trash2 size={18} className="text-error" />
                </button>
              </>
            )}
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
            <div style={{ 
               width: '140px', 
               height: '140px', 
               borderRadius: '28px', 
               background: 'var(--primary)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: '3.5rem',
               fontWeight: 800,
               color: 'white',
               boxShadow: '0 15px 30px rgba(0, 73, 172, 0.25)',
               overflow: 'hidden'
            }}>
              {merchant.store_image ? (
                <img src={merchant.store_image} alt="Store" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                merchant.store_name?.[0] || 'M'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text)' }}>
                    {merchant.store_name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <MapPin size={16} /> {merchant.store_address}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                   <span className={`badge ${
                    merchant.status === 2 ? 'badge-success' : 
                    merchant.status === 1 ? 'badge-warning' : 
                    'badge-error'
                  }`}>
                    {merchant.status === 2 ? 'Đã duyệt' : merchant.status === 1 ? 'Chờ duyệt' : 'Đã từ chối'}
                  </span>
                  <span className={`badge ${merchant.user?.is_active ? 'badge-success' : 'badge-error'}`}>
                    {merchant.user?.is_active ? 'Hoạt động' : 'Đang bị khóa'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {/* Store Information */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
                <Store size={18} /> THÔNG TIN CỬA HÀNG
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <InfoItem icon={<FileText size={18} />} label="Mã số thuế/GPKD" value={merchant.business_license || 'Chưa cập nhật'} />
                <InfoItem icon={<Calendar size={18} />} label="Giờ hoạt động" value={`${merchant.opening_time} - ${merchant.closing_time}`} />
                <div style={{ marginTop: '0.5rem' }}>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Ảnh GPKD</div>
                   {merchant.business_license_image ? (
                     <img 
                       src={merchant.business_license_image} 
                       alt="License" 
                       style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} 
                     />
                   ) : <div style={{ padding: '1rem', background: 'var(--bg-soft)', borderRadius: '12px', textAlign: 'center', fontSize: '0.875rem' }}>Chưa có ảnh</div>}
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
                <User size={18} /> THÔNG TIN CHỦ SỞ HỮU
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <InfoItem icon={<User size={18} />} label="Họ và tên" value={merchant.user?.customer_profile?.full_name || 'N/A'} />
                <InfoItem icon={<Smartphone size={18} />} label="Số điện thoại" value={merchant.user?.phone} />
                <InfoItem icon={<Mail size={18} />} label="Email" value={merchant.user?.email || 'Chưa cập nhật'} />
                <InfoItem icon={<Calendar size={18} />} label="Ngày đăng ký" value={new Date(merchant.user?.created_at).toLocaleDateString('vi-VN')} />
              </div>

              {merchant.reject_reason && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--error)', borderRadius: '12px' }}>
                   <div style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 700, marginBottom: '0.25rem' }}>LÝ DO TỪ CHỐI</div>
                   <div style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{merchant.reject_reason}</div>
                </div>
              )}

              {merchant.user?.lock_reason && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--error)', borderRadius: '12px' }}>
                   <div style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 700, marginBottom: '0.25rem' }}>LÝ DO KHÓA TÀI KHOẢN</div>
                   <div style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{merchant.user.lock_reason}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Hết hạn: {new Date(merchant.user.lock_expired_at).toLocaleString('vi-VN')}</div>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem', textAlign: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              * Thực đơn nhà hàng được quản lý độc lập tại màn hình danh sách đối tác qua nút "Xem Menu".
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ color: 'var(--primary)' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{value}</div>
    </div>
  </div>
);

const MerchantMenuModal = ({ merchantId, storeName, onClose }) => {
  const [menu, setMenu] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('menu'); // 'menu' | 'logs'
  const [editingItem, setEditingItem] = useState(null); // null | item | { id: 'new' }
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formFields, setFormFields] = useState({
    name: '',
    price: '',
    category_id: '',
    category_name: '',
    description: '',
    image: null,
    sizes: [],
    toppings: []
  });
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchMenu();
    fetchLogs();
  }, [merchantId]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await merchantService.getMerchantMenu(merchantId);
      setMenu(res.data.data || []);
    } catch (err) {
      toast.error('Lỗi khi tải thực đơn');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await merchantService.getMenuLogs(merchantId);
      setLogs(res.data.data || []);
    } catch (err) {
      console.error('Error fetching logs', err);
    }
  };

  const handleStatusToggle = async (item, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await merchantService.updateMenuItemStatus(merchantId, item.id, newStatus);
      toast.success(`Đã cập nhật: ${newStatus ? 'Còn bán' : 'Tạm ẩn'}`);
      fetchMenu();
      fetchLogs();
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái món ăn');
    }
  };

  const handleDeleteItem = async (item) => {
    const result = await Swal.fire({
      title: 'Xóa món ăn?',
      text: `Xóa món "${item.name}" khỏi thực đơn? Hành động này không thể hoàn tác.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        await merchantService.deleteMenuItem(merchantId, item.id);
        toast.success('Xóa món ăn thành công');
        fetchMenu();
        fetchLogs();
      } catch (err) {
        toast.error('Lỗi khi xóa món');
      }
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const loader = toast.loading('Đang nhập thực đơn...');
    try {
      await merchantService.importMenu(merchantId, file);
      toast.dismiss(loader);
      toast.success('Đã nhập thực đơn thành công!');
      fetchMenu();
      fetchLogs();
    } catch (err) {
      toast.dismiss(loader);
      toast.error(err.response?.data?.message || 'Lỗi khi nhập thực đơn');
    } finally {
      e.target.value = '';
    }
  };

  const openAddForm = () => {
    setFormFields({
      name: '',
      price: '',
      category_id: menu[0]?.id || '',
      category_name: '',
      description: '',
      image: null,
      sizes: [],
      toppings: []
    });
    setUseNewCategory(menu.length === 0);
    setImagePreview(null);
    setEditingItem({ id: 'new' });
  };

  const openEditForm = (item) => {
    setFormFields({
      name: item.name,
      price: item.price,
      category_id: item.category_id || '',
      category_name: '',
      description: item.description || '',
      image: null,
      sizes: item.sizes || [],
      toppings: item.toppings || []
    });
    setUseNewCategory(false);
    setImagePreview(item.image_path);
    setEditingItem(item);
  };

  // Form Sub-elements handlers
  const handleAddSize = () => {
    setFormFields(prev => ({
      ...prev,
      sizes: [...prev.sizes, { name: '', price: '', is_default: false }]
    }));
  };

  const handleRemoveSize = (idx) => {
    setFormFields(prev => {
      const copy = [...prev.sizes];
      copy.splice(idx, 1);
      return { ...prev, sizes: copy };
    });
  };

  const handleSizeChange = (idx, key, val) => {
    setFormFields(prev => {
      const copy = [...prev.sizes];
      copy[idx] = { ...copy[idx], [key]: val };
      return { ...prev, sizes: copy };
    });
  };

  const handleAddTopping = () => {
    setFormFields(prev => ({
      ...prev,
      toppings: [...prev.toppings, { name: '', price: '', max_quantity: 1, is_required: false }]
    }));
  };

  const handleRemoveTopping = (idx) => {
    setFormFields(prev => {
      const copy = [...prev.toppings];
      copy.splice(idx, 1);
      return { ...prev, toppings: copy };
    });
  };

  const handleToppingChange = (idx, key, val) => {
    setFormFields(prev => {
      const copy = [...prev.toppings];
      copy[idx] = { ...copy[idx], [key]: val };
      return { ...prev, toppings: copy };
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormFields(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formFields.name || !formFields.price) {
      toast.error('Vui lòng điền đầy đủ Tên món và Giá.');
      return;
    }

    const catName = useNewCategory 
      ? formFields.category_name 
      : menu.find(c => String(c.id) === String(formFields.category_id))?.name || '';

    if (useNewCategory && !formFields.category_name) {
      toast.error('Vui lòng nhập tên danh mục mới.');
      return;
    }

    if (!useNewCategory && !formFields.category_id) {
      toast.error('Vui lòng chọn danh mục.');
      return;
    }

    const fd = new FormData();
    fd.append('name', formFields.name);
    fd.append('price', String(formFields.price));
    fd.append('description', formFields.description || '');
    fd.append('category_name', catName);
    if (!useNewCategory) {
      fd.append('category_id', String(formFields.category_id));
    }

    if (formFields.image) {
      fd.append('image', formFields.image);
    }

    formFields.sizes.forEach((size, idx) => {
      if (size.name && size.price !== '') {
        fd.append(`sizes[${idx}][name]`, size.name);
        fd.append(`sizes[${idx}][price]`, String(size.price));
        fd.append(`sizes[${idx}][is_default]`, size.is_default ? '1' : '0');
      }
    });

    formFields.toppings.forEach((topping, idx) => {
      if (topping.name && topping.price !== '') {
        fd.append(`toppings[${idx}][name]`, topping.name);
        fd.append(`toppings[${idx}][price]`, String(topping.price));
        fd.append(`toppings[${idx}][max_quantity]`, String(topping.max_quantity || 1));
        fd.append(`toppings[${idx}][is_required]`, topping.is_required ? '1' : '0');
      }
    });

    setIsSaving(true);
    const loadingToast = toast.loading('Đang lưu món ăn...');
    try {
      if (editingItem.id === 'new') {
        await merchantService.createMenuItem(merchantId, fd);
        toast.success('Thêm món ăn mới thành công!');
      } else {
        await merchantService.updateMenuItem(merchantId, editingItem.id, fd);
        toast.success('Cập nhật món ăn thành công!');
      }
      setEditingItem(null);
      fetchMenu();
      fetchLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu món ăn.');
    } finally {
      toast.dismiss(loadingToast);
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '1000px', background: 'var(--bg)', borderRadius: '24px' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', padding: '1.5rem 2rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>
            <Store size={24} className="text-primary" /> Quản lý thực đơn — {storeName}
          </h2>
          <button className="btn-icon" onClick={onClose} disabled={isSaving}><X size={20} /></button>
        </div>

        <div className="modal-body" style={{ padding: '2rem' }}>
          {/* Main Sub Tabs */}
          {!editingItem && (
            <div className="tabs-container" style={{ marginBottom: '2rem' }}>
              <button 
                className={`tab-item ${activeSubTab === 'menu' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('menu')}
              >
                🍔 Danh sách món ăn
              </button>
              <button 
                className={`tab-item ${activeSubTab === 'logs' ? 'active' : ''}`}
                onClick={() => setActiveSubTab('logs')}
              >
                📜 Nhật ký chỉnh sửa
              </button>
            </div>
          )}

          {/* Form Editor Mode */}
          {editingItem ? (
            <form onSubmit={handleSaveItem} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {editingItem.id === 'new' ? '✨ Thêm món ăn mới' : `📝 Chỉnh sửa: ${editingItem.name}`}
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                {/* Left Side: General Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Tên món ăn <span className="text-error">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ví dụ: Cơm sườn nướng mật ong"
                      value={formFields.name}
                      onChange={e => setFormFields({...formFields, name: e.target.value})}
                      style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none', transition: 'border-color 0.2s' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Giá bán (VND) <span className="text-error">*</span></label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      placeholder="Ví dụ: 45000"
                      value={formFields.price}
                      onChange={e => setFormFields({...formFields, price: e.target.value})}
                      style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Danh mục <span className="text-error">*</span></label>
                      <button 
                        type="button" 
                        onClick={() => setUseNewCategory(!useNewCategory)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {useNewCategory ? 'Chọn danh mục có sẵn' : '+ Tạo danh mục mới'}
                      </button>
                    </div>

                    {useNewCategory ? (
                      <input 
                        type="text" 
                        required
                        placeholder="Nhập danh mục mới (Món chính, Đồ uống, v.v.)"
                        value={formFields.category_name}
                        onChange={e => setFormFields({...formFields, category_name: e.target.value})}
                        style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }}
                      />
                    ) : (
                      <select 
                        value={formFields.category_id}
                        onChange={e => setFormFields({...formFields, category_id: e.target.value})}
                        style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }}
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {menu.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Mô tả chi tiết</label>
                    <textarea 
                      placeholder="Mô tả nguyên liệu, hương vị món ăn..."
                      value={formFields.description}
                      onChange={e => setFormFields({...formFields, description: e.target.value})}
                      style={{ width: '100%', padding: '0.875rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', minHeight: '100px', resize: 'vertical', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Right Side: Media, Sizes & Toppings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Hình ảnh món ăn</label>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', padding: '1rem', background: 'var(--bg-soft)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <div style={{ 
                        width: '80px', height: '80px', borderRadius: '12px', border: '2px dashed var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'var(--bg)'
                      }}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : <span style={{ fontSize: '1.5rem' }}>🍲</span>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ fontSize: '0.8rem' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chấp nhận tệp ảnh JPG, PNG. Tối đa 2MB.</span>
                      </div>
                    </div>
                  </div>

                  {/* Sizes Management */}
                  <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Kích thước (Size)</label>
                      <button type="button" onClick={handleAddSize} className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'white', border: 'none' }}>
                        <Plus size={12} /> Thêm size
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '130px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                      {formFields.sizes.length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chưa cấu hình các size khác nhau.</span>
                      ) : formFields.sizes.map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            placeholder="Tên (Lớn, Vừa)" 
                            value={s.name}
                            onChange={e => handleSizeChange(idx, 'name', e.target.value)}
                            style={{ flex: 1, padding: '0.5rem 0.75rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                          />
                          <input 
                            type="number" 
                            placeholder="Giá thêm" 
                            value={s.price}
                            onChange={e => handleSizeChange(idx, 'price', e.target.value)}
                            style={{ width: '110px', padding: '0.5rem 0.75rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                          />
                          <button type="button" onClick={() => handleRemoveSize(idx)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Toppings Management */}
                  <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Topping thêm</label>
                      <button type="button" onClick={handleAddTopping} className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--primary)', color: 'white', border: 'none' }}>
                        <Plus size={12} /> Thêm topping
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '130px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                      {formFields.toppings.length === 0 ? (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Chưa có topping đi kèm.</span>
                      ) : formFields.toppings.map((t, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            placeholder="Tên (Trân châu, Thạch)" 
                            value={t.name}
                            onChange={e => handleToppingChange(idx, 'name', e.target.value)}
                            style={{ flex: 1, padding: '0.5rem 0.75rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                          />
                          <input 
                            type="number" 
                            placeholder="Giá" 
                            value={t.price}
                            onChange={e => handleToppingChange(idx, 'price', e.target.value)}
                            style={{ width: '110px', padding: '0.5rem 0.75rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '0.85rem', outline: 'none' }}
                          />
                          <button type="button" onClick={() => handleRemoveTopping(idx)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <button type="button" className="btn btn-glass" onClick={() => setEditingItem(null)} disabled={isSaving}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ minWidth: '130px' }}>
                  {isSaving ? <RefreshCcw size={16} className="animate-spin" /> : 'Lưu món ăn'}
                </button>
              </div>
            </form>
          ) : activeSubTab === 'menu' ? (
            /* Menu Display View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Header Panel */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                <button className="btn btn-primary" onClick={openAddForm} style={{ borderRadius: '12px' }}>
                  <PlusCircle size={18} /> Thêm món mới
                </button>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <a href={merchantService.getExportTemplateUrl()} className="btn btn-glass" style={{ textDecoration: 'none', borderRadius: '12px', fontSize: '0.875rem' }} title="Tải file mẫu Excel">
                    <Download size={16} /> Mẫu excel menu
                  </a>

                  <label className="btn btn-glass" style={{ cursor: 'pointer', borderRadius: '12px', fontSize: '0.875rem' }} title="Nhập thực đơn từ file Excel/CSV">
                    <Upload size={16} /> Nhập Excel/CSV
                    <input
                        type="file"
                        accept=".csv,.txt,.xls,.xlsx,.xlse,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        onChange={handleImport}
                        style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                  <RefreshCcw size={40} className="animate-spin text-primary" style={{ margin: '0 auto 1.25rem' }} />
                  <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Đang tải danh sách món ăn...</div>
                </div>
              ) : menu.length === 0 ? (
                <div style={{ padding: '5rem 2rem', textAlign: 'center', background: 'var(--bg-soft)', borderRadius: '24px', color: 'var(--text-muted)' }}>
                  <Store size={48} style={{ opacity: 0.25, marginBottom: '1.25rem', color: 'var(--primary)' }} />
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>Chưa có thực đơn</h4>
                  <p style={{ fontSize: '0.875rem' }}>Bắt đầu bằng việc thêm món thủ công hoặc nhập tệp tin mẫu Excel.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  {menu.map(category => (
                    <div key={category.id} className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '2px solid var(--primary)', color: 'var(--text)', display: 'inline-block' }}>
                        {category.name} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>({category.items?.length || 0} món)</span>
                      </h4>

                      {(!category.items || category.items.length === 0) ? (
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>Chưa có món ăn trong danh mục này.</div>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                          {category.items.map(item => (
                            <div key={item.id} className="glass-hover" style={{ 
                              display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--bg-soft)', borderRadius: '16px', border: '1px solid var(--border)',
                              position: 'relative', transition: 'all 0.2s', minHeight: '110px'
                            }}>
                              <div style={{ width: '68px', height: '68px', borderRadius: '12px', overflow: 'hidden', background: 'var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.image_path ? (
                                  <img src={item.image_path} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : <span style={{ fontSize: '1.5rem' }}>🍲</span>}
                              </div>

                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: '2rem' }}>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.25rem' }}>{item.name}</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>
                                    {item.description || 'Không có mô tả sản phẩm.'}
                                  </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1rem' }}>
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                  </span>

                                  {/* Availability custom radio badge switcher */}
                                  <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg)', padding: '0.15rem 0.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <label style={{ 
                                      display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, 
                                      padding: '0.25rem 0.5rem', borderRadius: '6px', 
                                      backgroundColor: item.is_available ? 'rgba(16, 185, 129, 0.15)' : 'transparent', 
                                      color: item.is_available ? 'var(--success)' : 'var(--text-muted)',
                                      transition: 'all 0.2s'
                                    }}>
                                      <input 
                                        type="radio" 
                                        name={`status-${item.id}`}
                                        checked={!!item.is_available} 
                                        onChange={() => !item.is_available && handleStatusToggle(item, false)}
                                        style={{ display: 'none' }}
                                      />
                                      Còn bán
                                    </label>
                                    <label style={{ 
                                      display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, 
                                      padding: '0.25rem 0.5rem', borderRadius: '6px', 
                                      backgroundColor: !item.is_available ? 'rgba(239, 68, 68, 0.15)' : 'transparent', 
                                      color: !item.is_available ? 'var(--error)' : 'var(--text-muted)',
                                      transition: 'all 0.2s'
                                    }}>
                                      <input 
                                        type="radio" 
                                        name={`status-${item.id}`}
                                        checked={!item.is_available} 
                                        onChange={() => item.is_available && handleStatusToggle(item, true)}
                                        style={{ display: 'none' }}
                                      />
                                      Tạm ẩn
                                    </label>
                                  </div>
                                </div>
                              </div>

                              {/* Hover actions menu item */}
                              <div style={{ 
                                display: 'flex', gap: '0.25rem', 
                                position: 'absolute', right: '0.5rem', top: '0.5rem',
                                background: 'var(--card)', border: '1px solid var(--border)',
                                padding: '0.25rem', borderRadius: '8px', 
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                              }}>
                                <button onClick={() => openEditForm(item)} style={{ background: 'transparent', border: 'none', borderRadius: '4px', padding: '0.25rem', color: 'var(--warning)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Chỉnh sửa món"><Edit size={13} /></button>
                                <button onClick={() => handleDeleteItem(item)} style={{ background: 'transparent', border: 'none', borderRadius: '4px', padding: '0.25rem', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Xóa món"><Trash2 size={13} /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Audit Logs View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)' }}>
                  📜 Lịch sử chỉnh sửa thực đơn
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Nhật ký lưu lại tất cả hành động thêm, sửa, xóa, import thực đơn của Admin.</p>
              </div>

              {logs.length === 0 ? (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--bg-soft)', borderRadius: '20px', color: 'var(--text-muted)' }}>
                  Chưa có lịch sử chỉnh sửa thực đơn nào được ghi nhận.
                </div>
              ) : (
                <div style={{ maxHeight: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.875rem', paddingRight: '0.5rem' }}>
                  {logs.map(log => (
                    <div key={log.id} style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem', background: 'var(--bg-soft)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                      <div style={{ 
                        width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(0, 77, 160, 0.1)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0
                      }}>
                        <Clock size={16} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)' }}>Admin ({log.actor?.phone || 'N/A'})</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {new Date(log.created_at).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text)', lineHeight: '1.4' }}>
                          {log.description}
                        </div>

                        {/* Old / New values formatted cleanly */}
                        {(log.old_values || log.new_values) && (
                          <div style={{ marginTop: '0.75rem', background: 'var(--card)', padding: '0.75rem 1rem', borderRadius: '12px', fontSize: '0.8rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {log.old_values && (
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ color: 'var(--error)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>[Trước]:</span>
                                {typeof log.old_values === 'object' ? (
                                  Object.entries(log.old_values).map(([k, v]) => {
                                    if (k === 'sizes' || k === 'toppings') return null;
                                    return (
                                      <span key={k} style={{ background: 'rgba(239, 68, 68, 0.05)', color: 'var(--error)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                        {k}: {typeof v === 'object' ? '...' : String(v)}
                                      </span>
                                    );
                                  })
                                ) : String(log.old_values)}
                              </div>
                            )}
                            {log.new_values && (
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <span style={{ color: 'var(--success)', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.7rem' }}>[Sau]:</span>
                                {typeof log.new_values === 'object' ? (
                                  Object.entries(log.new_values).map(([k, v]) => {
                                    if (k === 'sizes' || k === 'toppings') return null;
                                    return (
                                      <span key={k} style={{ background: 'rgba(16, 185, 129, 0.05)', color: 'var(--success)', padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>
                                        {k}: {typeof v === 'object' ? '...' : String(v)}
                                      </span>
                                    );
                                  })
                                ) : String(log.new_values)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MerchantList = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [params, setParams] = useState({ 
    keyword: '', 
    status: '', 
    page: 1 
  });
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);
  const [selectedMenuMerchant, setSelectedMenuMerchant] = useState(null); // { id, name }
  const [showMerchantForm, setShowMerchantForm] = useState(false);
  const [merchantFormMode, setMerchantFormMode] = useState('create');
  const [merchantFormTarget, setMerchantFormTarget] = useState(null);

  useEffect(() => {
    fetchMerchants();
  }, [params]);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await merchantService.getMerchants(params);
      const paginator = response.data.data;
      setMerchants(paginator.data || []);
      setPagination({
        current_page: paginator.current_page,
        last_page: paginator.last_page,
        total: paginator.total
      });
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Merchant');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (m) => {
    const result = await Swal.fire({
      title: 'Duyệt Merchant?',
      text: `Duyệt hồ sơ kinh doanh cho "${m.store_name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#00906a'
    });

    if (result.isConfirmed) {
      try {
        await merchantService.approveMerchant(m.id);
        toast.success('Duyệt Merchant thành công');
        fetchMerchants();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi duyệt');
      }
    }
  };

  const handleReject = async (m) => {
    const { value: reason } = await Swal.fire({
      title: 'Từ chối Merchant',
      input: 'textarea',
      inputLabel: 'Lý do từ chối',
      inputPlaceholder: 'Vui lòng nhập lý do...',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      confirmButtonColor: '#ef4444'
    });

    if (reason) {
      try {
        await merchantService.rejectMerchant(m.id, reason);
        toast.success('Đã từ chối Merchant');
        fetchMerchants();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi từ chối');
      }
    }
  };

  const handleToggleLock = async (m) => {
    const isLocking = m.user?.is_active;
    
    if (isLocking) {
      const { value: formValues } = await Swal.fire({
        title: 'Khóa tài khoản Merchant',
        html: `
          <div style="text-align: left;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Lý do khóa <span style="color: var(--error);">*</span></label>
            <textarea id="lock-reason" class="swal2-textarea" style="margin: 0; width: 100%;" placeholder="Nhập lý do khóa..."></textarea>
            
            <label style="display: block; margin-top: 1.5rem; margin-bottom: 8px; font-weight: 600;">Số ngày khóa (Mặc định 2 ngày)</label>
            <input id="lock-days" type="number" class="swal2-input" style="margin: 0; width: 100%;" placeholder="Ví dụ: 7" min="2" value="2">
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 6px;">* Tài khoản phải bị khóa tối thiểu 2 ngày. Nhập từ 2 trở lên.</div>
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Xác nhận khóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: 'var(--error)',
        preConfirm: () => {
          const reason = document.getElementById('lock-reason').value;
          const days = document.getElementById('lock-days').value;
          
          if (!reason) {
            Swal.showValidationMessage('Vui lòng nhập lý do khóa tài khoản.');
            return false;
          }

          if (days) {
            const parsedDays = parseInt(days, 10);
            if (isNaN(parsedDays) || parsedDays < 2) {
              Swal.showValidationMessage('Số ngày khóa không hợp lệ.');
              return false;
            }
          }
          
          return {
            reason: reason,
            locked_days: days ? parseInt(days, 10) : 2
          };
        }
      });

      if (formValues) {
        try {
          const loadingToast = toast.loading('Đang xử lý...');
          await merchantService.toggleLock(m.id, true, formValues.reason, formValues.locked_days);
          toast.dismiss(loadingToast);
          toast.success('Đã khóa tài khoản Merchant');
          fetchMerchants();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Lỗi khi khóa');
        }
      }
    } else {
      const result = await Swal.fire({
        title: 'Mở khóa Merchant?',
        text: `Bạn có chắc chắn muốn mở khóa cho Merchant "${m.store_name}" không?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý mở khóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: 'var(--success)'
      });

      if (result.isConfirmed) {
        try {
          const loadingToast = toast.loading('Đang xử lý...');
          await merchantService.toggleLock(m.id, false);
          toast.dismiss(loadingToast);
          toast.success('Mở khóa tài khoản thành công');
          fetchMerchants();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Lỗi khi mở khóa');
        }
      }
    }
  };

  const handleOpenCreateMerchant = () => {
    setMerchantFormMode('create');
    setMerchantFormTarget(null);
    setShowMerchantForm(true);
  };

  const handleEditMerchant = (merchant) => {
    setMerchantFormMode('edit');
    setMerchantFormTarget(merchant);
    setShowMerchantForm(true);
  };

  const handleDeleteMerchant = async (merchant) => {
    const result = await Swal.fire({
      title: 'Xóa Merchant?',
      html: `
        <div style="text-align:left;">
          <div>Bạn có chắc muốn xóa Merchant <b>${merchant.store_name}</b> không?</div>
          <div style="margin-top:0.75rem; color:var(--text-muted); font-size:0.9rem;">Thao tác này sẽ xóa mềm Merchant nếu không có đơn hàng đang xử lý.</div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận xóa',
      cancelButtonText: 'Hủy',
      confirmButtonColor: 'var(--error)',
    });

    if (!result.isConfirmed) return;

    try {
      const loadingToast = toast.loading('Đang xóa Merchant...');
      await merchantService.deleteMerchant(merchant.id);
      toast.dismiss(loadingToast);
      toast.success('Xóa Merchant thành công');
      setSelectedMerchantId(null);
      fetchMerchants();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa Merchant');
    }
  };

  return (
    <div className="merchants-page" style={{ padding: '2rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Quản lý nhà hàng</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Hệ thống xét duyệt và quản lý đối tác nhà hàng, cửa hàng.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handleOpenCreateMerchant}>
            <Plus size={18} /> Tạo Merchant
          </button>
          <button className="btn btn-glass" onClick={() => fetchMerchants()}>
            <RefreshCcw size={18} /> Làm mới
          </button>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => { setActiveTab('all'); setParams({ ...params, status: '', page: 1 }); }}
        >
          Tất cả
        </button>
        <button 
          className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => { setActiveTab('pending'); setParams({ ...params, status: '1', page: 1 }); }}
        >
          Đang chờ duyệt
        </button>
        <button 
          className={`tab-item ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => { setActiveTab('approved'); setParams({ ...params, status: '2', page: 1 }); }}
        >
          Đã duyệt
        </button>
      </div>

      <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', borderRadius: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm theo tên cửa hàng, SĐT, Email..." 
            style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}
            onChange={(e) => setParams({ ...params, keyword: e.target.value, page: 1 })}
          />
        </div>
      </div>

      <div className="glass" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">Đang tải dữ liệu...</div>
        ) : merchants.length === 0 ? (
          <div className="empty-state" style={{ padding: '5rem 0' }}>
            <Store size={64} style={{ marginBottom: '1.5rem', opacity: 0.2, color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Không có Merchant nào</h3>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cửa hàng</th>
                  <th>Chủ sở hữu</th>
                  <th>Trạng thái duyệt</th>
                  <th>Tài khoản</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map(m => (
                  <tr key={m.id} className="glass-hover">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '44px', height: '44px', borderRadius: '12px', 
                          background: 'var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white'
                        }}>
                          {m.store_name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{m.store_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.store_address}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.user?.customer_profile?.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.user?.phone}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        m.status === 2 ? 'badge-success' : 
                        m.status === 1 ? 'badge-warning' : 
                        'badge-error'
                      }`}>
                        {m.status === 2 ? 'Đã duyệt' : m.status === 1 ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${m.user?.is_active ? 'badge-success' : 'badge-error'}`} style={{ marginBottom: m.user?.is_active ? 0 : '4px' }}>
                        {m.user?.is_active ? 'Kích hoạt' : 'Bị khóa'}
                      </span>
                      {!m.user?.is_active && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>
                          <div style={{ fontWeight: 600, color: 'var(--error)' }}>Lý do: {m.user?.lock_reason || 'N/A'}</div>
                          <div>Hết hạn: {m.user?.lock_expired_at ? new Date(m.user.lock_expired_at).toLocaleString('vi-VN') : 'Vĩnh viễn'}</div>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button onClick={() => setSelectedMerchantId(m.id)} className="btn-action btn-action-view">
                          <Eye size={16} /> Chi tiết
                        </button>

                        <button onClick={() => handleEditMerchant(m)} className="btn-action" style={{ background: 'rgba(0, 73, 172, 0.08)', color: 'var(--primary)', borderColor: 'rgba(0, 73, 172, 0.2)' }}>
                          <Edit size={16} /> Sửa
                        </button>
                        
                        <button 
                          onClick={() => setSelectedMenuMerchant({ id: m.id, name: m.store_name })} 
                          className="btn-action btn-action-view"
                          style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)' }}
                        >
                          <Store size={16} /> Xem Menu
                        </button>
                        
                        {m.status === 1 && (
                          <>
                            <button onClick={() => handleApprove(m)} className="btn-action btn-action-approve"><Check size={16} /></button>
                            <button onClick={() => handleReject(m)} className="btn-action btn-action-reject"><X size={16} /></button>
                          </>
                        )}
                        
                        <button onClick={() => handleToggleLock(m)} className="btn-icon" title={m.user?.is_active ? 'Khóa' : 'Mở khóa'}>
                          {m.user?.is_active ? <Ban size={18} className="text-error" /> : <Unlock size={18} className="text-success" />}
                        </button>

                        <button onClick={() => handleDeleteMerchant(m)} className="btn-icon" title="Xóa Merchant">
                          <Trash2 size={18} className="text-error" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MerchantFormModal
        open={showMerchantForm}
        mode={merchantFormMode}
        merchant={merchantFormTarget}
        onClose={() => setShowMerchantForm(false)}
        onSubmit={async (formData) => {
          const loadingToast = toast.loading(merchantFormMode === 'create' ? 'Đang tạo Merchant...' : 'Đang cập nhật Merchant...');
          try {
            if (merchantFormMode === 'create') {
              const response = await merchantService.createMerchant(formData);
              if (response?.data?.temporary_password) {
                await Swal.fire({
                  title: 'Tạo Merchant thành công',
                  html: `
                    <div style="text-align:left;">
                      <div style="margin-bottom:0.75rem;">Merchant đã được tạo thành công.</div>
                      <div style="padding:0.85rem 1rem; border-radius:12px; background:var(--bg-soft); border:1px solid var(--border);">
                        <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.35rem;">Mật khẩu tạm thời</div>
                        <div style="font-size:1.05rem; font-weight:800; letter-spacing:0.04em;">${response.data.temporary_password}</div>
                      </div>
                    </div>
                  `,
                  confirmButtonText: 'Đã hiểu',
                  confirmButtonColor: 'var(--primary)',
                });
              } else {
                toast.success('Tạo Merchant thành công');
              }
            } else if (merchantFormTarget) {
              await merchantService.updateMerchant(merchantFormTarget.id, formData);
              toast.success('Cập nhật Merchant thành công');
              setSelectedMerchantId(merchantFormTarget.id);
            }
            fetchMerchants();
          } catch (error) {
            toast.error(error.response?.data?.message || (merchantFormMode === 'create' ? 'Không thể tạo Merchant' : 'Không thể cập nhật Merchant'));
          } finally {
            toast.dismiss(loadingToast);
          }
        }}
      />

      {selectedMerchantId && (
        <MerchantDetailModal 
          merchantId={selectedMerchantId} 
          onClose={() => setSelectedMerchantId(null)} 
          onRefresh={fetchMerchants}
          onEdit={handleEditMerchant}
          onDelete={handleDeleteMerchant}
        />
      )}

      {selectedMenuMerchant && (
        <MerchantMenuModal 
          merchantId={selectedMenuMerchant.id}
          storeName={selectedMenuMerchant.name}
          onClose={() => setSelectedMenuMerchant(null)}
        />
      )}
    </div>
  );
};

export default MerchantList;
