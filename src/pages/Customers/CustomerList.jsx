import React, { useEffect, useState } from 'react';
import { Search, ShieldCheck, ShieldAlert, Ban, Unlock, User, Smartphone, MapPin, Calendar, Info, Mail, ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { X } from 'lucide-react';

const formatDateInputValue = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

const CustomerDetailModal = ({ userId, onClose, onEdit, onDelete }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [userId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCustomerDetail(userId);
      setCustomer(response.data);
    } catch (error) {
      toast.error('Không thể tải chi tiết khách hàng');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
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
      <div className="modal-content" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={24} className="text-primary" /> Hồ sơ khách hàng
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {customer && (
              <>
                <button
                  className="btn-icon"
                  onClick={() => onEdit(customer)}
                  title="Chỉnh sửa khách hàng"
                  style={{ background: 'rgba(0, 77, 160, 0.1)', color: 'var(--primary)' }}
                >
                  <Pencil size={18} />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => onDelete(customer)}
                  title="Xóa khách hàng"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            <button className="btn-icon" onClick={onClose}><X size={20} /></button>
          </div>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '24px', 
              background: customer?.avatar ? `url(${customer.avatar}) center/cover` : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 10px 20px rgba(0, 77, 160, 0.2)'
            }}>
              {customer?.avatar ? null : <User size={48} />}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>{customer?.full_name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>ID: {customer?.id}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className={`badge ${customer?.is_active ? 'badge-success' : 'badge-error'}`}>
                  {customer?.is_active ? 'Đang hoạt động' : 'Đang bị khóa'}
                </span>
                <span className="badge badge-primary">Khách hàng</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Thông tin liên hệ</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Smartphone size={16} className="text-primary" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Số điện thoại</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{customer?.phone}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={16} className="text-primary" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Email</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{customer?.email || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Thông tin khác</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={16} className="text-primary" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ngày tham gia</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{customer?.created_at ? new Date(customer.created_at).toLocaleDateString('vi-VN') : 'N/A'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={16} className="text-primary" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Giới tính</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{customer?.gender_label || 'Chưa cập nhật'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={16} className="text-primary" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Ngày sinh</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{customer?.birthday ? new Date(customer.birthday).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Địa chỉ</div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{customer?.address || 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!customer?.is_active && (
            <div className="glass" style={{ padding: '1.25rem', borderRadius: '16px', marginTop: '1.25rem', border: '1px solid var(--error-soft)', background: 'var(--error-soft)' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Ban size={20} className="text-error" />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--error)', fontSize: '0.9rem' }}>Tài khoản đang bị khóa</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>Lý do:</span> {customer?.lock_reason}
                  </div>
                  <div style={{ fontSize: '0.85rem', marginTop: '0.1rem' }}>
                    <span style={{ fontWeight: 600 }}>Hết hạn:</span> {customer?.lock_expired_at ? new Date(customer.lock_expired_at).toLocaleString('vi-VN') : 'Vĩnh viễn'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CustomerFormModal = ({ open, mode, customer, onClose, onSubmit, loading }) => {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: '',
    birthday: '',
    address: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm({
      full_name: customer?.full_name || '',
      phone: customer?.phone || '',
      email: customer?.email || '',
      gender: customer?.gender ? String(customer.gender) : '',
      birthday: formatDateInputValue(customer?.birthday),
      address: customer?.address || '',
      password: '',
    });
  }, [open, customer, mode]);

  if (!open) return null;

  const title = mode === 'create' ? 'Tạo khách hàng mới' : 'Chỉnh sửa khách hàng';
  const subtitle = mode === 'create'
    ? 'Nhập thông tin để tạo tài khoản khách hàng mới.'
    : 'Cập nhật lại thông tin hồ sơ khách hàng.';

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || loading) return;

    if (!form.full_name.trim()) return toast.error('Vui lòng nhập họ và tên.');
    if (!form.phone.trim()) return toast.error('Vui lòng nhập số điện thoại.');
    if (!/^0[3-9]\d{8}$/.test(form.phone.trim())) return toast.error('Số điện thoại không hợp lệ.');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error('Email không đúng định dạng.');
    if (mode === 'create' && form.password && form.password.length < 8) return toast.error('Mật khẩu tạm thời phải có ít nhất 8 ký tự.');

    setSubmitting(true);
    try {
      await onSubmit({
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        gender: form.gender ? Number(form.gender) : null,
        birthday: form.birthday || null,
        address: form.address.trim() || null,
        ...(mode === 'create' ? { password: form.password || null } : {}),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '760px', width: '92vw' }}>
        <div className="modal-header" style={{ paddingBottom: '1rem' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: 'linear-gradient(135deg, var(--primary), rgba(99, 102, 241, 0.75))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 20px rgba(0, 77, 160, 0.2)' }}>
                {mode === 'create' ? <Plus size={20} /> : <Pencil size={20} />}
              </div>
              {title}
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{subtitle}</p>
          </div>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '1rem' }}>
              <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Thông tin cơ bản</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Họ và tên <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input
                      className="input-focus"
                      value={form.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="Nguyễn Văn A"
                      style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Số điện thoại <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input
                      className="input-focus"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="0900000001"
                      style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email</label>
                    <input
                      className="input-focus"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="customer@example.com"
                      style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Giới tính</label>
                    <select
                      value={form.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}
                    >
                      <option value="">Chưa cập nhật</option>
                      <option value="1">Nam</option>
                      <option value="2">Nữ</option>
                      <option value="3">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ngày sinh</label>
                    <input
                      type="date"
                      value={form.birthday}
                      onChange={(e) => handleChange('birthday', e.target.value)}
                      style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}
                    />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Địa chỉ</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="123 Nguyễn Trãi, Quận 1, TP.HCM"
                      rows={4}
                      style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>

              <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Tài khoản</div>
                <div style={{ padding: '1rem', borderRadius: '16px', background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08), rgba(99, 102, 241, 0.02))', border: '1px solid rgba(99, 102, 241, 0.15)', marginBottom: '1rem' }}>
                  <div style={{ fontWeight: 800, marginBottom: '0.35rem' }}>Khách hàng</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Vai trò mặc định là khách hàng, trạng thái mặc định sẽ là đang hoạt động.
                  </div>
                </div>

                {mode === 'create' ? (
                  <>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Mật khẩu tạm thời</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Bỏ trống để hệ thống tự sinh"
                      style={{ width: '100%', padding: '0.9rem 1rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', marginBottom: '0.75rem' }}
                    />
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                      Nếu không nhập, hệ thống sẽ tự sinh mật khẩu tạm thời và trả lại sau khi tạo thành công.
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    Bạn có thể cập nhật thông tin hồ sơ, bao gồm cả trạng thái tài khoản nếu cần.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '1.25rem 1.5rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-glass" onClick={onClose} disabled={submitting}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: 160 }}>
              {submitting ? 'Đang lưu...' : (mode === 'create' ? 'Tạo khách hàng' : 'Lưu thay đổi')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 20
  });
  const [params, setParams] = useState({ 
    keyword: '', 
    page: 1,
    per_page: 20
  });

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerFormMode, setCustomerFormMode] = useState('create');
  const [customerFormTarget, setCustomerFormTarget] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, [params]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCustomers(params);
      setCustomers(response.data.data || []);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        total: response.data.total,
        per_page: response.data.per_page
      });
    } catch (error) {
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setParams(prev => ({ ...prev, page: newPage }));
  };

  const handleOpenCreateCustomer = () => {
    setCustomerFormMode('create');
    setCustomerFormTarget(null);
    setShowCustomerForm(true);
  };

  const handleEditCustomer = async (customer) => {
    setCustomerFormMode('edit');
    setCustomerFormTarget(customer);
    setShowCustomerForm(true);
  };

  const handleDeleteCustomer = async (customer) => {
    const result = await Swal.fire({
      title: 'Xóa khách hàng?',
      html: `
        <div style="text-align:left;">
          <div>Bạn có chắc muốn xóa khách hàng <b>${customer.full_name}</b> không?</div>
          <div style="margin-top:0.75rem; color:var(--text-muted); font-size:0.9rem;">Thao tác này sẽ xóa mềm tài khoản và không thể dùng được nếu chưa khôi phục từ hệ thống.</div>
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
      const loadingToast = toast.loading('Đang xóa khách hàng...');
      await adminService.deleteCustomer(customer.id);
      toast.dismiss(loadingToast);
      toast.success('Xóa khách hàng thành công');
      setSelectedCustomerId(null);
      await fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa khách hàng');
    }
  };

  const handleToggleStatus = async (customer) => {
    const isLocking = customer.is_active;

    if (isLocking) {
      const { value: formValues } = await Swal.fire({
        title: 'Khóa tài khoản khách hàng',
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
          await adminService.updateCustomerStatus(customer.id, {
            is_active: false,
            ...formValues
          });
          toast.dismiss(loadingToast);
          toast.success('Đã khóa khách hàng');
          await fetchCustomers();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Không thể khóa khách hàng');
        }
      }
    } else {
      const result = await Swal.fire({
        title: 'Mở khóa khách hàng?',
        text: `Bạn có chắc chắn muốn mở khóa cho khách hàng: "${customer.full_name}" không?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý mở khóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: 'var(--success)'
      });

      if (result.isConfirmed) {
        try {
          const loadingToast = toast.loading('Đang xử lý...');
          await adminService.updateCustomerStatus(customer.id, { is_active: true });
          toast.dismiss(loadingToast);
          toast.success('Đã mở khóa khách hàng');
          await fetchCustomers();
        } catch (error) {
          toast.error('Cập nhật trạng thái thất bại');
        }
      }
    }
  };

  return (
    <div className="customers-page" style={{ padding: '2rem' }}>


      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Quản lý Khách hàng</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Theo dõi hành vi và quản lý quyền truy cập của người dùng trên toàn hệ thống.</p>
      </div>

      <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', borderRadius: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên, số điện thoại..." 
            style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none', transition: 'var(--transition)' }}
            className="input-focus"
            onChange={(e) => setParams({ ...params, keyword: e.target.value, page: 1 })}
          />
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateCustomer} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} />
          Tạo khách hàng
        </button>
        <button className="btn btn-glass" onClick={fetchCustomers}>
           Tìm kiếm
        </button>
      </div>

      <div className="glass" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="skeleton" style={{ width: '50px', height: '50px', borderRadius: '50%', margin: '0 auto 1rem' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-soft)' }}>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Khách hàng</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Số điện thoại</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Số chuyến</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Trạng thái</th>
                    <th style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length > 0 ? customers.map(customer => (
                    <tr key={customer.id} className="glass-hover" style={{ borderBottom: '1px solid var(--border)', transition: 'all 0.2s' }}>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: '44px', 
                            height: '44px', 
                            borderRadius: '12px', 
                            background: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            boxShadow: '0 4px 10px rgba(0, 77, 160, 0.2)'
                          }}>
                            <User size={22} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text)' }}>{customer.full_name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {customer.id.toString().substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text)', fontWeight: 500 }}>{customer.phone}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ 
                          padding: '0.4rem 0.8rem', 
                          background: 'var(--bg-soft)', 
                          borderRadius: '8px', 
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--primary)'
                        }}>
                          {customer.total_rides || 0} chuyến
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div className={`badge ${customer.is_active ? 'badge-success' : 'badge-error'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: customer.is_active ? 0 : '4px' }}>
                          {customer.is_active ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                          {customer.is_active ? 'Đang hoạt động' : 'Đang bị khóa'}
                        </div>
                        {!customer.is_active && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>
                            <div style={{ fontWeight: 600, color: 'var(--error)' }}>Lý do: {customer.lock_reason || 'N/A'}</div>
                            <div>Hết hạn: {customer.lock_expired_at ? new Date(customer.lock_expired_at).toLocaleString('vi-VN') : 'Vĩnh viễn'}</div>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button 
                            onClick={() => setSelectedCustomerId(customer.id)}
                            className="btn-icon" 
                            title="Xem chi tiết" 
                            style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}
                          >
                            <Info size={18} />
                          </button>
                          <button
                            onClick={() => handleEditCustomer(customer)}
                            className="btn-icon"
                            title="Chỉnh sửa khách hàng"
                            style={{ background: 'rgba(0, 77, 160, 0.1)', color: 'var(--primary)' }}
                          >
                            <Pencil size={18} />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(customer)}
                            className={`btn-icon ${customer.is_active ? 'btn-action-reject' : 'btn-action-approve'}`}
                            title={customer.is_active ? 'Khóa khách hàng' : 'Mở khóa khách hàng'}
                            style={{ 
                              background: customer.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 144, 106, 0.1)',
                              color: customer.is_active ? 'var(--error)' : 'var(--success)'
                            }}
                          >
                            {customer.is_active ? <Ban size={18} /> : <Unlock size={18} />}
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer)}
                            className="btn-icon"
                            title="Xóa khách hàng"
                            style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" style={{ padding: '4rem', textAlign: 'center' }}>
                        <div style={{ marginBottom: '1rem', opacity: 0.3 }}>
                          <User size={48} style={{ margin: '0 auto' }} />
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Không tìm thấy khách hàng nào.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination-wrapper">
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Hiển thị <b>{(pagination.current_page - 1) * pagination.per_page + 1} - {Math.min(pagination.current_page * pagination.per_page, pagination.total)}</b> trên tổng số <b>{pagination.total}</b> khách hàng
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

      {/* lockTarget modal removed as it's replaced by Swal.fire form */}

      <CustomerFormModal
        open={showCustomerForm}
        mode={customerFormMode}
        customer={customerFormTarget}
        loading={false}
        onClose={() => setShowCustomerForm(false)}
        onSubmit={async (payload) => {
          const loadingToast = toast.loading(customerFormMode === 'create' ? 'Đang tạo khách hàng...' : 'Đang cập nhật khách hàng...');
          try {
            if (customerFormMode === 'create') {
              const response = await adminService.createCustomer(payload);
              if (response?.data?.temporary_password) {
                await Swal.fire({
                  title: 'Tạo khách hàng thành công',
                  html: `
                    <div style="text-align:left;">
                      <div style="margin-bottom:0.75rem;">Khách hàng đã được tạo thành công.</div>
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
                toast.success('Tạo khách hàng thành công');
              }
            } else if (customerFormTarget) {
              await adminService.updateCustomer(customerFormTarget.id, payload);
              toast.success('Cập nhật khách hàng thành công');
            }
            await fetchCustomers();
          } catch (error) {
            toast.error(error.response?.data?.message || (customerFormMode === 'create' ? 'Không thể tạo khách hàng' : 'Không thể cập nhật khách hàng'));
          } finally {
            toast.dismiss(loadingToast);
          }
        }}
      />

      {selectedCustomerId && (
        <CustomerDetailModal 
          userId={selectedCustomerId} 
          onClose={() => setSelectedCustomerId(null)}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
        />
      )}
    </div>
  );
};

export default CustomerList;
