import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, CheckCircle, XCircle, Check, X, Ban, Unlock, Car, Eye, MapPin, Calendar, Smartphone, ShieldCheck, Mail, Info, Package, ChevronLeft, ChevronRight } from 'lucide-react';

import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import { useLocation } from 'react-router-dom';

const ImagePreviewModal = ({ url, title, onClose }) => {
  if (!url) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 1000, background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
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

const DriverDetailModal = ({ userId, onClose, onRefresh }) => {

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

  const handleAssignGroup = async (groupType) => {
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
        fetchDetail();
        onRefresh();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi gán đội xe');
      }
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
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Info size={24} className="text-primary" /> Chi tiết hồ sơ tài xế
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
            <div 
              onClick={() => driver?.avatar && setPreviewImage({ url: driver.avatar, title: 'Ảnh đại diện' })}
              style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '24px', 
              background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3rem',
              fontWeight: 800,
              color: 'white',
              boxShadow: '0 10px 20px rgba(0, 77, 160, 0.3)',
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
                    e.target.parentElement.innerText = driver?.full_name?.[0] || 'D';
                  }}
                />
              ) : (
                driver?.full_name?.[0] || 'D'
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
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {driver.driver_group_type !== 1 && (
                          <button 
                            onClick={() => handleAssignGroup(1)}
                            disabled={driver.kyc_status !== 2}
                            style={{ 
                              padding: '2px 8px', 
                              fontSize: '0.65rem', 
                              borderRadius: '6px', 
                              background: driver.kyc_status === 2 ? 'rgba(67, 97, 238, 0.1)' : 'var(--bg-soft)', 
                              color: driver.kyc_status === 2 ? 'var(--primary)' : 'var(--text-muted)',
                              border: `1px solid ${driver.kyc_status === 2 ? 'var(--primary)' : 'var(--border)'}`,
                              cursor: driver.kyc_status === 2 ? 'pointer' : 'not-allowed',
                              opacity: driver.kyc_status === 2 ? 1 : 0.5
                            }}
                          >
                            Gán Xe Nhà
                          </button>
                        )}
                        {driver.driver_group_type !== 2 && (
                          <button 
                            onClick={() => handleAssignGroup(2)}
                            disabled={driver.kyc_status !== 2}
                            style={{ 
                              padding: '2px 8px', 
                              fontSize: '0.65rem', 
                              borderRadius: '6px', 
                              background: driver.kyc_status === 2 ? 'rgba(247, 37, 133, 0.1)' : 'var(--bg-soft)', 
                              color: driver.kyc_status === 2 ? 'var(--secondary)' : 'var(--text-muted)',
                              border: `1px solid ${driver.kyc_status === 2 ? 'var(--secondary)' : 'var(--border)'}`,
                              cursor: driver.kyc_status === 2 ? 'pointer' : 'not-allowed',
                              opacity: driver.kyc_status === 2 ? 1 : 0.5
                            }}
                          >
                            Gán Đối Tác
                          </button>
                        )}
                      </div>
                    </div>
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Ghi chú</div>
                    <div style={{ fontWeight: 600, fontSize: '0.75rem' }}>{driver.kyc_cancel_reason || 'Không'}</div>
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

  const handleApprove = async (driver) => {
    const result = await Swal.fire({
      title: 'Duyệt tài xế?',
      text: `Bạn có chắc chắn muốn duyệt hồ sơ cho tài xế: "${driver.full_name}" không?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý duyệt',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#10b981'
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
    const newStatus = !driver.is_active;
    const result = await Swal.fire({
      title: newStatus ? 'Mở khóa tài xế?' : 'Khóa tài xế?',
      text: newStatus ? `Mở khóa quyền hoạt động cho ${driver.name}` : `Tạm dừng quyền hoạt động của ${driver.name}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy',
      confirmButtonColor: newStatus ? '#10b981' : '#ef4444'
    });

    if (result.isConfirmed) {
      try {
        await adminService.updateDriverStatus(driver.id, {
          is_active: newStatus,
          lock_reason: newStatus ? '' : 'Vi phạm quy định',
          locked_days: 7
        });
        toast.success(newStatus ? 'Đã mở khóa tài xế' : 'Đã khóa tài xế');
        fetchDrivers();
      } catch (error) {
        toast.error('Cập nhật thất bại');
      }
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
          <button className="btn btn-glass" onClick={() => fetchDrivers()}>
            <Filter size={18} /> Làm mới
          </button>
          <button className="btn btn-primary" onClick={handleExport}>
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
          <div className="table-container">
            <table>
              <thead>
                <tr>
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
            <div className="table-container">
              <table>
                <thead>
                  <tr>
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
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ 
                            width: '44px', 
                            height: '44px', 
                            borderRadius: '12px', 
                            background: 'linear-gradient(45deg, var(--primary), var(--secondary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: 'white',
                            boxShadow: '0 4px 10px rgba(0, 77, 160, 0.2)'
                          }}>{driver.full_name?.[0] || 'D'}</div>
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
                          <button 
                            onClick={() => setSelectedUserId(driver.id)} 
                            className="btn-action btn-action-view"
                          >
                            <Eye size={16} /> Hồ sơ
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
                            {driver.is_active ? <Ban size={18} color="#ef4444" /> : <Unlock size={18} color="#10b981" />}
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

      {selectedUserId && (
        <DriverDetailModal 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
          onRefresh={fetchDrivers}
        />
      )}
    </div>
  );
};

export default DriverList;

