import React, { useEffect, useState } from 'react';
import { Search, Filter, CheckCircle, XCircle, Check, X, Ban, Unlock, Car, Eye, MapPin, Calendar, Smartphone, ShieldCheck, Mail, Info, Package, ChevronLeft, ChevronRight, User } from 'lucide-react';

import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { DRIVER_SERVICE_OPTIONS } from '../../constants/serviceCatalog';

import { useLocation } from 'react-router-dom';

const formatDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const DEFAULT_VEHICLE_TYPES = [
  { id: 1, name_vi: 'Xe máy' },
  { id: 2, name_vi: 'Ô tô 4 chỗ' },
  { id: 3, name_vi: 'Ô tô 7 chỗ' },
  { id: 4, name_vi: 'Ô tô 9 chỗ' },
  { id: 5, name_vi: 'Xe ghép / Tiện chuyến' },
];

const DriverFormModal = ({ open, mode, driver, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: '',
    birthday: '',
    address: '',
    password: '',
    is_active: true,
    lock_reason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState(DEFAULT_VEHICLE_TYPES);

  useEffect(() => {
    const loadVehicleTypes = async () => {
      try {
        const response = await adminService.getVehicleTypes();
        if (Array.isArray(response?.data) && response.data.length > 0) {
          setVehicleTypes(response.data);
        }
      } catch (error) {
        console.error('Không thể tải danh mục loại xe', error);
      }
    };

    loadVehicleTypes();
  }, []);

  useEffect(() => {
    if (!open) return;

    setForm({
      full_name: driver?.full_name || '',
      phone: driver?.phone || '',
      email: driver?.email || '',
      gender: driver?.gender ? String(driver.gender) : '',
      birthday: formatDateInputValue(driver?.birthday),
      address: driver?.address || '',
      password: '',
      is_active: driver?.is_active ?? true,
      lock_reason: '',
    });
  }, [open, driver, mode]);

  if (!open) return null;

  const title = mode === 'create' ? 'Tạo tài xế mới' : 'Chỉnh sửa tài xế';
  const subtitle = mode === 'create'
    ? 'Tạo tài khoản tài xế trước, hồ sơ vận hành/KYC có thể bổ sung sau.'
    : 'Cập nhật hồ sơ tài xế, thông tin xe và trạng thái xét duyệt.';

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.full_name.trim()) return toast.error('Vui lòng nhập họ và tên.');
    if (!form.phone.trim()) return toast.error('Vui lòng nhập số điện thoại.');
    if (!/^0[3-9]\d{8}$/.test(form.phone.trim())) return toast.error('Số điện thoại không hợp lệ.');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error('Email không đúng định dạng.');
    if (form.birthday) {
      const birthday = new Date(form.birthday);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (birthday >= today) return toast.error('Ngày sinh phải trước ngày hôm nay.');
    }
    if (mode === 'create' && form.password && form.password.length < 8) return toast.error('Mật khẩu tạm thời phải có ít nhất 8 ký tự.');
    if (mode === 'edit' && !form.is_active && !form.lock_reason.trim()) return toast.error('Vui lòng nhập lý do khóa tài khoản.');

    setSubmitting(true);
    try {
      await onSubmit({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        gender: form.gender ? Number(form.gender) : null,
        birthday: form.birthday || null,
        address: form.address.trim() || null,
        is_active: !!form.is_active,
        lock_reason: form.lock_reason.trim() || null,
        ...(mode === 'create' ? { password: form.password || null } : {}),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '920px', width: '94vw' }}>
        <div className="modal-header">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), rgba(0, 144, 106, 0.75))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 20px rgba(0, 73, 172, 0.2)' }}>
                <Car size={22} />
              </div>
              {title}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{subtitle}</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
              <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Thông tin cơ bản</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Họ và tên <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input className="input-focus" value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} placeholder="Nguyễn Văn Tài" style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Số điện thoại <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input className="input-focus" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} placeholder="0900000012" style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email</label>
                    <input className="input-focus" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="driver@example.com" style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Giới tính</label>
                    <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}>
                      <option value="">Chưa cập nhật</option>
                      <option value="1">Nam</option>
                      <option value="2">Nữ</option>
                      <option value="3">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ngày sinh</label>
                    <input type="date" value={form.birthday} onChange={(e) => handleChange('birthday', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Địa chỉ</label>
                    <textarea value={form.address} onChange={(e) => handleChange('address', e.target.value)} rows={3} placeholder="12 Cách Mạng Tháng 8, Q3, TP.HCM" style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', resize: 'vertical' }} />
                  </div>
                </div>
              </div>

              <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Tài khoản & xét duyệt</div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Trạng thái tài khoản</label>
                    <select value={form.is_active ? '1' : '0'} onChange={(e) => handleChange('is_active', e.target.value === '1')} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}>
                      <option value="1">Đang hoạt động</option>
                      <option value="0">Khóa tài khoản</option>
                    </select>
                  </div>
                  {!form.is_active && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Lý do khóa</label>
                      <textarea value={form.lock_reason} onChange={(e) => handleChange('lock_reason', e.target.value)} rows={3} placeholder="Nhập lý do khóa tài khoản..." style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', resize: 'vertical' }} />
                    </div>
                  )}
                  {mode === 'create' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mật khẩu tạm thời</label>
                      <input type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} placeholder="Bỏ trống để hệ thống tự sinh" style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                      <div style={{ marginTop: '0.55rem', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Sau khi tạo xong, bạn có thể dùng action Upload KYC để bổ sung hồ sơ vận hành và giấy tờ.
                      </div>
                    </div>
                  )}
                  {mode === 'edit' && (
                    <div style={{ padding: '1rem', borderRadius: '16px', background: 'linear-gradient(180deg, rgba(0, 73, 172, 0.08), rgba(0, 73, 172, 0.02))', border: '1px solid rgba(0, 73, 172, 0.15)' }}>
                      <div style={{ fontWeight: 800, marginBottom: '0.35rem' }}>KYC và thông tin xe</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        Hồ sơ KYC, dịch vụ đăng ký và giấy tờ xe được quản lý riêng bằng action <b>Upload KYC</b> để tránh trùng dữ liệu với form tạo tài xế.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1.25rem 1.5rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-glass" onClick={onClose} disabled={submitting}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: 180 }}>
              {submitting ? 'Đang lưu...' : (mode === 'create' ? 'Tạo tài xế' : 'Lưu thay đổi')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DriverKycUploadModal = ({ open, driver, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    citizen_id: '',
    vehicle_type_id: '',
    vehicle_name: '',
    vehicle_color: '',
    vehicle_number: '',
    vehicle_year: new Date().getFullYear(),
    services: [],
    files: {},
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm({
      full_name: driver?.full_name || '',
      phone: driver?.phone || '',
      citizen_id: '',
      vehicle_type_id: driver?.vehicle_info?.vehicle_type_id ? String(driver.vehicle_info.vehicle_type_id) : '',
      vehicle_name: driver?.vehicle_info?.vehicle_name || '',
      vehicle_color: '',
      vehicle_number: driver?.vehicle_info?.vehicle_number || '',
      vehicle_year: new Date().getFullYear(),
      services: [],
      files: {},
    });
  }, [open, driver]);

  if (!open || !driver) return null;

  const serviceOptions = DRIVER_SERVICE_OPTIONS;

  const fileFields = [
    ['cccd_front', 'CCCD mặt trước'],
    ['cccd_back', 'CCCD mặt sau'],
    ['driver_license', 'Bằng lái xe'],
    ['vehicle_reg', 'Giấy đăng ký xe'],
    ['criminal_record', 'Lý lịch tư pháp'],
    ['health_cert', 'Giấy khám sức khỏe'],
    ['portrait', 'Ảnh chân dung'],
    ['insurance', 'Bảo hiểm xe'],
  ];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleService = (serviceId) => {
    setForm(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(id => id !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const handleFileChange = (key, file) => {
    setForm(prev => ({
      ...prev,
      files: { ...prev.files, [key]: file || null },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.full_name.trim()) return toast.error('Vui lòng nhập họ và tên.');
    if (!form.phone.trim()) return toast.error('Vui lòng nhập số điện thoại.');
    if (!form.citizen_id.trim() || !/^[0-9]{12}$/.test(form.citizen_id.trim())) return toast.error('CCCD phải gồm đúng 12 chữ số.');
    if (!form.vehicle_type_id) return toast.error('Vui lòng chọn loại xe.');
    if (!form.vehicle_name.trim()) return toast.error('Vui lòng nhập tên xe.');
    if (!form.vehicle_color) return toast.error('Vui lòng chọn màu xe.');
    if (!form.vehicle_number.trim()) return toast.error('Vui lòng nhập biển số xe.');
    if (!form.services.length) return toast.error('Vui lòng chọn ít nhất một dịch vụ đăng ký.');

    for (const [key, label] of fileFields) {
      if (!form.files[key]) {
        return toast.error(`Vui lòng tải lên ${label}.`);
      }
    }

    const data = new FormData();
    data.append('full_name', form.full_name.trim());
    data.append('phone', form.phone.trim());
    data.append('citizen_id', form.citizen_id.trim());
    data.append('vehicle_type_id', form.vehicle_type_id);
    data.append('vehicle_name', form.vehicle_name.trim());
    data.append('vehicle_color', form.vehicle_color);
    data.append('vehicle_number', form.vehicle_number.trim());
    data.append('vehicle_year', String(form.vehicle_year));
    form.services.forEach((serviceId) => data.append('services[]', String(serviceId)));
    fileFields.forEach(([key]) => {
      data.append(key, form.files[key]);
    });

    setSubmitting(true);
    try {
      await onSubmit(data);
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
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, var(--secondary), rgba(247, 37, 133, 0.75))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Package size={22} />
              </div>
              Upload hồ sơ KYC cho tài xế
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Hoàn thiện hồ sơ vận hành cho {driver.full_name} để gửi xét duyệt KYC.
            </p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Thông tin hồ sơ</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Họ và tên</label>
                    <input value={form.full_name} onChange={(e) => handleChange('full_name', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Số điện thoại</label>
                    <input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>CCCD</label>
                    <input value={form.citizen_id} onChange={(e) => handleChange('citizen_id', e.target.value)} placeholder="001234567890" style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Loại xe</label>
                    <select value={form.vehicle_type_id} onChange={(e) => handleChange('vehicle_type_id', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}>
                      <option value="">Chọn loại xe</option>
                      {vehicleTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.name_vi}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tên xe</label>
                    <input value={form.vehicle_name} onChange={(e) => handleChange('vehicle_name', e.target.value)} placeholder="Honda Vision" style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Màu xe</label>
                    <select value={form.vehicle_color} onChange={(e) => handleChange('vehicle_color', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}>
                      <option value="">Chọn màu xe</option>
                      <option value="1">Trắng</option>
                      <option value="2">Đen</option>
                      <option value="3">Bạc</option>
                      <option value="4">Đỏ</option>
                      <option value="5">Xanh</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Biển số xe</label>
                    <input value={form.vehicle_number} onChange={(e) => handleChange('vehicle_number', e.target.value)} placeholder="59A1-12345" style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Năm sản xuất</label>
                    <input type="number" value={form.vehicle_year} onChange={(e) => handleChange('vehicle_year', e.target.value)} style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }} />
                  </div>
                </div>
              </div>

              <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Dịch vụ đăng ký</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  {serviceOptions.map((service) => (
                    <label key={service.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem 0.9rem', borderRadius: '12px', background: form.services.includes(service.id) ? 'rgba(0, 73, 172, 0.08)' : 'var(--bg-soft)', border: `1px solid ${form.services.includes(service.id) ? 'rgba(0, 73, 172, 0.25)' : 'var(--border)'}`, cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.services.includes(service.id)} onChange={() => handleToggleService(service.id)} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{service.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Tài liệu bắt buộc</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {fileFields.map(([key, label]) => (
                  <div key={key}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>{label}</label>
                    <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(e) => handleFileChange(key, e.target.files?.[0])} style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-soft)', border: '1px dashed var(--border)', borderRadius: '14px', color: 'var(--text)' }} />
                    <div style={{ marginTop: '0.45rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {form.files[key]?.name || 'Chưa chọn tệp'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1.25rem 1.5rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-glass" onClick={onClose} disabled={submitting}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: 180 }}>
              {submitting ? 'Đang tải lên...' : 'Gửi hồ sơ KYC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ImagePreviewModal = ({ url, title, onClose }) => {
  if (!url) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 1000, background: 'rgba(0,0,0,0.85)' }}>
      <div className="modal-content" style={{ background: 'transparent', boxShadow: 'none', maxWidth: '90vw', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
        <div style={{ position: 'absolute', top: '-40px', right: '0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'white', fontWeight: 600 }}>{title}</span>
          <button className="btn-icon" onClick={onClose} style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}><X size={20} /></button>
        </div>
        <img src={url} alt={title} style={{ width: '100%', height: 'auto', maxHeight: '80vh', borderRadius: '12px', objectFit: 'contain' }} />
      </div>
    </div>
  );
};

const DriverDetailModal = ({ userId, onClose, onRefresh, onEdit, onDelete, onUploadKyc }) => {

  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [userId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDriverDetail(userId);
      setDriver(response.data);
    } catch (error) {
      toast.error('Không thể tải chi tiết tài xế');
      onClose();
    } finally {
      setLoading(false);
    }
  };



  if (loading) return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem' }}></div>
          <div className="skeleton" style={{ width: '200px', height: '2rem', margin: '0 auto 1rem' }}></div>
          <div className="skeleton" style={{ width: '150px', height: '1.5rem', margin: '0 auto' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Info size={24} className="text-primary" /> Chi tiết hồ sơ tài xế
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {driver && (
              <>
                <button
                  className="btn-icon"
                  onClick={() => onEdit(driver)}
                  title="Chỉnh sửa tài xế"
                  style={{ background: 'rgba(0, 73, 172, 0.1)', color: 'var(--primary)' }}
                >
                  <CheckCircle size={18} />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => onDelete(driver)}
                  title="Xóa tài xế"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}
                >
                  <XCircle size={18} />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => onUploadKyc(driver)}
                  title="Upload hồ sơ KYC"
                  style={{ background: 'rgba(247, 37, 133, 0.1)', color: 'var(--secondary)' }}
                >
                  <Package size={18} />
                </button>
              </>
            )}
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>
        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            <div 
              onClick={() => driver?.avatar && setPreviewImage({ url: driver.avatar, title: 'Ảnh đại diện' })}
              style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '24px', 
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 10px 20px rgba(0, 73, 172, 0.3)',
              overflow: 'hidden',
              cursor: driver?.avatar ? 'pointer' : 'default'
            }}>
              {driver?.avatar ? (
                <img 
                  src={driver?.avatar} 
                  alt={driver?.full_name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>';
                  }}
                />
              ) : (
                <User size={56} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>{driver?.full_name}</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <span className={`badge ${
                  driver?.kyc_status === 2 ? 'badge-success' : 
                  driver?.kyc_status === 1 ? 'badge-warning' : 
                  driver?.kyc_status === 3 ? 'badge-error' : ''
                }`}>
                  {driver?.kyc_status_label || 'Chưa có hồ sơ'}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className={`badge ${driver?.is_active ? 'badge-success' : 'badge-error'}`}>
                    {driver?.is_active ? 'Đang hoạt động' : 'Đang bị khóa'}
                  </span>
                  {!driver?.is_active && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>
                      <div style={{ fontWeight: 600, color: 'var(--error)' }}>Lý do: {driver?.lock_reason || 'N/A'}</div>
                      <div>Hết hạn: {driver?.lock_expired_at ? new Date(driver?.lock_expired_at).toLocaleString('vi-VN') : 'Vĩnh viễn'}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>THÔNG TIN CƠ BẢN</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Smartphone size={18} className="text-primary" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Số điện thoại</div>
                    <div style={{ fontWeight: 600 }}>{driver?.phone}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Mail size={18} className="text-primary" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email</div>
                    <div style={{ fontWeight: 600 }}>{driver?.email || 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <User size={18} className="text-primary" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Giới tính</div>
                    <div style={{ fontWeight: 600 }}>{driver?.gender_label || 'Chưa cập nhật'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <MapPin size={18} className="text-primary" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Địa chỉ</div>
                    <div style={{ fontWeight: 600 }}>{driver?.address || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>HỆ THỐNG</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Calendar size={18} className="text-primary" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ngày gia nhập</div>
                    <div style={{ fontWeight: 600 }}>{new Date(driver?.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <ShieldCheck size={18} className="text-primary" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Vai trò</div>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>{driver.group_label || 'Chưa gán'}</span>
                        {driver.kyc_status !== 2 && (
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            (Duyệt hồ sơ để gán đội xe)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Calendar size={18} className="text-primary" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ngày sinh</div>
                    <div style={{ fontWeight: 600 }}>{driver?.birthday ? new Date(driver.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', marginTop: '1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>HỒ SƠ ĐĂNG KÝ (KYC)</p>
            {driver?.kyc_status ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  <div style={{ textAlign: 'center', padding: '1rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Trạng thái</div>
                    <div style={{ fontWeight: 600 }}>{driver.kyc_status_label}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>CCCD</div>
                    <div style={{ fontWeight: 600 }}>{driver.citizen_id || 'Chưa cập nhật'}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '1rem', border: '1px dashed var(--border)', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Ghi chú</div>
                    <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>{driver.kyc_cancel_reason || 'Không'}</div>
                  </div>
                </div>

                <div className="glass" style={{ padding: '1rem', borderRadius: '14px', background: 'var(--bg-soft)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>Thông tin hồ sơ đã nộp</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Loại xe</div>
                      <div style={{ fontWeight: 600 }}>{driver?.vehicle_info?.vehicle_type_label || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tên xe</div>
                      <div style={{ fontWeight: 600 }}>{driver?.vehicle_info?.vehicle_name || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Biển số xe</div>
                      <div style={{ fontWeight: 600 }}>{driver?.vehicle_info?.vehicle_number || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Màu xe</div>
                      <div style={{ fontWeight: 600 }}>{driver?.vehicle_info?.vehicle_color || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Năm sản xuất</div>
                      <div style={{ fontWeight: 600 }}>{driver?.vehicle_info?.vehicle_year || 'Chưa cập nhật'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dịch vụ đăng ký</div>
                      <div style={{ fontWeight: 600 }}>
                        {driver?.registered_services?.length
                          ? driver.registered_services.map((item) => item.label).join(', ')
                          : 'Chưa cập nhật'}
                      </div>
                    </div>
                  </div>
                </div>

                {driver.kyc_photos && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem' }}>Tài liệu đã tải lên</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                      {[
                        { key: 'portrait_url', label: 'Ảnh chân dung' },
                        { key: 'driver_license_url', label: 'Bằng lái xe' },
                        { key: 'cccd_front_url', label: 'CCCD Mặt trước' },
                        { key: 'cccd_back_url', label: 'CCCD Mặt sau' },
                        { key: 'vehicle_reg_url', label: 'Cà vẹt xe' },
                        { key: 'insurance_url', label: 'Bảo hiểm' },
                        { key: 'criminal_record_url', label: 'Lý lịch tư pháp' },
                        { key: 'health_cert_url', label: 'Giấy khám sức khỏe' },
                      ].map((item) => {
                        const url = driver.kyc_photos[item.key];
                        if (!url) return null;
                        return (
                          <div 
                            key={item.key}
                            onClick={() => setPreviewImage({ url, title: item.label })}
                            style={{ 
                              border: '1px solid var(--border)', 
                              borderRadius: '12px', 
                              overflow: 'hidden',
                              cursor: 'pointer',
                              transition: 'transform 0.2s',
                              background: 'var(--bg-soft)'
                            }}
                            className="hover-scale"
                          >
                             <div style={{ height: '120px', overflow: 'hidden' }}>
                               <img 
                                 src={url} 
                                 alt={item.label} 
                                 style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                 onError={(e) => {
                                   e.target.src = 'https://placehold.co/400x300?text=Lỗi+tải+ảnh';
                                 }}
                               />
                             </div>
                             <div style={{ textAlign: 'center', padding: '0.4rem', background: 'var(--bg)', fontSize: '0.7rem', fontWeight: 600, borderTop: '1px solid var(--border)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                               {item.label}
                             </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (

              <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>Chưa có hồ sơ đăng ký nào.</p>
            )}
          </div>
        </div>
      </div>
      {previewImage && (
        <ImagePreviewModal 
          url={previewImage.url} 
          title={previewImage.title} 
          onClose={() => setPreviewImage(null)} 
        />
      )}
    </div>
  );
};

const DriverList = () => {
  const location = useLocation();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(location.pathname === '/drivers/pending' ? 'pending' : 'all');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20
  });
  const [params, setParams] = useState({ 
    keyword: '', 
    kyc_status: location.pathname === '/drivers/pending' ? '1' : '', 
    driver_group_type: '',
    page: 1,
    per_page: 20
  });

  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [driverFormMode, setDriverFormMode] = useState('create');
  const [driverFormTarget, setDriverFormTarget] = useState(null);
  const [showKycUploadModal, setShowKycUploadModal] = useState(false);
  const [kycUploadTarget, setKycUploadTarget] = useState(null);

  useEffect(() => {
    fetchDrivers();
  }, [params]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDrivers(params);
      setDrivers(response.data.data || []);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page
      });
    } catch (error) {
      toast.error('Lỗi khi tải danh sách tài xế');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setParams(prev => ({ ...prev, page: newPage }));
  };

  const handleOpenCreateDriver = () => {
    setDriverFormMode('create');
    setDriverFormTarget(null);
    setShowDriverForm(true);
  };

  const handleEditDriver = (driver) => {
    setDriverFormMode('edit');
    setDriverFormTarget(driver);
    setShowDriverForm(true);
  };

  const handleDeleteDriver = async (driver) => {
    const result = await Swal.fire({
      title: 'Xóa tài xế?',
      html: `
        <div style="text-align:left;">
          <div>Bạn có chắc muốn xóa tài xế <b>${driver.full_name}</b> không?</div>
          <div style="margin-top:0.75rem; color:var(--text-muted); font-size:0.9rem;">Thao tác này sẽ xóa mềm tài khoản tài xế nếu họ không có chuyến hoặc đơn đang xử lý.</div>
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
      const loadingToast = toast.loading('Đang xóa tài xế...');
      await adminService.deleteDriver(driver.id);
      toast.dismiss(loadingToast);
      toast.success('Xóa tài xế thành công');
      setSelectedUserId(null);
      await fetchDrivers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa tài xế');
    }
  };

  const handleOpenKycUpload = (driver) => {
    setKycUploadTarget(driver);
    setShowKycUploadModal(true);
  };

  const handleApprove = async (driver) => {
    const result = await Swal.fire({
      title: 'Duyệt tài xế?',
      text: `Bạn có chắc chắn muốn duyệt hồ sơ cho tài xế: "${driver.full_name}" không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý duyệt',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#00906a'
    });

    if (result.isConfirmed) {
      try {
        await adminService.approveDriver(driver.id, 'Hồ sơ hợp lệ');
        toast.success('Đã duyệt hồ sơ tài xế');
        fetchDrivers();
      } catch (error) {
        toast.error('Lỗi khi duyệt hồ sơ');
      }
    }
  };

  const handleReject = async (driver) => {
    const { value: reason } = await Swal.fire({
      title: 'Từ chối hồ sơ',
      input: 'textarea',
      inputLabel: 'Lý do từ chối',
      inputPlaceholder: 'Nhập lý do tại đây...',
      inputAttributes: {
        'aria-label': 'Nhập lý do tại đây'
      },
      showCancelButton: true,
      confirmButtonText: 'Xác nhận từ chối',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#ef4444'
    });

    if (reason) {
      try {
        await adminService.rejectDriver(driver.id, reason);
        toast.success('Đã từ chối hồ sơ');
        fetchDrivers();
      } catch (error) {
        toast.error('Lỗi khi từ chối hồ sơ');
      }
    }
  };

  const handleToggleStatus = async (driver) => {
    const isLocking = driver.is_active; // Nếu đang active thì là thao tác Khóa

    if (isLocking) {
      // Flow Khóa tài xế (Form nhập lý do và số ngày)
      const { value: formValues } = await Swal.fire({
        title: 'Khóa tài khoản tài xế',
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
            lock_reason: reason,
            locked_days: days ? parseInt(days, 10) : 2
          };
        }
      });

      if (formValues) {
        try {
          const loadingToast = toast.loading('Đang xử lý...');
          await adminService.updateDriverStatus(driver.id, {
            is_active: false,
            ...formValues
          });
          toast.dismiss(loadingToast);
          toast.success('Khóa tài khoản tài xế thành công.');
          fetchDrivers();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái tài khoản. Vui lòng thử lại.');
        }
      }
    } else {
      // Flow Mở khóa (Confirm đơn giản)
      const result = await Swal.fire({
        title: 'Mở khóa tài xế?',
        text: `Bạn có chắc chắn muốn mở khóa quyền hoạt động cho tài xế: "${driver.full_name}" không?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý mở khóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: 'var(--success)'
      });

      if (result.isConfirmed) {
        try {
          const loadingToast = toast.loading('Đang xử lý...');
          await adminService.updateDriverStatus(driver.id, {
            is_active: true
          });
          toast.dismiss(loadingToast);
          toast.success('Mở khóa tài khoản tài xế thành công.');
          fetchDrivers();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Cập nhật thất bại');
        }
      }
    }
  };

  const handleAssignGroup = async (userId, groupType) => {
    const driver = drivers.find(d => d.id === userId);
    if (driver && driver.driver_group_type === groupType) {
       toast.error(groupType === 1 ? 'Tài xế này đã thuộc Đội xe nhà' : 'Tài xế này đã là Đối tác');
       return;
    }
    const label = groupType === 1 ? 'Đội xe nhà' : 'Tài xế đối tác';
    const result = await Swal.fire({
      title: `Gán vào ${label}?`,
      text: `Bạn có chắc muốn gán tài xế này vào ${label}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      confirmButtonColor: 'var(--primary)',
    });

    if (result.isConfirmed) {
      try {
        await adminService.assignDriverGroup(userId, groupType);
        toast.success('Gán đội xe thành công');
        fetchDrivers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi gán đội xe');
      }
    }
  };

  const handleBulkAssignGroup = async (groupType) => {
    if (selectedDrivers.length === 0) {
       toast.error('Chưa có tài xế nào được tích');
       return;
    }

    const validDriversToAssign = selectedDrivers.filter(id => {
       const driver = drivers.find(d => d.id === id);
       return driver && driver.driver_group_type !== groupType;
    });

    if (validDriversToAssign.length === 0) {
       toast.error(groupType === 1 ? 'Tất cả tài xế đã chọn đều đang thuộc Đội xe nhà' : 'Tất cả tài xế đã chọn đều đang là Đối tác');
       return;
    }

    const label = groupType === 1 ? 'Đội xe nhà' : 'Tài xế đối tác';
    const result = await Swal.fire({
      title: `Gán ${validDriversToAssign.length} tài xế vào ${label}?`,
      text: `Bạn có chắc muốn gán những tài xế hợp lệ đã chọn vào ${label}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      confirmButtonColor: 'var(--primary)',
    });

    if (result.isConfirmed) {
      try {
        const loadingToast = toast.loading('Đang xử lý...');
        for(let id of validDriversToAssign) {
            await adminService.assignDriverGroup(id, groupType);
        }
        toast.dismiss(loadingToast);
        toast.success(`Đã gán thành công ${validDriversToAssign.length} tài xế`);
        setSelectedDrivers([]);
        fetchDrivers();
      } catch (error) {
        toast.dismiss();
        toast.error('Có lỗi xảy ra khi gán đội xe');
      }
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const validDrivers = drivers.filter(d => d.kyc_status === 2).map(d => d.id);
      setSelectedDrivers(validDrivers);
    } else {
      setSelectedDrivers([]);
    }
  };

  const handleSelectDriver = (e, driverId) => {
    if (e.target.checked) {
      setSelectedDrivers([...selectedDrivers, driverId]);
    } else {
      setSelectedDrivers(selectedDrivers.filter(id => id !== driverId));
    }
  };

  const handleExport = async () => {
    try {
      toast.loading('Đang chuẩn bị file...');
      const response = await adminService.exportDrivers(params);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let filename = `danh_sach_tai_xe_${new Date().getTime()}.csv`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch.length > 1) {
          filename = fileNameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Tải file thành công');
    } catch (error) {
      toast.dismiss();
      toast.error('Lỗi khi tải file');
    }
  };

  return (
    <div className="drivers-page" style={{ padding: '2rem' }}>


      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Quản lý Tài xế</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Hệ thống quản lý thông tin và xét duyệt hồ sơ tài xế.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handleOpenCreateDriver}>
            <Car size={18} /> Tạo tài xế
          </button>
          <button className="btn btn-primary" onClick={() => handleBulkAssignGroup(1)}>
            <Car size={18} /> {selectedDrivers.length > 0 ? `Gán ${selectedDrivers.length} tài xế vào Xe nhà` : 'Gán vào Xe nhà'}
          </button>

          <button className="btn btn-success" onClick={handleExport}>
            <Package size={18} /> Xuất Excel
          </button>
        </div>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('all');
            setParams({ ...params, kyc_status: '', page: 1 });
          }}
        >
          Danh sách tài xế
        </button>
        <button 
          className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('pending');
            setParams({ ...params, kyc_status: '1', page: 1 });
          }}
        >
          Hồ sơ chờ duyệt
        </button>
      </div>

      <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', borderRadius: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, SĐT hoặc email..." 
            style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', transition: 'var(--transition)' }}
            className="input-focus"
            value={params.keyword || ''}
            onChange={(e) => setParams({ ...params, keyword: e.target.value, page: 1 })}
          />
        </div>
        <select 
          style={{ padding: '0.75rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', minWidth: '180px' }}
          value={params.kyc_status}
          onChange={(e) => setParams({ ...params, kyc_status: e.target.value, page: 1 })}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="1">Chờ duyệt</option>
          <option value="2">Đã duyệt</option>
          <option value="3">Từ chối</option>
          <option value="0">Chưa có hồ sơ</option>
        </select>
        
        <select 
          style={{ padding: '0.75rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', minWidth: '150px' }}
          value={params.driver_group_type}
          onChange={(e) => setParams({ ...params, driver_group_type: e.target.value, page: 1 })}
        >
          <option value="">Tất cả đội xe</option>
          <option value="1">Đội xe nhà</option>
          <option value="2">Đối tác</option>
        </select>
      </div>

      <div className="glass" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
        {loading ? (
          <div className="table-container" key="loading-state">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>
                    <input type="checkbox" disabled checked={false} readOnly />
                  </th>
                  <th>Họ và tên</th>
                  <th>Thông tin liên hệ</th>
                  <th>Trạng thái KYC</th>
                  <th>Trạng thái HĐ</th>
                  <th>Đội xe</th>
                  <th>Ngày gia nhập</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i}>
                    <td style={{ textAlign: 'center' }}><input type="checkbox" disabled checked={false} readOnly /></td>
                    <td><div className="skeleton" style={{ width: '150px', height: '1.5rem' }}></div></td>
                    <td><div className="skeleton" style={{ width: '120px', height: '1.5rem' }}></div></td>
                    <td><div className="skeleton" style={{ width: '80px', height: '1.5rem' }}></div></td>
                    <td><div className="skeleton" style={{ width: '80px', height: '1.5rem' }}></div></td>
                    <td><div className="skeleton" style={{ width: '80px', height: '1.5rem' }}></div></td>
                    <td><div className="skeleton" style={{ width: '100px', height: '1.5rem' }}></div></td>
                    <td><div className="skeleton" style={{ width: '200px', height: '2rem', marginLeft: 'auto' }}></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : drivers.length === 0 ? (
          <div className="empty-state" style={{ padding: '5rem 0' }}>
            <Car size={64} style={{ marginBottom: '1.5rem', opacity: 0.2, color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Không tìm thấy tài xế</h3>
            <p style={{ color: 'var(--text-muted)' }}>Hiện tại không có dữ liệu tài xế nào khớp với tìm kiếm của bạn.</p>
          </div>
        ) : (
          <>
            <div className="table-container" key="data-state">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '40px', textAlign: 'center' }}>
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={!!(drivers.length > 0 && selectedDrivers.length > 0 && selectedDrivers.length === drivers.filter(d => d.kyc_status === 2).length)}
                      />
                    </th>
                    <th>Họ và tên</th>
                    <th>Thông tin liên hệ</th>
                    <th>Trạng thái KYC</th>
                    <th>Trạng thái HĐ</th>
                    <th>Đội xe</th>
                    <th>Ngày gia nhập</th>
                    <th style={{ textAlign: 'right' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map(driver => (
                    <tr key={driver.id} className="glass-hover">
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          disabled={driver.kyc_status !== 2}
                          checked={!!selectedDrivers.includes(driver.id)}
                          onChange={(e) => handleSelectDriver(e, driver.id)}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '44px', 
                            height: '44px', 
                            borderRadius: '12px', 
                            background: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: '0 4px 10px rgba(0, 73, 172, 0.2)'
                          }}>
                            <User size={22} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{driver.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {driver.id.slice(-8)}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Smartphone size={14} className="text-primary" /> {driver.phone}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Mail size={14} /> {driver.email || 'N/A'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          driver.kyc_status === 2 ? 'badge-success' : 
                          driver.kyc_status === 1 ? 'badge-warning' : 
                          driver.kyc_status === 3 ? 'badge-error' : ''
                        }`}>
                          {driver.kyc_status_label || 'Chưa có hồ sơ'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${driver.is_active ? 'badge-success' : 'badge-error'}`} style={{ marginBottom: driver.is_active ? 0 : '4px' }}>
                          {driver.is_active ? 'Hoạt động' : 'Bị khóa'}
                        </span>
                        {!driver.is_active && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>
                            <div style={{ fontWeight: 600, color: 'var(--error)' }}>Lý do: {driver.lock_reason || 'N/A'}</div>
                            <div>Hết hạn: {driver.lock_expired_at ? new Date(driver.lock_expired_at).toLocaleString('vi-VN') : 'Vĩnh viễn'}</div>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${driver.driver_group_type === 1 ? 'badge-primary' : 'badge-secondary'}`}>
                          {driver.group_label}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
                        {new Date(driver.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                          {driver.kyc_status === 2 && driver.driver_group_type !== 1 && (
                            <button 
                              onClick={() => handleAssignGroup(driver.id, 1)} 
                              className="btn-action"
                              style={{ background: 'rgba(67, 97, 238, 0.1)', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                            >
                              <Car size={16} /> Gán Xe Nhà
                            </button>
                          )}
                          {driver.kyc_status === 2 && driver.driver_group_type !== 2 && (
                            <button 
                              onClick={() => handleAssignGroup(driver.id, 2)} 
                              className="btn-action"
                              style={{ background: 'rgba(247, 37, 133, 0.1)', color: 'var(--secondary)', borderColor: 'var(--secondary)' }}
                            >
                              <Car size={16} /> Gán Đối Tác
                            </button>
                          )}
                          <button 
                            onClick={() => setSelectedUserId(driver.id)} 
                            className="btn-action btn-action-view"
                          >
                            <Eye size={16} /> Hồ sơ
                          </button>

                          <button
                            onClick={() => handleEditDriver(driver)}
                            className="btn-action"
                            style={{ background: 'rgba(0, 73, 172, 0.08)', color: 'var(--primary)', borderColor: 'rgba(0, 73, 172, 0.2)' }}
                          >
                            <Info size={16} /> Sửa
                          </button>
                          
                          {driver.kyc_status === 1 && (
                            <>
                              <button onClick={() => handleApprove(driver)} className="btn-action btn-action-approve">
                                <Check size={16} /> Duyệt
                              </button>
                              <button onClick={() => handleReject(driver)} className="btn-action btn-action-reject">
                                <X size={16} /> Từ chối
                              </button>
                            </>
                          )}
                          
                          <button 
                            onClick={() => handleToggleStatus(driver)}
                            className={`btn-icon ${driver.is_active ? 'badge-error' : 'badge-success'}`}
                            style={{ background: 'transparent', border: '1px solid var(--border)' }}
                            title={driver.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {driver.is_active ? <Ban size={18} color="#ef4444" /> : <Unlock size={18} color="#00906a" />}
                          </button>

                          <button
                            onClick={() => handleDeleteDriver(driver)}
                            className="btn-icon"
                            style={{ background: 'transparent', border: '1px solid var(--border)' }}
                            title="Xóa tài xế"
                          >
                            <X size={18} color="#ef4444" />
                          </button>
                          <button
                            onClick={() => handleOpenKycUpload(driver)}
                            className="btn-action"
                            style={{ background: 'rgba(247, 37, 133, 0.08)', color: 'var(--secondary)', borderColor: 'rgba(247, 37, 133, 0.2)' }}
                          >
                            <Package size={16} /> Upload KYC
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination-wrapper">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Hiển thị <b>{(pagination.current_page - 1) * pagination.per_page + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)}</b> trên tổng số <b>{pagination.total}</b> tài xế
              </div>
              <div className="pagination-actions">
                <button 
                  className="btn-page" 
                  disabled={pagination.current_page === 1}
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                >
                  <ChevronLeft size={16} />
                </button>
                
                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                  let pageNum;
                  if (pagination.last_page <= 5) pageNum = i + 1;
                  else if (pagination.current_page <= 3) pageNum = i + 1;
                  else if (pagination.current_page >= pagination.last_page - 2) pageNum = pagination.last_page - 4 + i;
                  else pageNum = pagination.current_page - 2 + i;

                  return (
                    <button 
                      key={pageNum}
                      className={`btn-page ${pagination.current_page === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button 
                  className="btn-page"
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <DriverFormModal
        open={showDriverForm}
        mode={driverFormMode}
        driver={driverFormTarget}
        onClose={() => setShowDriverForm(false)}
        onSubmit={async (payload) => {
          const loadingToast = toast.loading(driverFormMode === 'create' ? 'Đang tạo tài xế...' : 'Đang cập nhật tài xế...');
          try {
            if (driverFormMode === 'create') {
              const response = await adminService.createDriver(payload);
              if (response?.data?.temporary_password) {
                await Swal.fire({
                  title: 'Tạo tài xế thành công',
                  html: `
                    <div style="text-align:left;">
                      <div style="margin-bottom:0.75rem;">Tài xế đã được tạo thành công.</div>
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
                toast.success('Tạo tài xế thành công');
              }
            } else if (driverFormTarget) {
              await adminService.updateDriver(driverFormTarget.id, payload);
              toast.success('Cập nhật tài xế thành công');
              setSelectedUserId(driverFormTarget.id);
            }
            await fetchDrivers();
          } catch (error) {
            toast.error(error.response?.data?.message || (driverFormMode === 'create' ? 'Không thể tạo tài xế' : 'Không thể cập nhật tài xế'));
          } finally {
            toast.dismiss(loadingToast);
          }
        }}
      />

      <DriverKycUploadModal
        open={showKycUploadModal}
        driver={kycUploadTarget}
        onClose={() => setShowKycUploadModal(false)}
        onSubmit={async (formData) => {
          if (!kycUploadTarget) return;

          const loadingToast = toast.loading('Đang tải hồ sơ KYC...');
          try {
            await adminService.uploadDriverKyc(kycUploadTarget.id, formData);
            toast.success('Upload hồ sơ KYC thành công');
            await fetchDrivers();
            setSelectedUserId(kycUploadTarget.id);
          } catch (error) {
            toast.error(error.response?.data?.message || 'Không thể upload hồ sơ KYC');
          } finally {
            toast.dismiss(loadingToast);
          }
        }}
      />

      {selectedUserId && (
        <DriverDetailModal 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
          onRefresh={fetchDrivers}
          onEdit={handleEditDriver}
          onDelete={handleDeleteDriver}
          onUploadKyc={handleOpenKycUpload}
        />
      )}
    </div>
  );
};

export default DriverList;
