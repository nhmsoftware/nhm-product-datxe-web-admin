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
  Banknote,
  Eye,
  Info,
  Map,
  Phone
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
  const [waitingCount, setWaitingCount] = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');

  const openDetailModal = (ride) => {
    setCurrentRide(ride);
    setShowDetailModal(true);
  };

  const fetchCounts = async () => {
    try {
      const [waitingRes, assignedRes, completedRes] = await Promise.all([
        rideService.getScheduledRides({ status: 'waiting', per_page: 1 }),
        rideService.getScheduledRides({ status: 'assigned', per_page: 1 }),
        rideService.getScheduledRides({ status: 'completed', per_page: 1 })
      ]);
      
      const wCount = waitingRes?.data?.meta?.total ?? (Array.isArray(waitingRes) ? waitingRes.length : (Array.isArray(waitingRes?.data) ? waitingRes.data.length : (Array.isArray(waitingRes?.data?.data) ? waitingRes.data.data.length : 0)));
      const aCount = assignedRes?.data?.meta?.total ?? (Array.isArray(assignedRes) ? assignedRes.length : (Array.isArray(assignedRes?.data) ? assignedRes.data.length : (Array.isArray(assignedRes?.data?.data) ? assignedRes.data.data.length : 0)));
      const cCount = completedRes?.data?.meta?.total ?? (Array.isArray(completedRes) ? completedRes.length : (Array.isArray(completedRes?.data) ? completedRes.data.length : (Array.isArray(completedRes?.data?.data) ? completedRes.data.data.length : 0)));
      
      setWaitingCount(wCount);
      setAssignedCount(aCount);
      setCompletedCount(cCount);
    } catch (error) {
      console.error('Lỗi khi tải số lượng chuyến xe:', error);
    }
  };

  useEffect(() => {
    fetchRides();
    fetchDispatchSettings();
  }, [filter.status]);

  useEffect(() => {
    if (showAssignModal) {
      const delayDebounceFn = setTimeout(() => {
        fetchInternalDrivers(driverSearch);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [driverSearch, showAssignModal]);

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
      fetchCounts();
    } catch (error) {
      toast.error('Không thể tải danh sách chuyến xe');
    } finally {
      setLoading(false);
    }
  };

  const fetchInternalDrivers = async (keyword = '') => {
    try {
      setLoadingDrivers(true);
      // rideService already returns response.data (HTTP body)
      const res = await rideService.getInternalDrivers(keyword);
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
        toast.success('Đã đẩy đơn ra cho tất cả tài xế thành công');
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
    setDriverSearch('');
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
              Đẩy {selectedRides.length} đơn ra cho tất cả tài xế
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
              Đang chờ ({waitingCount})
            </button>
            <button 
              className={`tab-item ${filter.status === 'assigned' ? 'active' : ''}`}
              onClick={() => setFilter({...filter, status: 'assigned'})}
            >
              Đã gán ({assignedCount})
            </button>
            <button 
              className={`tab-item ${filter.status === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter({...filter, status: 'completed'})}
            >
              Hoàn thành ({completedCount})
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
                      <button 
                        className="btn-action edit-outline" 
                        title="Xem chi tiết"
                        onClick={(e) => { e.stopPropagation(); openDetailModal(ride); }}
                        style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderColor: 'rgba(99, 102, 241, 0.2)' }}
                      >
                        <Eye size={16} />
                        <span style={{ fontSize: '0.8rem', marginLeft: '4px', fontWeight: 'bold' }}>Chi tiết</span>
                      </button>

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
          <div className="modal-container assign-driver-modal">
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
                <div className="list-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Chọn tài xế khả dụng:</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ({internalDrivers.filter(d => {
                      const hasCompleteProfile = !!(d.vehicle_type && d.vehicle_number && d.vehicle_name);
                      const isVehicleMatch = Number(d.vehicle_type) === Number(currentRide?.vehicle_type);
                      return hasCompleteProfile && isVehicleMatch;
                    }).length} tài xế)
                  </span>
                </div>

                {/* Driver Search Box */}
                <div className="search-box" style={{ marginBottom: '0.75rem', width: '100%', minWidth: 'auto', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Tìm theo tên hoặc SĐT..." 
                    className="search-input"
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '0.5rem 1rem 0.5rem 2.25rem', 
                      borderRadius: '10px', 
                      fontSize: '0.85rem',
                      height: '38px',
                      backgroundColor: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)'
                    }}
                  />
                </div>

                <div className="driver-scroll-list" style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.625rem', paddingRight: '4px' }}>
                  {loadingDrivers ? (
                    <div className="loading-spinner"><Loader2 size={32} className="spinner-icon" /></div>
                  ) : internalDrivers.filter(d => {
                    const hasCompleteProfile = !!(d.vehicle_type && d.vehicle_number && d.vehicle_name);
                    const isVehicleMatch = Number(d.vehicle_type) === Number(currentRide?.vehicle_type);
                    return hasCompleteProfile && isVehicleMatch;
                  }).length === 0 ? (
                    <p className="empty-drivers">Không có tài xế phù hợp và khả dụng</p>
                  ) : (
                    internalDrivers.filter(d => {
                      const hasCompleteProfile = !!(d.vehicle_type && d.vehicle_number && d.vehicle_name);
                      const isVehicleMatch = Number(d.vehicle_type) === Number(currentRide?.vehicle_type);
                      return hasCompleteProfile && isVehicleMatch;
                    }).map(driver => (
                      <div 
                        key={driver.id} 
                        className="driver-card eligible"
                        style={{
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--card)',
                          padding: '0.75rem',
                          borderRadius: '10px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleAssignDriver(driver.id)}
                      >
                        <div className="driver-info" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', minWidth: 0, flex: 1 }}>
                          <div className="driver-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                            {driver.avatar_url ? <img src={driver.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={20} style={{ color: 'var(--text-muted)' }} />}
                          </div>
                          <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                            <div className="driver-name" style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{driver.full_name}</div>
                            <div className="driver-phone" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{driver.phone}</div>
                            
                            <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                                🚗 {driver.vehicle_name} ({driver.vehicle_number})
                              </span>
                              <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(74, 222, 128, 0.1)', color: '#16a34a', whiteSpace: 'nowrap', display: 'inline-block' }}>
                                {driver.vehicle_type_label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="driver-status" style={{ flexShrink: 0, marginLeft: '0.75rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(74, 222, 128, 0.15)', color: '#16a34a', whiteSpace: 'nowrap' }}>
                            Sẵn sàng
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Ride Modal */}
      {showDetailModal && currentRide && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setShowDetailModal(false)}>
          <div className="modal-container ride-detail-modal">
            <div className="modal-header">
              <div>
                <h2>Chi tiết chuyến đi #{currentRide.ride_code}</h2>
                <div style={{ marginTop: '0.35rem' }}>{getStatusBadge(currentRide.status)}</div>
              </div>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}><XCircle size={20} /></button>
            </div>
            
            <div className="modal-body">
              <div className="ride-detail-grid">
                {/* Left Side: Route and Info */}
                <div className="ride-detail-col left">
                  <h3 className="detail-section-title">
                    <Map size={18} /> Lộ trình &amp; Dịch vụ
                  </h3>
                  
                  <div className="detail-route-container">
                    <div className="detail-route-item">
                      <div className="detail-route-icon">
                        <MapPin size={16} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div className="detail-route-content">
                        <div className="detail-route-label">Điểm đón</div>
                        <div className="detail-route-value">{currentRide.pickup_address}</div>
                      </div>
                    </div>
                    
                    <div className="detail-route-item">
                      <div className="detail-route-icon">
                        <MapPin size={16} style={{ color: 'var(--error)' }} />
                      </div>
                      <div className="detail-route-content">
                        <div className="detail-route-label">Điểm đến</div>
                        <div className="detail-route-value">{currentRide.destination_address}</div>
                      </div>
                    </div>
                  </div>

                  <div className="detail-info-card">
                    <div className="detail-info-block">
                      <div className="detail-info-label">Dịch vụ</div>
                      <div className="detail-info-value">{currentRide.ride_type_name}</div>
                    </div>
                    <div className="detail-info-block">
                      <div className="detail-info-label">Loại xe</div>
                      <div className="detail-info-value">{currentRide.vehicle_type_name}</div>
                    </div>
                    <div className="detail-info-block">
                      <div className="detail-info-label">Khoảng cách</div>
                      <div className="detail-info-value">{currentRide.distance_km} km</div>
                    </div>
                    <div className="detail-info-block">
                      <div className="detail-info-label">Thời gian</div>
                      <div className="detail-info-value">{currentRide.duration_minutes} phút</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>Ngày đặt: {new Date(currentRide.created_at).toLocaleString('vi-VN')}</div>
                    {currentRide.pickup_time_formatted && (
                      <div style={{ fontWeight: 700, color: 'var(--primary)', marginTop: '0.15rem' }}>
                        Lịch xuất phát: {currentRide.pickup_hour} - {currentRide.pickup_time_formatted}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Parties and Fare */}
                <div className="ride-detail-col">
                  <h3 className="detail-section-title">
                    <Users size={18} /> Thành viên &amp; Cước
                  </h3>
                  
                  <div className="detail-party-section">
                    {/* Customer Info */}
                    <div className="detail-party-item">
                      <div className="detail-party-avatar customer">
                        {currentRide.customer_name?.charAt(0) || 'U'}
                      </div>
                      <div className="detail-party-info">
                        <div className="detail-party-role">Khách hàng</div>
                        <div className="detail-party-name">{currentRide.customer_name}</div>
                        <a href={`tel:${currentRide.customer_phone}`} className="detail-party-phone">
                          <Phone size={12} /> {currentRide.customer_phone || 'N/A'}
                        </a>
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div className="detail-party-item" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                      {currentRide.driver_name ? (
                        <>
                          <div className="detail-party-avatar driver">
                            {currentRide.driver_name?.charAt(0) || 'D'}
                          </div>
                          <div className="detail-party-info">
                            <div className="detail-party-role">Tài xế</div>
                            <div className="detail-party-name">{currentRide.driver_name}</div>
                            <a href={`tel:${currentRide.driver_phone}`} className="detail-party-phone">
                              <Phone size={12} /> {currentRide.driver_phone || 'N/A'}
                            </a>
                          </div>
                        </>
                      ) : (
                        <div className="detail-party-info">
                          <div className="detail-party-role">Tài xế</div>
                          <div className="detail-party-empty">Chưa gán tài xế</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fare Breakdown */}
                  <div className="detail-fare-section">
                    <h3 className="detail-section-title" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Chi tiết cước phí
                    </h3>
                    <div className="detail-fare-breakdown">
                      <div className="detail-fare-row">
                        <span className="detail-fare-label">Giá mở cửa</span>
                        <span className="detail-fare-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentRide.base_price)}</span>
                      </div>
                      <div className="detail-fare-row">
                        <span className="detail-fare-label">Cước di chuyển</span>
                        <span className="detail-fare-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentRide.distance_price)}</span>
                      </div>
                      {currentRide.time_fare > 0 && (
                        <div className="detail-fare-row">
                          <span className="detail-fare-label">Cước thời gian</span>
                          <span className="detail-fare-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentRide.time_fare)}</span>
                        </div>
                      )}
                      {currentRide.discount_amount > 0 && (
                        <div className="detail-fare-row discount">
                          <span className="detail-fare-label">Khuyến mãi ({currentRide.voucher_code})</span>
                          <span className="detail-fare-value">-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentRide.discount_amount)}</span>
                        </div>
                      )}
                      
                      <div className="detail-fare-row total">
                        <span className="detail-fare-label">Tổng thanh toán</span>
                        <span className="detail-fare-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentRide.final_fare)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="detail-footer-actions">
                <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
                {currentRide.status === 'waiting' && (
                  <>
                    <button 
                      className="btn btn-primary-outline" 
                      onClick={() => { setShowDetailModal(false); handlePushToPool(currentRide.id); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Send size={16} /> Đẩy ra pool
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => { setShowDetailModal(false); openAssignModal(currentRide); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <UserPlus size={16} /> Gán tài xế
                    </button>
                  </>
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
