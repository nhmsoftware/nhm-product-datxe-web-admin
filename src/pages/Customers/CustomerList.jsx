import React, { useState } from 'react';
import { Search, MoreVertical, ShieldCheck, ShieldAlert } from 'lucide-react';

const CustomerList = () => {
  const [customers] = useState([
    { id: '1', name: 'Lê Văn Tám', phone: '0944123456', status: 'Active', trips: 42, rating: 4.8 },
    { id: '2', name: 'Hoàng Thị Hoa', phone: '0933777888', status: 'Locked', trips: 15, rating: 3.5 },
    { id: '3', name: 'Phạm Minh Quân', phone: '0922111000', status: 'Active', trips: 128, rating: 5.0 },
  ]);

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1 className="page-title">Quản lý Khách hàng</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Theo dõi hành vi và quản lý quyền truy cập của người dùng.</p>
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Số điện thoại</th>
                <th>Số chuyến</th>
                <th>Đánh giá</th>
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
                      }}>{customer.name[0]}</div>
                      <span style={{ fontWeight: 600 }}>{customer.name}</span>
                    </div>
                  </td>
                  <td>{customer.phone}</td>
                  <td>{customer.trips}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b' }}>
                      ★ {customer.rating}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {customer.status === 'Active' ? (
                        <ShieldCheck size={16} className="badge-success" />
                      ) : (
                        <ShieldAlert size={16} className="badge-error" />
                      )}
                      <span className={customer.status === 'Active' ? 'badge-success' : 'badge-error'}>
                        {customer.status === 'Active' ? 'Hoạt động' : 'Đang khóa'}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerList;
