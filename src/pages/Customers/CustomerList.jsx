import React, { useEffect, useState } from 'react';
import { Search, MoreVertical, ShieldCheck, ShieldAlert, Ban, Unlock, User, Smartphone, MapPin, Calendar, Info, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { X } from 'lucide-react';

const LockCustomerModal = ({ customer, onClose, onConfirm }) => {
  const [reason, setReason] = useState('Vi phạm điều khoản sử dụng');
  const [duration, setDuration] = useState('7');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onConfirm({
      is_active: false,
      reason: reason,
      locked_days: duration === 'permanent' ? 3650 : parseInt(duration)
    });
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '450px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Ban size={22} className="text-error" /> Khóa khách hàng
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{customer.full_name}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{customer.phone}</div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Lý do khóa</label>
            <textarea 
              className="input-custom"
              style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do chi tiết..."
              required
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Thời hạn khóa</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[
                { label: '1 ngày', value: '1' },
                { label: '3 ngày', value: '3' },
                { label: '7 ngày', value: '7' },
                { label: '30 ngày', value: '30' },
                { label: '90 ngày', value: '90' },
                { label: 'Vĩnh viễn', value: 'permanent' },
              ].map((opt) => (
                <div 
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '10px', 
                    border: duration === opt.value ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: duration === opt.value ? 'var(--primary-soft)' : 'var(--bg-soft)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: duration === opt.value ? 'var(--primary)' : 'var(--text)',
                    transition: '0.2s'
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn btn-glass" style={{ flex: 1 }} onClick={onClose}>Hủy</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'var(--error)' }} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Xác nhận khóa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CustomerDetailModal = ({ userId, onClose }) => {
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
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '550px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <User size={24} className="text-primary" /> Hồ sơ khách hàng
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'center' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '24px', 
              background: customer?.avatar ? `url(${customer.avatar}) center/cover` : 'linear-gradient(45deg, var(--primary), #4cc9f0)',
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

  const [lockTarget, setLockTarget] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

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

  const handleToggleStatus = async (customer) => {
    if (customer.is_active) {
      setLockTarget(customer);
      return;
    }

    const result = await Swal.fire({
      title: 'Mở khóa người dùng?',
      text: 'Người dùng sẽ có thể đăng nhập lại vào hệ thống.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--success)',
      cancelButtonColor: 'var(--border)',
      confirmButtonText: 'Mở khóa ngay',
      cancelButtonText: 'Hủy bỏ',
    });

    if (result.isConfirmed) {
      try {
        await adminService.updateCustomerStatus(customer.id, { is_active: true });
        toast.success('Đã mở khóa khách hàng');
        fetchCustomers();
      } catch (error) {
        toast.error('Cập nhật trạng thái thất bại');
      }
    }
  };

  const confirmLock = async (data) => {
    try {
      await adminService.updateCustomerStatus(lockTarget.id, data);
      toast.success('Đã khóa khách hàng');
      setLockTarget(null);
      fetchCustomers();
    } catch (error) {
      toast.error('Không thể khóa khách hàng');
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
                            background: 'linear-gradient(45deg, var(--primary), #4cc9f0)',
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
                            onClick={() => handleToggleStatus(customer)}
                            className={`btn-icon ${customer.is_active ? 'btn-action-reject' : 'btn-action-approve'}`}
                            title={customer.is_active ? 'Khóa khách hàng' : 'Mở khóa khách hàng'}
                            style={{ 
                              background: customer.is_active ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: customer.is_active ? 'var(--error)' : 'var(--success)'
                            }}
                          >
                            {customer.is_active ? <Ban size={18} /> : <Unlock size={18} />}
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

      {lockTarget && (
        <LockCustomerModal 
          customer={lockTarget} 
          onClose={() => setLockTarget(null)} 
          onConfirm={confirmLock} 
        />
      )}

      {selectedCustomerId && (
        <CustomerDetailModal 
          userId={selectedCustomerId} 
          onClose={() => setSelectedCustomerId(null)} 
        />
      )}
    </div>
  );
};

export default CustomerList;

