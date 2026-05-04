import React, { useState } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle } from 'lucide-react';

const DriverList = () => {
  const [drivers] = useState([
    { id: '1', name: 'Nguyễn Văn A', phone: '0901234567', vehicle: 'Toyota Vios', status: 'Approved', joinedAt: '2024-05-01' },
    { id: '2', name: 'Trần Thị B', phone: '0908765432', vehicle: 'Honda City', status: 'Pending', joinedAt: '2024-05-03' },
    { id: '3', name: 'Lê Văn C', phone: '0912345678', vehicle: 'Yamaha Exciter', status: 'Rejected', joinedAt: '2024-04-28' },
  ]);

  return (
    <div className="drivers-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Quản lý Tài xế</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Quản lý và duyệt hồ sơ đăng ký tài xế trên toàn hệ thống.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn glass glass-hover" style={{ color: 'white' }}>
            <Filter size={18} /> Lọc
          </button>
          <button className="btn btn-primary">
            + Thêm tài xế
          </button>
        </div>
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Thông tin liên hệ</th>
                <th>Phương tiện</th>
                <th>Trạng thái</th>
                <th>Ngày gia nhập</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(driver => (
                <tr key={driver.id} className="glass-hover" style={{ transition: 'var(--transition)' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '10px', 
                        background: 'linear-gradient(45deg, var(--primary), #a855f7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                      }}>{driver.name[0]}</div>
                      <span style={{ fontWeight: 600 }}>{driver.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.875rem' }}>{driver.phone}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>driver@example.com</div>
                  </td>
                  <td>{driver.vehicle}</td>
                  <td>
                    <span className={`badge ${
                      driver.status === 'Approved' ? 'badge-success' : 
                      driver.status === 'Pending' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {driver.status === 'Approved' ? 'Đã duyệt' : 
                       driver.status === 'Pending' ? 'Chờ duyệt' : 'Từ chối'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{driver.joinedAt}</td>
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

export default DriverList;
