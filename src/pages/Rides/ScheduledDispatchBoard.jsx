import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Car, 
  ArrowRight,
  Send,
  UserPlus,
  XCircle,
  MoreVertical,
  Loader2,
  Banknote
} from 'lucide-react';
import rideService from '../../services/rideService';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Users, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScheduledDispatchBoard = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'waiting', // waiting, assigned, completed, canceled
    search: ''
  });
  const [selectedRides, setSelectedRides] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [internalDrivers, setInternalDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [dispatchMode, setDispatchMode] = useState(1); // 1: Internal Priority, 2: Open Pool
  const [togglingDispatch, setTogglingDispatch] = useState(false);

  useEffect(() => {
    fetchRides();
    fetchDispatchSettings();
  }, [filter.status]);

  const fetchDispatchSettings = async () => {
    try {
      const res = await adminService.getScheduledPricing();
      setDispatchMode(res?.data?.dispatch_mode || 1);
    } catch (error) {
      console.error('Lỗi khi tải cấu hình phân phối:', error);
    }
  };

  const handleToggleDispatchMode = async () => {
    const newMode = dispatchMode === 1 ? 2 : 1;
    const modeName = newMode === 2 ? 'PHÁT SÓNG DIỆN RỘNG (Open Pool)' : 'ƯU TIÊN ĐỘI XE NHÀ (Manual)';
    
    const result = await Swal.fire({
      title: 'Thay đổi cơ chế phân phối?',
      html: `Bạn sắp chuyển sang chế độ <b>${modeName}</b>.<br/><br/>
             ${newMode === 2 
               ? "Đơn sẽ được tự động đẩy cho TẤT CẢ tài xế tranh nhận." 
               : "Đơn sẽ chỉ bắn cho tài xế ĐỘI XE NHÀ hoặc chờ Admin gán."}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newMode === 2 ? 'var(--primary)' : 'var(--primary-hover)',
      confirmButtonText: 'Xác nhận thay đổi',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        setTogglingDispatch(true);
        await adminService.toggleScheduledDispatchMode(newMode);
        setDispatchMode(newMode);
        toast.success(`Đã chuyển sang chế độ ${modeName}`);
        fetchRides();
      } catch (error) {
        toast.error('Lỗi khi cập nhật cơ chế phân phối');
      } finally {
        setTogglingDispatch(false);
      }
    }
  };

  const fetchRides = async () => {
    try {
      setLoading(true);
      // rideService already returns response.data (HTTP body)
      // API shape can be: [...] | { data: [...] } | { data: { data: [...] } }
      const res = await rideService.getScheduledRides({ status: filter.status });
      const list = Array.isArray(res)
        ? res
        : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []));
      setRides(list);
    } catch (error) {
      toast.error('Không thể tải danh sách chuyến xe');
    } finally {
      setLoading(false);
    }
  };

  const fetchInternalDrivers = async () => {
    try {
      setLoadingDrivers(true);
      // rideService already returns response.data (HTTP body)
      const res = await rideService.getInternalDrivers();
      const list = Array.isArray(res)
        ? res
        : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []));
      setInternalDrivers(list);
    } catch (error) {
      toast.error('Không thể tải danh sách tài xế');
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handlePushToPool = async (ids) => {
    const rideIds = Array.isArray(ids) ? ids : [ids];
    
    const result = await Swal.fire({
      title: 'Xác nhận đẩy đơn?',
      text: `Bạn có chắc muốn đẩy ${rideIds.length} chuyến xe này ra danh sách cho tất cả tài xế?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Đồng ý, đẩy ngay',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        await rideService.pushToPool(rideIds);
        toast.success('Đã đẩy đơn ra pool thành công');
        fetchRides();
        setSelectedRides([]);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi đẩy đơn');
      }
    }
  };

  const openAssignModal = (ride) => {
    setCurrentRide(ride);
    setShowAssignModal(true);
    fetchInternalDrivers();
  };

  const handleAssignDriver = async (driverId) => {
    try {
      await rideService.assignDriver(currentRide.id, driverId);
      toast.success('Đã gán tài xế thành công');
      setShowAssignModal(false);
      fetchRides();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi gán tài xế');
    }
  };

  const toggleSelectRide = (id) => {
    if (selectedRides.includes(id)) {
      setSelectedRides(selectedRides.filter(rideId => rideId !== id));
    } else {
      setSelectedRides([...selectedRides, id]);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'waiting': return <span className="badge badge-warning">Chờ tài xế</span>;
      case 'assigned': return <span className="badge badge-success" style={{ background: 'rgba(0, 77, 160, 0.1)', color: 'var(--primary)' }}>Đã gán</span>;
      case 'completed': return <span className="badge badge-success">Hoàn thành</span>;
      case 'canceled': return <span className="badge badge-error">Đã hủy</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="dispatch-page">
      <div className="dispatch-header">
        <div>
          <h1 className="page-title">Quản lý Chuyến xe</h1>
          <p className="page-subtitle">Quản lý và điều phối các chuyến xe đi tỉnh, sân bay, giao hàng</p>
        </div>
        
        <div className="header-actions">
          {/* UC-122: Dispatch Strategy Selector */}
          <div className="dispatch-strategy-selector">
            <button 
              className={`strategy-btn ${dispatchMode === 1 ? 'active' : ''}`}
              onClick={() => dispatchMode !== 1 && handleToggleDispatchMode()}
              disabled={togglingDispatch}
            >
              <div className="strategy-icon">
                {togglingDispatch && dispatchMode !== 1 ? <Loader2 size={18} className="animate-spin" /> : <Monitor size={18} />}
              </div>
              <div className="strategy-label">
                <strong>Đội xe nhà</strong>
                <span>Admin chủ động gán đơn</span>
              </div>
            </button>

            <button 
              className={`strategy-btn ${dispatchMode === 2 ? 'active pool' : ''}`}
              onClick={() => dispatchMode !== 2 && handleToggleDispatchMode()}
              disabled={togglingDispatch}
            >
              <div className="strategy-icon">
                {togglingDispatch && dispatchMode !== 2 ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />}
              </div>
              <div className="strategy-label">
                <strong>Công khai</strong>
                <span>Tất cả tài xế tự nhận</span>
              </div>
            </button>
          </div>

          {selectedRides.length > 0 && (
            <button 
              className="btn btn-primary"
              onClick={() => handlePushToPool(selectedRides)}
            >
              <Send size={18} />
              Đẩy {selectedRides.length} đơn ra Pool
            </button>
          )}
          
          <button className="btn btn-premium" onClick={() => navigate('/pricing')}>
            <Banknote size={18} />
            Cấu hình giá
          </button>
        </div>
      </div>

      {/* Filters Board */}
      <div className="glass filter-board">
        <div className="filter-wrapper">
          <div className="tabs-container" style={{ margin: 0 }}>
            <button 
              className={`tab-item ${filter.status === 'waiting' ? 'active' : ''}`}
              onClick={() => setFilter({...filter, status: 'waiting'})}
            >
              Đang chờ ({rides.filter(r => r.status === 'waiting').length})
            </button>
            <button 
              className={`tab-item ${filter.status === 'assigned' ? 'active' : ''}`}
              onClick={() => setFilter({...filter, status: 'assigned'})}
            >
              Đã gán
            </button>
            <button 
              className={`tab-item ${filter.status === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter({...filter, status: 'completed'})}
            >
              Lịch sử
            </button>
          </div>

          <div className="search-box">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Tìm theo mã chuyến, khách hàng, điểm đón..." 
              className="search-input"
              value={filter.search}
              onChange={(e) => setFilter({...filter, search: e.target.value})}
            />
          </div>
        </div>
      </div>

      {/* Rides Grid/Table */}
      <div className="table-container glass" style={{ border: 'none', boxShadow: 'var(--shadow)' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) setSelectedRides(rides.map(r => r.id));
                    else setSelectedRides([]);
                  }}
                  checked={selectedRides.length === rides.length && rides.length > 0}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
              </th>
              <th>Khách hàng & Chuyến</th>
              <th>Lịch trình</th>
              <th>Loại xe & Giá</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  <td colSpan="6"><div className="skeleton-row"></div></td>
                </tr>
              ))
            ) : rides.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <ClipboardCheck size={48} className="empty-icon" />
                    <p>Không tìm thấy chuyến xe nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              rides.map((ride) => (
                <tr key={ride.id} className="hover-row" onClick={() => toggleSelectRide(ride.id)}>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedRides.includes(ride.id)}
                      onChange={() => toggleSelectRide(ride.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                    />
                  </td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-avatar">
                        {ride.customer_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="info-title">#{ride.ride_code || ride.id.substring(0, 8)}</div>
                        <div className="info-subtitle">{ride.customer_name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="route-info">
                      <div className="route-item">
                        <MapPin size={14} style={{ color: 'var(--primary)' }} />
                        <span className="route-text">{ride.pickup_address}</span>
                      </div>
                      <div className="route-item">
                        <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                        <span className="route-text">{ride.destination_address}</span>
                      </div>
                      <div className="route-time">
                        <Calendar size={12} /> {ride.pickup_time_formatted} 
                        <Clock size={12} style={{ marginLeft: '0.5rem' }} /> {ride.pickup_hour}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="price-info">
                      <div className="vehicle-type">
                        <Car size={16} />
                        {ride.vehicle_type_name}
                      </div>
                      <div className="fare-amount">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(ride.final_fare)}</div>
                    </div>
                  </td>
                  <td>{getStatusBadge(ride.status)}</td>
                  <td>
                    <div className="action-buttons">
                      {ride.status === 'waiting' && (
                        <>
                          <button 
                            className="btn-action edit" 
                            title="Gán tài xế nhà"
                            onClick={(e) => { e.stopPropagation(); openAssignModal(ride); }}
                          >
                            <UserPlus size={16} />
                            <span style={{ fontSize: '0.8rem', marginLeft: '4px', fontWeight: 'bold' }}>Gán</span>
                          </button>
                          <button 
                            className="btn-action success-outline"
                            title="Đẩy ra pool"
                            onClick={(e) => { e.stopPropagation(); handlePushToPool(ride.id); }}
                          >
                            <Send size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Driver Modal */}
      {showAssignModal && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setShowAssignModal(false)}>
          <div className="modal-container">
            <div className="modal-header">
              <h2>Gán tài xế đội nhà</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="ride-summary-box">
                <div className="summary-label">Chuyến xe:</div>
                <div className="summary-title">#{currentRide?.ride_code}</div>
                <div className="summary-address">{currentRide?.pickup_address}</div>
              </div>

              <div className="driver-list-container">
                <div className="list-title">Chọn tài xế khả dụng:</div>
                {loadingDrivers ? (
                  <div className="loading-spinner"><Loader2 size={32} className="spinner-icon" /></div>
                ) : internalDrivers.length === 0 ? (
                  <p className="empty-drivers">Không có tài xế đội nhà khả dụng</p>
                ) : (
                  internalDrivers.map(driver => (
                    <div 
                      key={driver.id} 
                      className="driver-card"
                      onClick={() => handleAssignDriver(driver.id)}
                    >
                      <div className="driver-info">
                        <div className="driver-avatar">
                          {driver.avatar_url ? <img src={driver.avatar_url} alt="" /> : <User size={20} />}
                        </div>
                        <div>
                          <div className="driver-name">{driver.full_name}</div>
                          <div className="driver-phone">{driver.phone}</div>
                        </div>
                      </div>
                      <div className="driver-status">Online</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScheduledDispatchBoard;
