import React, { useEffect, useState } from 'react';
import { Search, MoreVertical, ShieldCheck, ShieldAlert, Ban, Unlock, User, Smartphone, MapPin, Calendar, Info } from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({ keyword: '', page: 1 });

  useEffect(() => {
    fetchCustomers();
  }, [params]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getCustomers(params);
      setCustomers(response.data.data || []);
    } catch (error) {
      toast.error('Không thể tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (customer) => {
    const newStatus = !customer.is_active;
    
    const result = await Swal.fire({
      title: newStatus ? 'Mở khóa người dùng?' : 'Khóa người dùng?',
      text: newStatus ? 'Người dùng sẽ có thể đăng nhập lại vào hệ thống.' : 'Người dùng sẽ bị chặn truy cập tạm thời.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus ? 'var(--success)' : 'var(--error)',
      cancelButtonColor: 'var(--border)',
      confirmButtonText: newStatus ? 'Mở khóa ngay' : 'Khóa tài khoản',
      cancelButtonText: 'Hủy bỏ',
      background: 'var(--bg)',
      color: 'var(--text)'
    });

    if (result.isConfirmed) {
      try {
        await adminService.updateCustomerStatus(customer.id, {
          is_active: newStatus,
          reason: newStatus ? '' : 'Vi phạm chính sách hệ thống',
          locked_days: 7
        });
        toast.success(newStatus ? 'Đã mở khóa khách hàng' : 'Đã khóa khách hàng');
        fetchCustomers();
      } catch (error) {
        toast.error('Cập nhật trạng thái thất bại');
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
            onChange={(e) => setParams({ ...params, keyword: e.target.value })}
          />
        </div>
        <button className="btn btn-glass">
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
                          background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)'
                        }}>{customer.full_name?.[0] || 'U'}</div>
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
                      <div className={`badge ${customer.is_active ? 'badge-success' : 'badge-error'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        {customer.is_active ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                        {customer.is_active ? 'Đang hoạt động' : 'Đang bị khóa'}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button className="btn-icon" title="Xem chi tiết" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
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
        )}
      </div>
    </div>
  );
};

export default CustomerList;

