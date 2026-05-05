import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Check, X, Ban, Unlock } from 'lucide-react';
import { adminService } from '../../services/adminService';

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({ keyword: '', kyc_status: '', page: 1 });

  useEffect(() => {
    fetchDrivers();
  }, [params]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDrivers(params);
      setDrivers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driver) => {
    if (!window.confirm(`Duyệt hồ sơ cho tài xế ${driver.name}?`)) return;
    try {
      await adminService.approveDriver(driver.id, 'Duyệt bởi Admin');
      fetchDrivers();
    } catch (error) {
      alert('Lỗi khi duyệt hồ sơ');
    }
  };

  const handleReject = async (driver) => {
    const reason = window.prompt(`Lý do từ chối tài xế ${driver.name}:`);
    if (reason === null) return;
    try {
      await adminService.rejectDriver(driver.id, reason || 'Hồ sơ chưa đạt yêu cầu');
      fetchDrivers();
    } catch (error) {
      alert('Lỗi khi từ chối hồ sơ');
    }
  };

  const handleToggleStatus = async (driver) => {
    const newStatus = !driver.is_active;
    if (!window.confirm(newStatus ? 'Mở khóa tài xế này?' : 'Khóa tài xế này?')) return;
    try {
      await adminService.updateDriverStatus(driver.id, {
        is_active: newStatus,
        lock_reason: newStatus ? '' : 'Khóa bởi Admin',
        locked_days: 7
      });
      fetchDrivers();
    } catch (error) {
      alert('Cập nhật trạng thái thất bại');
    }
  };

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

      <div className="glass" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm tài xế..." 
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', outline: 'none' }}
            onChange={(e) => setParams({ ...params, keyword: e.target.value })}
          />
        </div>
        <select 
          style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', outline: 'none' }}
          onChange={(e) => setParams({ ...params, kyc_status: e.target.value })}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="1">Chờ duyệt</option>
          <option value="2">Đã duyệt</option>
          <option value="3">Từ chối</option>
        </select>
      </div>

      <div className="glass" style={{ padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Họ và tên</th>
                  <th>Thông tin liên hệ</th>
                  <th>Trạng thái KYC</th>
                  <th>Trạng thái HĐ</th>
                  <th>Ngày gia nhập</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map(driver => (
                  <tr key={driver.id} className="glass-hover">
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
                        }}>{driver.name?.[0] || 'D'}</div>
                        <span style={{ fontWeight: 600 }}>{driver.name}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.875rem' }}>{driver.phone}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{driver.email}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        driver.kyc_status === 2 ? 'badge-success' : 
                        driver.kyc_status === 1 ? 'badge-warning' : 'badge-error'
                      }`}>
                        {driver.kyc_status === 2 ? 'Đã duyệt' : 
                         driver.kyc_status === 1 ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </td>
                    <td>
                      <span className={driver.is_active ? 'badge-success' : 'badge-error'}>
                        {driver.is_active ? 'Hoạt động' : 'Bị khóa'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                      {new Date(driver.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {driver.kyc_status === 1 && (
                          <>
                            <button onClick={() => handleApprove(driver)} className="icon-btn success" title="Duyệt"><Check size={18} /></button>
                            <button onClick={() => handleReject(driver)} className="icon-btn error" title="Từ chối"><X size={18} /></button>
                          </>
                        )}
                        <button 
                          onClick={() => handleToggleStatus(driver)}
                          className={`icon-btn ${driver.is_active ? 'error' : 'success'}`}
                          title={driver.is_active ? 'Khóa' : 'Mở khóa'}
                        >
                          {driver.is_active ? <Ban size={18} /> : <Unlock size={18} />}
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
    </div>
  );
};

export default DriverList;
