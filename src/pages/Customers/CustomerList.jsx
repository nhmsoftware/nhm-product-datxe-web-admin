import React, { useEffect, useState } from 'react';
import { Search, MoreVertical, ShieldCheck, ShieldAlert, Ban, Unlock } from 'lucide-react';
import { adminService } from '../../services/adminService';

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
      // Backend returns { data: { data: [...] } } for paginated results
      setCustomers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (customer) => {
    const newStatus = !customer.is_active;
    const confirmMsg = newStatus ? 'Mở khóa người dùng này?' : 'Khóa người dùng này?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await adminService.updateCustomerStatus(customer.id, {
        is_active: newStatus,
        reason: newStatus ? '' : 'Khóa bởi Admin',
        locked_days: 7
      });
      fetchCustomers();
    } catch (error) {
      alert('Cập nhật trạng thái thất bại');
    }
  };

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1 className="page-title">Quản lý Khách hàng</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Theo dõi hành vi và quản lý quyền truy cập của người dùng.</p>
      </div>

      <div className="glass" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm khách hàng..." 
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', outline: 'none' }}
            onChange={(e) => setParams({ ...params, keyword: e.target.value })}
          />
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Số điện thoại</th>
                  <th>Số chuyến</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id} className="glass-hover">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '50%', 
                          background: 'rgba(99, 102, 241, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                          fontWeight: 700
                        }}>{customer.name?.[0] || 'U'}</div>
                        <span style={{ fontWeight: 600 }}>{customer.name}</span>
                      </div>
                    </td>
                    <td>{customer.phone}</td>
                    <td>{customer.total_rides || 0}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {customer.is_active ? (
                          <ShieldCheck size={16} className="badge-success" />
                        ) : (
                          <ShieldAlert size={16} className="badge-error" />
                        )}
                        <span className={customer.is_active ? 'badge-success' : 'badge-error'}>
                          {customer.is_active ? 'Hoạt động' : 'Đang khóa'}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleToggleStatus(customer)}
                        className={`icon-btn ${customer.is_active ? 'error' : 'success'}`}
                        title={customer.is_active ? 'Khóa' : 'Mở khóa'}
                      >
                        {customer.is_active ? <Ban size={18} /> : <Unlock size={18} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
