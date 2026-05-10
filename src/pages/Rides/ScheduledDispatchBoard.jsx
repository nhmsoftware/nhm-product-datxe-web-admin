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

const ScheduledDispatchBoard = () => {
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
      confirmButtonColor: newMode === 2 ? 'var(--success)' : 'var(--primary)',
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
          
          <button className="btn btn-premium" onClick={() => window.location.href = '/pricing'}>
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
                      <button className="btn-action default" onClick={(e) => e.stopPropagation()}>
                        <MoreVertical size={16} />
                      </button>
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

      <style dangerouslySetInnerHTML={{ __html: `
        .dispatch-page {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          padding-bottom: 2rem;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dispatch-page .dispatch-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .dispatch-page .page-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: var(--text);
          margin: 0 0 0.25rem 0;
        }
        .dispatch-page .page-subtitle {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin: 0;
        }
        .dispatch-page .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .dispatch-page .filter-board {
          padding: 1.5rem;
          border-radius: 24px;
          margin-bottom: 2rem;
        }
        .dispatch-page .filter-wrapper {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          align-items: center;
        }
        .dispatch-page .search-box {
          flex: 1;
          min-width: 300px;
          position: relative;
        }
        .dispatch-page .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .dispatch-page .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border-radius: 12px;
          background-color: var(--bg-soft);
          border: 1px solid transparent;
          outline: none;
          font-size: 0.95rem;
          color: var(--text);
          transition: 0.2s;
        }
        .dispatch-page .search-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(0,77,160,0.1);
        }

        .dispatch-page .custom-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .dispatch-page .custom-table th {
          text-align: left;
          padding: 1rem;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-muted);
          font-weight: 700;
          border-bottom: 1px solid var(--border);
        }
        .dispatch-page .custom-table td {
          padding: 1rem;
          background: var(--bg-soft);
          border-top: 1px solid transparent;
          border-bottom: 1px solid transparent;
          transition: var(--transition);
        }
        .dispatch-page .hover-row {
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .dispatch-page .hover-row:hover td {
          background-color: var(--bg);
          border-color: var(--primary);
        }
        
        .dispatch-page .customer-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .dispatch-page .customer-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .dispatch-page .info-title { font-weight: 700; font-size: 0.9rem; }
        .dispatch-page .info-subtitle { font-size: 0.85rem; opacity: 0.7; }

        .dispatch-page .route-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .dispatch-page .route-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; }
        .dispatch-page .route-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
        .dispatch-page .route-time { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; }

        .dispatch-page .price-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .dispatch-page .vehicle-type { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; font-size: 0.9rem; }
        .dispatch-page .fare-amount { font-weight: 800; color: var(--primary); }

        .dispatch-page .action-buttons { display: flex; justify-content: flex-end; gap: 0.5rem; }
        .dispatch-page .btn-action {
          display: flex; align-items: center; justify-content: center;
          height: 36px; padding: 0 0.5rem; min-width: 36px;
          border-radius: 8px; border: 1px solid var(--border);
          background: var(--card); color: var(--text-muted);
          transition: 0.2s; cursor: pointer;
        }
        .dispatch-page .btn-action.edit { color: var(--primary); border-color: var(--primary); background: rgba(0,77,160,0.05); }
        .dispatch-page .btn-action.edit:hover { background: var(--primary); color: white; }
        .dispatch-page .btn-action.success-outline { color: var(--success); border-color: var(--success); background: rgba(16,185,129,0.05); }
        .dispatch-page .btn-action.success-outline:hover { background: var(--success); color: white; }
        .dispatch-page .btn-action.default:hover { background: var(--bg-soft); color: var(--text); }

        .dispatch-page .skeleton-row { height: 64px; background: linear-gradient(90deg, var(--bg-soft) 25%, var(--border) 50%, var(--bg-soft) 75%); background-size: 200% 100%; animation: loading 1.5s infinite; border-radius: 12px; }
        @keyframes loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

        .dispatch-page .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 0; text-align: center; color: var(--text-muted); }
        .dispatch-page .empty-icon { opacity: 0.2; margin-bottom: 1rem; margin: 0 auto 1rem; }

        .dispatch-page .modal-backdrop {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; animation: fadeIn 0.2s ease;
        }
        .dispatch-page .modal-container {
          background: var(--card); width: 100%; max-width: 450px;
          border-radius: 24px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .dispatch-page .modal-header { padding: 1.5rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .dispatch-page .modal-header h2 { font-size: 1.25rem; font-weight: 800; margin: 0; color: var(--text); }
        .dispatch-page .close-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; border-radius: 50%; transition: 0.2s; }
        .dispatch-page .close-btn:hover { background: var(--bg-soft); color: var(--error); }
        
        .dispatch-page .modal-body { padding: 1.5rem; }
        .dispatch-page .ride-summary-box { background: var(--bg-soft); padding: 1rem; border-radius: 12px; margin-bottom: 1.5rem; }
        .dispatch-page .summary-label { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem; }
        .dispatch-page .summary-title { font-weight: 800; font-size: 1rem; color: var(--text); }
        .dispatch-page .summary-address { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; }

        .dispatch-page .driver-list-container { display: flex; flex-direction: column; gap: 0.75rem; }
        .dispatch-page .list-title { font-size: 0.9rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text); }
        .dispatch-page .loading-spinner { display: flex; justify-content: center; padding: 2rem 0; }
        .dispatch-page .spinner-icon { animation: spin 1s linear infinite; color: var(--primary); }
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        .dispatch-page .empty-drivers { text-align: center; padding: 1rem 0; color: var(--text-muted); font-size: 0.9rem; }
        
        .dispatch-page .driver-card {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid var(--border);
          cursor: pointer; transition: 0.2s; background: var(--card);
        }
        .dispatch-page .driver-card:hover { border-color: var(--primary); background: rgba(0,77,160,0.02); transform: translateY(-1px); }
        .dispatch-page .driver-info { display: flex; align-items: center; gap: 0.75rem; }
        .dispatch-page .driver-avatar {
          width: 36px; height: 36px; border-radius: 50%; background: var(--bg-soft);
          display: flex; align-items: center; justify-content: center; color: var(--text-muted); overflow: hidden;
        }
        .dispatch-page .driver-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .dispatch-page .driver-name { font-weight: 700; font-size: 0.9rem; color: var(--text); }
        .dispatch-page .driver-phone { font-size: 0.8rem; color: var(--text-muted); }
        .dispatch-page .driver-status { font-size: 0.75rem; font-weight: 700; background: rgba(16,185,129,0.1); color: var(--success); padding: 0.25rem 0.5rem; border-radius: 6px; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}} />
    </div>
  );
};

export default ScheduledDispatchBoard;
