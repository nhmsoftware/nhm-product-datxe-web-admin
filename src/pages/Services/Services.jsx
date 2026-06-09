import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  User, 
  MapPin, 
  Car, 
  ArrowRight,
  Send,
  UserPlus,
  XCircle,
  Loader2,
  DollarSign,
  Coffee,
  Store,
  Monitor,
  Users,
  CheckCircle2,
  Filter,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { adminService } from '../../services/adminService';
import rideService from '../../services/rideService';

const getOrderAmount = (order) => {
  const value = order?.total_amount ?? order?.final_fare ?? order?.total_price ?? 0;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const Services = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'waiting',
    search: '',
    type: 'All'
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState(null);

  const [selectedOrders, setSelectedOrders] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [dispatchMode, setDispatchMode] = useState(1); // 1: Internal Priority, 2: Open Pool
  const [togglingDispatch, setTogglingDispatch] = useState(false);
  const [autoPushInternal, setAutoPushInternal] = useState(false);
  const [togglingAutoPush, setTogglingAutoPush] = useState(false);
  const [internalDrivers, setInternalDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [driverKeyword, setDriverKeyword] = useState('');

  const fetchOrders = async (currentPage = page, currentFilter = filter) => {
    try {
      setLoading(true);
      
      let rideType = null;
      if (currentFilter.type === 'Food') rideType = 6;
      else if (currentFilter.type === 'Delivery') rideType = 4;

      const params = {
        page: currentPage,
        per_page: perPage,
        status: currentFilter.status,
        keyword: currentFilter.search,
        ride_type: rideType
      };

      const res = await adminService.getServiceOrders(params);
      
      if (res.data && res.data.data) {
        setOrders(res.data.data);
        if (res.data.meta) {
          setMeta(res.data.meta);
        }
      } else {
        setOrders(res.data || []);
        setMeta(null);
      }
    } catch (err) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async (keyword = '') => {
    try {
      setLoadingDrivers(true);
      const res = await rideService.getInternalDrivers(keyword);
      const list = Array.isArray(res)
        ? res
        : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []));
      setInternalDrivers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await adminService.getScheduledPricing();
      if (res && res.data && res.data.dispatch_mode) {
        setDispatchMode(Number(res.data.dispatch_mode));
        setAutoPushInternal(res.data.auto_push_internal || false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDrivers();
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchOrders(page, filter);
  }, [page, filter.status, filter.type]);

  // Handle Search submit
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchOrders(1, filter);
    }
  };

  const filteredOrders = orders;

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
      confirmButtonColor: newMode === 2 ? '#3b82f6' : '#4361ee',
      confirmButtonText: 'Xác nhận thay đổi',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        setTogglingDispatch(true);
        await adminService.toggleScheduledDispatchMode(newMode);
        setDispatchMode(newMode);
        toast.success(`Đã chuyển sang chế độ ${modeName}`);
        fetchOrders();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi chuyển chế độ');
      } finally {
        setTogglingDispatch(false);
      }
    }
  };

  const handleToggleAutoPushInternal = async () => {
    const newAutoPush = !autoPushInternal;
    const modeName = newAutoPush ? 'Bật Tự động Đẩy' : 'Tắt Tự động Đẩy';

    const result = await Swal.fire({
      title: 'Xác nhận thay đổi',
      html: `Bạn có muốn <b>${modeName}</b> đơn cho đội xe nhà?<br/><br/>
             ${newAutoPush 
               ? "Khi bật, các chuyến xe mới sẽ tự động hiển thị cho đội xe nhà tranh nhau nhận thay vì chờ Admin gán tay." 
               : "Khi tắt, Admin sẽ phải chủ động gán tay từng chuyến xe cho đội xe nhà."}
             <br/><br/>
             <small style="color: #ef4444;"><i>(Nếu muốn ${newAutoPush ? 'bật' : 'tắt'} tự động đẩy, hãy bấm nút <b>${newAutoPush ? 'Bật tính năng' : 'Tắt tính năng'}</b> bên dưới)</i></small>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newAutoPush ? '#10b981' : '#ef4444',
      confirmButtonText: newAutoPush ? 'Bật tính năng' : 'Tắt tính năng',
      cancelButtonText: 'Đóng'
    });

    if (result.isConfirmed) {
      try {
        setTogglingAutoPush(true);
        const res = await adminService.toggleInternalAutoPush(newAutoPush);
        setAutoPushInternal(newAutoPush);
        toast.success(res?.message || `Đã ${modeName} đơn nội bộ thành công`);
        fetchOrders(page, filter);
      } catch (error) {
        toast.error('Lỗi khi cập nhật cấu hình tự động đẩy đơn');
      } finally {
        setTogglingAutoPush(false);
      }
    }
  };

  const handlePushToPool = async (ids) => {
    const orderIds = Array.isArray(ids) ? ids : [ids];
    const result = await Swal.fire({
      title: 'Kích hoạt tìm tài xế tự động?',
      text: `Đẩy ${orderIds.length} đơn hàng này vào hàng đợi tìm tài xế tự động?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận đẩy',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        await adminService.pushServiceToPool(orderIds);
        setSelectedOrders([]);
        toast.success('Đã kích hoạt tìm tài xế tự động');
        fetchOrders();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi đẩy vào pool');
      } finally {
        setLoading(false);
      }
    }
  };

  const openAssignModal = (order) => {
    setCurrentOrder(order);
    setDriverKeyword('');
    fetchDrivers('');
    setShowAssignModal(true);
  };

  const handleAssignDriver = async (driver) => {
    try {
      await adminService.assignServiceDriver(currentOrder.id, driver.id);
      setShowAssignModal(false);
      toast.success(`Đã gán đơn hàng cho ${driver.full_name}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi gán tài xế');
    }
  };

  const toggleSelectOrder = (id) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter(oId => oId !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'waiting': return <span className="badge badge-warning">Đang chờ</span>;
      case 'assigned': return <span className="badge badge-success" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Đã gán</span>;
      case 'completed': return <span className="badge badge-success">Hoàn thành</span>;
      case 'canceled': return <span className="badge badge-error">Đã hủy</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="dispatch-page">
      {/* CSS inherit from ScheduledDispatchBoard through index.css or common styles */}
      <div className="dispatch-header">
        <div>
          <h1 className="page-title">Quản lý Dịch vụ</h1>
          <p className="page-subtitle">Điều phối đơn Giao đồ ăn &amp; Giao hàng</p>
        </div>
        
        <div className="header-actions">
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
          
          {dispatchMode === 1 && (
            <div className="auto-push-toggle-container">
              <button 
                className={`btn ${autoPushInternal ? 'btn-success' : 'btn-outline'}`}
                onClick={handleToggleAutoPushInternal}
                disabled={togglingAutoPush}
                style={{ height: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', textAlign: 'left' }}
              >
                {togglingAutoPush ? <Loader2 size={18} className="animate-spin" /> : (autoPushInternal ? <Send size={18} /> : <Monitor size={18} />)}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <span style={{ fontWeight: '500', lineHeight: 1.2 }}>{autoPushInternal ? 'Đang tự động đẩy xe nhà' : 'Bật Tự động đẩy xe nhà'}</span>
                  {autoPushInternal && (
                    <span style={{ fontSize: '10px', opacity: 0.85, marginTop: '2px', lineHeight: 1 }}>
                      Bấm để tắt tự động đẩy
                    </span>
                  )}
                </div>
              </button>
            </div>
          )}

          {selectedOrders.length > 0 && dispatchMode === 1 && (
            <button className="btn btn-primary" onClick={() => handlePushToPool(selectedOrders)}>
              <Send size={18} />
              Đẩy {selectedOrders.length} đơn vào hàng đợi
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs for Service Types */}
      <div className="main-tabs-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button 
          className={`main-tab-item ${filter.type === 'All' ? 'active' : ''}`}
          onClick={() => { setPage(1); setFilter({...filter, type: 'All'}); }}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 600, color: filter.type === 'All' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: filter.type === 'All' ? '2px solid var(--primary)' : 'transparent', marginBottom: '-10px', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          Tất cả dịch vụ
        </button>
        <button 
          className={`main-tab-item ${filter.type === 'Delivery' ? 'active' : ''}`}
          onClick={() => { setPage(1); setFilter({...filter, type: 'Delivery'}); }}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 600, color: filter.type === 'Delivery' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: filter.type === 'Delivery' ? '2px solid var(--primary)' : 'transparent', marginBottom: '-10px', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          Giao hàng
        </button>
        <button 
          className={`main-tab-item ${filter.type === 'Food' ? 'active' : ''}`}
          onClick={() => { setPage(1); setFilter({...filter, type: 'Food'}); }}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 600, color: filter.type === 'Food' ? 'var(--primary)' : 'var(--text-muted)', borderBottom: filter.type === 'Food' ? '2px solid var(--primary)' : 'transparent', marginBottom: '-10px', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          Giao đồ ăn
        </button>
      </div>

      {/* Filters Board */}
      <div className="glass filter-board">
        <div className="filter-wrapper">
          <div className="tabs-container" style={{ margin: 0 }}>
            <button 
              className={`tab-item ${filter.status === 'waiting' ? 'active' : ''}`}
              onClick={() => { setPage(1); setFilter({...filter, status: 'waiting'}); }}
            >
              Chờ xử lý
            </button>
            <button 
              className={`tab-item ${filter.status === 'assigned' ? 'active' : ''}`}
              onClick={() => { setPage(1); setFilter({...filter, status: 'assigned'}); }}
            >
              Đã gán
            </button>
            <button 
              className={`tab-item ${filter.status === 'completed' ? 'active' : ''}`}
              onClick={() => { setPage(1); setFilter({...filter, status: 'completed'}); }}
            >
              Hoàn thành
            </button>
            <button 
              className={`tab-item ${filter.status === 'canceled' ? 'active' : ''}`}
              onClick={() => { setPage(1); setFilter({...filter, status: 'canceled'}); }}
            >
              Đã hủy
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="search-box">
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm (Enter)..." 
                  className="search-input"
                  value={filter.search}
                  onChange={(e) => setFilter({...filter, search: e.target.value})}
                  onKeyDown={handleSearch}
                />
              </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="table-container glass" style={{ border: 'none', boxShadow: 'var(--shadow)' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                {filter.status === 'waiting' && dispatchMode === 1 && (
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedOrders(filteredOrders.filter(o => o.status === 'waiting').map(o => o.id));
                      else setSelectedOrders([]);
                    }}
                    checked={selectedOrders.length > 0 && selectedOrders.length === filteredOrders.filter(o => o.status === 'waiting').length}
                    style={{ cursor: 'pointer' }}
                  />
                )}
              </th>
              <th>Khách hàng &amp; Đơn hàng</th>
              <th>Lộ trình (Lấy &rarr; Giao)</th>
              <th>Dịch vụ &amp; Giá</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan="6"><div className="skeleton-row"></div></td></tr>)
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <Package size={48} className="empty-icon" />
                    <p>Không tìm thấy đơn hàng nào</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr 
                  key={order.id} 
                  className={`hover-row ${order.status !== 'waiting' ? 'non-selectable' : ''}`} 
                  onClick={() => order.status === 'waiting' && toggleSelectOrder(order.id)}
                  style={order.status !== 'waiting' ? { cursor: 'default' } : {}}
                >
                  <td style={{ textAlign: 'center' }}>
                    {order.status === 'waiting' && dispatchMode === 1 ? (
                      <input 
                        type="checkbox" 
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ cursor: 'pointer' }}
                      />
                    ) : (dispatchMode === 1 && (
                      <input 
                        type="checkbox" 
                        disabled
                        style={{ opacity: 0.3, cursor: 'not-allowed' }}
                      />
                    ))}
                  </td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-avatar" style={{ background: order.type === 'Food' ? '#f59e0b' : '#3b82f6' }}>
                        {order.type === 'Food' ? <Coffee size={20} /> : <Package size={20} />}
                      </div>
                      <div>
                        <div className="info-title">#{order.order_code}</div>
                        <div className="info-subtitle">{order.customer_name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="route-info">
                      <div className="route-item">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginRight: '8px' }}></div>
                        <span className="route-text" title={order.pickup_address}>
                          {order.type === 'Food' ? <strong>{order.merchant_name}: </strong> : ''}
                          {order.pickup_address}
                        </span>
                      </div>
                      <div className="route-item" style={{ marginTop: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', marginRight: '8px' }}></div>
                        <span className="route-text" title={order.destination_address}>{order.destination_address}</span>
                      </div>
                      <div className="route-time">
                         <Clock size={12} /> Tạo lúc: {order.created_at}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="price-info">
                      <div className="vehicle-type">
                        {order.type === 'Food' ? 'Đồ ăn' : 'Giao hàng'}
                      </div>
                      <div className="fare-amount">{getOrderAmount(order).toLocaleString('vi-VN')}đ</div>
                    </div>
                  </td>
                  <td>
                    {getStatusBadge(order.status)}
                    {order.driver_name && (
                       <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#22c55e', fontWeight: 600 }}>
                          <Car size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {order.driver_name}
                       </div>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {order.status === 'waiting' && (
                        <>
                          <button 
                            className="btn-action edit" 
                            title="Gán tài xế"
                            onClick={(e) => { e.stopPropagation(); openAssignModal(order); }}
                          >
                            <UserPlus size={16} />
                            <span style={{ fontSize: '0.8rem', marginLeft: '4px', fontWeight: 'bold' }}>Gán</span>
                          </button>
                          {dispatchMode === 1 && (
                            <button 
                              className="btn-action success-outline"
                              title="Phát sóng tự động"
                              onClick={(e) => { e.stopPropagation(); handlePushToPool(order.id); }}
                            >
                              <Send size={16} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {meta && meta.total > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-sm text-gray-500" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Hiển thị {filteredOrders.length} / {meta.total} đơn
            </span>
            <div className="flex gap-2 items-center" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="btn"
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
              >
                Trước
              </button>
              <span className="text-sm font-medium px-2" style={{ fontSize: '0.875rem', fontWeight: 500, padding: '0 0.5rem', color: 'var(--text-muted)' }}>
                Trang {page} / {meta.last_page}
              </span>
              <button
                disabled={page === meta.last_page}
                onClick={() => setPage(page + 1)}
                className="btn"
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', cursor: page === meta.last_page ? 'not-allowed' : 'pointer', opacity: page === meta.last_page ? 0.5 : 1 }}
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal - same style as ScheduledDispatchBoard */}
      {showAssignModal && (
        <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && setShowAssignModal(false)}>
          <div className="modal-container">
            <div className="modal-header">
              <h2>Gán tài xế điều phối</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}><XCircle size={20} /></button>
            </div>
            <div className="modal-body">
               <div className="ride-summary-box">
                <div className="summary-label">Đơn hàng:</div>
                <div className="summary-title">#{currentOrder?.order_code} - {currentOrder?.customer_name}</div>
                <div className="summary-address">{currentOrder?.pickup_address}</div>
              </div>

              <div className="driver-list-container" style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '1rem' }}>
                <div className="list-title" style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>Tài xế khả dụng (Xe máy):</div>
                
                <div className="search-box" style={{ marginBottom: '1rem', width: '100%', position: 'relative' }}>
                  <Search className="search-icon" size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Tìm tài xế theo tên hoặc SĐT..." 
                    className="search-input"
                    value={driverKeyword}
                    onChange={(e) => {
                      setDriverKeyword(e.target.value);
                      fetchDrivers(e.target.value);
                    }}
                    style={{ width: '100%', paddingLeft: '2.5rem', height: '40px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
                  />
                </div>

                {loadingDrivers ? (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Đang tải danh sách tài xế...</span>
                  </div>
                ) : internalDrivers.filter(d => {
                  const hasCompleteProfile = !!(d.vehicle_type && d.vehicle_number && d.vehicle_name);
                  const isBike = Number(d.vehicle_type) === 1;
                  return hasCompleteProfile && isBike;
                }).length === 0 ? (
                  <p className="empty-drivers" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Không có tài xế xe máy phù hợp và khả dụng</p>
                ) : (
                  internalDrivers.filter(d => {
                    const hasCompleteProfile = !!(d.vehicle_type && d.vehicle_number && d.vehicle_name);
                    const isBike = Number(d.vehicle_type) === 1;
                    return hasCompleteProfile && isBike;
                  }).map(driver => (
                    <div 
                      key={driver.id} 
                      className="driver-card" 
                      onClick={() => handleAssignDriver(driver)}
                      style={{
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--card)',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        marginBottom: '0.75rem'
                      }}
                    >
                      <div className="driver-info" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <div className="driver-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={20} style={{ color: 'var(--text-muted)' }} />
                        </div>
                        <div>
                          <div className="driver-name" style={{ fontWeight: 600, color: 'var(--text)' }}>{driver.full_name}</div>
                          <div className="driver-phone" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {driver.phone} • ⭐{driver.average_rating || 5}
                          </div>
                        </div>
                      </div>
                      <div className="driver-status" style={{ flexShrink: 0 }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(74, 222, 128, 0.15)', color: '#16a34a' }}>
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
      )}

    </div>
  );
};

export default Services;


