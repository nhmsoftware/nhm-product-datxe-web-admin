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
  Phone,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import rideService from '../../services/rideService';
import { adminService } from '../../services/adminService';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Users, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RideFormModal = ({ open, mode, ride, defaultRideType, internalDrivers, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    ride_type: defaultRideType || 1,
    customer_mode: 'existing',
    customer_id: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    pickup_address: '',
    pickup_lat: '',
    pickup_lng: '',
    destination_address: '',
    destination_lat: '',
    destination_lng: '',
    vehicle_type: '1',
    total_price: '',
    distance_km: '',
    duration_minutes: '',
    driver_id: '',
    travel_date: '',
    travel_time: '',
  });
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm({
      ride_type: ride?.ride_type || defaultRideType || 1,
      customer_mode: mode === 'create' ? 'existing' : 'existing',
      customer_id: ride?.customer_id || '',
      customer_name: ride?.customer_name || '',
      customer_phone: ride?.customer_phone || '',
      customer_email: ride?.customer_email || '',
      pickup_address: ride?.pickup_address || '',
      pickup_lat: ride?.pickup_lat ?? '',
      pickup_lng: ride?.pickup_lng ?? '',
      destination_address: ride?.destination_address || '',
      destination_lat: ride?.destination_lat ?? '',
      destination_lng: ride?.destination_lng ?? '',
      vehicle_type: String(ride?.vehicle_type || 1),
      total_price: ride?.final_fare ?? '',
      distance_km: ride?.distance_km ?? '',
      duration_minutes: ride?.duration_minutes ?? '',
      driver_id: ride?.driver_id || '',
      travel_date: ride?.travel_date || '',
      travel_time: ride?.travel_time || '',
    });
    setCustomerSearch('');
  }, [open, ride, defaultRideType, mode]);

  useEffect(() => {
    if (!open || mode !== 'create') return;

    const timer = setTimeout(() => {
      const loadCustomers = async () => {
        try {
          setLoadingCustomers(true);
          const res = await adminService.getCustomers({ keyword: customerSearch, per_page: 20, page: 1 });
          const list = Array.isArray(res?.data?.data)
            ? res.data.data
            : (Array.isArray(res?.data) ? res.data : []);
          setCustomers(list);
        } catch (error) {
          toast.error('Không thể tải danh sách khách hàng');
        } finally {
          setLoadingCustomers(false);
        }
      };

      loadCustomers();
    }, 250);

    return () => clearTimeout(timer);
  }, [open, mode, customerSearch]);

  if (!open) return null;

  const title = mode === 'create' ? 'Tạo chuyến xe mới' : 'Chỉnh sửa chuyến xe';
  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (mode === 'create') {
      if (!form.customer_mode) return toast.error('Vui lòng chọn loại khách hàng.');
      if (form.customer_mode === 'existing' && !form.customer_id) return toast.error('Vui lòng chọn khách hàng hiện có.');
      if (form.customer_mode === 'new') {
        if (!form.customer_name.trim()) return toast.error('Vui lòng nhập tên khách hàng.');
        if (!form.customer_phone.trim()) return toast.error('Vui lòng nhập số điện thoại khách hàng.');
        if (!/^0[3-9]\d{8}$/.test(form.customer_phone.trim())) return toast.error('Số điện thoại khách hàng không hợp lệ.');
      }
    }
    if (!form.pickup_address.trim()) return toast.error('Vui lòng nhập điểm đón.');
    if (!form.destination_address.trim()) return toast.error('Vui lòng nhập điểm đến.');
    if (!form.total_price || Number(form.total_price) < 0) return toast.error('Tổng thanh toán không hợp lệ.');

    setSubmitting(true);
    try {
      const payload = {
        ride_type: Number(form.ride_type),
        pickup_address: form.pickup_address.trim(),
        pickup_lat: form.pickup_lat === '' ? null : Number(form.pickup_lat),
        pickup_lng: form.pickup_lng === '' ? null : Number(form.pickup_lng),
        destination_address: form.destination_address.trim(),
        destination_lat: form.destination_lat === '' ? null : Number(form.destination_lat),
        destination_lng: form.destination_lng === '' ? null : Number(form.destination_lng),
        vehicle_type: Number(form.vehicle_type),
        total_price: Number(form.total_price),
        distance_km: form.distance_km === '' ? null : Number(form.distance_km),
        duration_minutes: form.duration_minutes === '' ? null : Number(form.duration_minutes),
        travel_date: form.travel_date || null,
        travel_time: form.travel_time || null,
      };

      if (mode === 'create') {
        payload.customer_mode = form.customer_mode;
        if (form.customer_mode === 'existing') {
          payload.customer_id = form.customer_id;
        } else {
          payload.customer_name = form.customer_name.trim();
          payload.customer_phone = form.customer_phone.trim();
          payload.customer_email = form.customer_email.trim() || null;
        }
      } else {
        payload.driver_id = form.driver_id || null;
      }

      await onSubmit(payload);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && onClose()}>
      <div className="modal-container" style={{ maxWidth: '980px', width: '95vw' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Car size={22} /> {title}
          </h2>
          <button className="close-btn" onClick={onClose}><XCircle size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Khách hàng</div>
                {mode === 'create' ? (
                  <>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <button type="button" className={`btn ${form.customer_mode === 'existing' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleChange('customer_mode', 'existing')}>Khách hàng hiện có</button>
                      <button type="button" className={`btn ${form.customer_mode === 'new' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleChange('customer_mode', 'new')}>Nhập khách hàng mới</button>
                    </div>

                    {form.customer_mode === 'existing' ? (
                      <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tìm khách hàng</label>
                          <input value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} placeholder="Nhập tên hoặc số điện thoại..." style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Chọn khách hàng</label>
                          <select value={form.customer_id} onChange={(e) => handleChange('customer_id', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                            <option value="">{loadingCustomers ? 'Đang tải...' : 'Chọn khách hàng hiện có'}</option>
                            {customers.map((customer) => (
                              <option key={customer.id} value={customer.id}>
                                {customer.full_name} - {customer.phone}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tên khách hàng</label>
                          <input value={form.customer_name} onChange={(e) => handleChange('customer_name', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Số điện thoại</label>
                          <input value={form.customer_phone} onChange={(e) => handleChange('customer_phone', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Email</label>
                          <input value={form.customer_email} onChange={(e) => handleChange('customer_email', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text)' }}>{form.customer_name || ride?.customer_name || 'Khách hàng'}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{form.customer_phone || ride?.customer_phone || 'Chưa cập nhật'}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Khách hàng được cố định theo chuyến xe.</div>
                  </div>
                )}
              </div>

              <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Dịch vụ & cước</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Loại dịch vụ</label>
                    <select value={form.ride_type} onChange={(e) => handleChange('ride_type', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                      <option value="1">Chuyến xe thường</option>
                      <option value="2">Xe đi tỉnh</option>
                      <option value="3">Xe sân bay</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Loại xe</label>
                    <select value={form.vehicle_type} onChange={(e) => handleChange('vehicle_type', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                      <option value="1">Xe máy</option>
                      <option value="2">Ô tô 4 chỗ</option>
                      <option value="3">Ô tô 7 chỗ</option>
                      <option value="4">Ô tô 9 chỗ</option>
                      <option value="5">Xe ghép</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tổng thanh toán</label>
                    <input type="number" value={form.total_price} onChange={(e) => handleChange('total_price', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  </div>
                  {mode === 'edit' && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Tài xế</label>
                      <select value={form.driver_id} onChange={(e) => handleChange('driver_id', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }}>
                        <option value="">Chưa gán tài xế</option>
                        {internalDrivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.full_name} - {driver.phone}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Khoảng cách (km)</label>
                    <input type="number" value={form.distance_km} onChange={(e) => handleChange('distance_km', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Thời gian (phút)</label>
                    <input type="number" value={form.duration_minutes} onChange={(e) => handleChange('duration_minutes', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px', marginTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Lộ trình</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Điểm đón</label>
                  <input value={form.pickup_address} onChange={(e) => handleChange('pickup_address', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Pickup lat</label>
                  <input type="number" value={form.pickup_lat} onChange={(e) => handleChange('pickup_lat', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Pickup lng</label>
                  <input type="number" value={form.pickup_lng} onChange={(e) => handleChange('pickup_lng', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Điểm đến</label>
                  <input value={form.destination_address} onChange={(e) => handleChange('destination_address', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Destination lat</label>
                  <input type="number" value={form.destination_lat} onChange={(e) => handleChange('destination_lat', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Destination lng</label>
                  <input type="number" value={form.destination_lng} onChange={(e) => handleChange('destination_lng', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Ngày đi (nếu có)</label>
                  <input type="date" value={form.travel_date} onChange={(e) => handleChange('travel_date', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Giờ đi (nếu có)</label>
                  <input type="time" value={form.travel_time} onChange={(e) => handleChange('travel_time', e.target.value)} style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem 1.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu...' : (mode === 'create' ? 'Tạo chuyến xe' : 'Lưu thay đổi')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ScheduledDispatchBoard = () => {
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'waiting', // waiting, assigned, completed, canceled
    ride_type: 1, // 1: City, 2: Intercity, 3: Airport
    search: '',
    page: 1,
    per_page: 15
  });
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    last_page: 1
  });
  const [selectedRides, setSelectedRides] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [internalDrivers, setInternalDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [dispatchMode, setDispatchMode] = useState(1); // 1: Internal Priority, 2: Open Pool
  const [togglingDispatch, setTogglingDispatch] = useState(false);
  const [autoPushInternal, setAutoPushInternal] = useState(false);
  const [togglingAutoPush, setTogglingAutoPush] = useState(false);
  const [waitingCount, setWaitingCount] = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [driverSearch, setDriverSearch] = useState('');
  const [showRideForm, setShowRideForm] = useState(false);
  const [rideFormMode, setRideFormMode] = useState('create');

  const openDetailModal = (ride) => {
    setCurrentRide(ride);
    setShowDetailModal(true);
  };

  const openCreateRideModal = () => {
    setRideFormMode('create');
    setCurrentRide(null);
    setShowRideForm(true);
    fetchInternalDrivers();
  };

  const openEditRideModal = (ride) => {
    setRideFormMode('edit');
    setCurrentRide(ride);
    setShowRideForm(true);
    fetchInternalDrivers();
  };

  const fetchCounts = async () => {
    try {
      const [waitingRes, assignedRes, completedRes] = await Promise.all([
        rideService.getScheduledRides({ status: 'waiting', ride_type: filter.ride_type, per_page: 1 }),
        rideService.getScheduledRides({ status: 'assigned', ride_type: filter.ride_type, per_page: 1 }),
        rideService.getScheduledRides({ status: 'completed', ride_type: filter.ride_type, per_page: 1 })
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
  }, [filter.status, filter.ride_type, filter.page]);

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
      setAutoPushInternal(res?.data?.auto_push_internal || false);
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
        fetchRides();
      } catch (error) {
        toast.error('Lỗi khi cập nhật cấu hình tự động đẩy đơn');
      } finally {
        setTogglingAutoPush(false);
      }
    }
  };

  const fetchRides = async () => {
    try {
      setLoading(true);
      const res = await rideService.getScheduledRides({ 
        status: filter.status, 
        ride_type: filter.ride_type,
        page: filter.page, 
        per_page: filter.per_page 
      });
      const list = Array.isArray(res)
        ? res
        : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []));
      setRides(list);

      const meta = res?.data?.meta || res?.meta;
      if (meta) {
        setPagination({
          total: meta.total || 0,
          current_page: meta.current_page || 1,
          last_page: meta.last_page || 1
        });
      } else {
        setPagination({ total: list.length, current_page: 1, last_page: 1 });
      }

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
          <p className="page-subtitle">Quản lý và điều phối các chuyến xe thường, đi tỉnh hoặc đi sân bay</p>
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

          {selectedRides.length > 0 && dispatchMode === 1 && (
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
          <button className="btn btn-primary" onClick={openCreateRideModal}>
            <Plus size={18} />
            Tạo chuyến xe
          </button>
        </div>
      </div>

      {/* Main Tabs for Ride Types */}
      <div className="main-tabs-container" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.5rem' }}>
        <button 
          className={`main-tab-item ${filter.ride_type === 1 ? 'active' : ''}`}
          onClick={() => setFilter({...filter, ride_type: 1, page: 1})}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 600, color: filter.ride_type === 1 ? 'var(--primary)' : 'var(--text-muted)', borderBottom: filter.ride_type === 1 ? '2px solid var(--primary)' : 'transparent', marginBottom: '-10px', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          Chuyến xe thường
        </button>
        <button 
          className={`main-tab-item ${filter.ride_type === 2 ? 'active' : ''}`}
          onClick={() => setFilter({...filter, ride_type: 2, page: 1})}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 600, color: filter.ride_type === 2 ? 'var(--primary)' : 'var(--text-muted)', borderBottom: filter.ride_type === 2 ? '2px solid var(--primary)' : 'transparent', marginBottom: '-10px', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          Quản lý xe đi tỉnh
        </button>
        <button 
          className={`main-tab-item ${filter.ride_type === 3 ? 'active' : ''}`}
          onClick={() => setFilter({...filter, ride_type: 3, page: 1})}
          style={{ padding: '0.5rem 1rem', fontSize: '1rem', fontWeight: 600, color: filter.ride_type === 3 ? 'var(--primary)' : 'var(--text-muted)', borderBottom: filter.ride_type === 3 ? '2px solid var(--primary)' : 'transparent', marginBottom: '-10px', background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
        >
          Quản lý xe đi sân bay
        </button>
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
                {filter.status === 'waiting' && dispatchMode === 1 && (
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedRides(rides.filter(r => r.status === 'waiting').map(r => r.id));
                      else setSelectedRides([]);
                    }}
                    checked={selectedRides.length > 0 && selectedRides.length === rides.filter(r => r.status === 'waiting').length}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                )}
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
                <tr 
                  key={ride.id} 
                  className={`hover-row ${ride.status !== 'waiting' ? 'non-selectable' : ''}`} 
                  onClick={() => ride.status === 'waiting' && toggleSelectRide(ride.id)}
                  style={ride.status !== 'waiting' ? { cursor: 'default' } : {}}
                >
                  <td style={{ textAlign: 'center' }}>
                    {ride.status === 'waiting' && dispatchMode === 1 ? (
                      <input 
                        type="checkbox" 
                        checked={selectedRides.includes(ride.id)}
                        onChange={() => toggleSelectRide(ride.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                      />
                    ) : (dispatchMode === 1 && (
                      <input 
                        type="checkbox" 
                        disabled
                        style={{ width: '16px', height: '16px', opacity: 0.3, cursor: 'not-allowed' }}
                      />
                    ))}
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
                            className="btn-action"
                            title="Chỉnh sửa chuyến"
                            onClick={(e) => { e.stopPropagation(); openEditRideModal(ride); }}
                            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            className="btn-action edit" 
                            title="Gán tài xế nhà"
                            onClick={(e) => { e.stopPropagation(); openAssignModal(ride); }}
                          >
                            <UserPlus size={16} />
                            <span style={{ fontSize: '0.8rem', marginLeft: '4px', fontWeight: 'bold' }}>Gán</span>
                          </button>
                          {dispatchMode === 1 && (
                            <button 
                              className="btn-action success-outline"
                              title="Đẩy ra pool"
                              onClick={(e) => { e.stopPropagation(); handlePushToPool(ride.id); }}
                            >
                              <Send size={16} />
                            </button>
                          )}
                          <button
                            className="btn-action reject"
                            title="Hủy chuyến"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const result = await Swal.fire({
                                title: 'Hủy chuyến xe?',
                                input: 'textarea',
                                inputLabel: 'Lý do hủy',
                                inputPlaceholder: 'Nhập lý do nếu có...',
                                showCancelButton: true,
                                confirmButtonText: 'Xác nhận hủy',
                                cancelButtonText: 'Đóng',
                                confirmButtonColor: '#ef4444'
                              });

                              if (result.isConfirmed) {
                                try {
                                  await rideService.cancelRideBooking(ride.id, result.value || null);
                                  toast.success('Hủy chuyến xe thành công');
                                  fetchRides();
                                } catch (error) {
                                  toast.error(error.response?.data?.message || 'Không thể hủy chuyến xe');
                                }
                              }
                            }}
                          >
                            <Trash2 size={16} />
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

        {/* Phân trang */}
        {pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="text-sm text-gray-500" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Hiển thị {rides.length} / {pagination.total} chuyến
            </span>
            <div className="flex gap-2 items-center" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                disabled={pagination.current_page === 1}
                onClick={() => setFilter({ ...filter, page: pagination.current_page - 1 })}
                className="btn"
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', cursor: pagination.current_page === 1 ? 'not-allowed' : 'pointer', opacity: pagination.current_page === 1 ? 0.5 : 1 }}
              >
                Trước
              </button>
              <span className="text-sm font-medium px-2" style={{ fontSize: '0.875rem', fontWeight: 500, padding: '0 0.5rem', color: 'var(--text-muted)' }}>
                Trang {pagination.current_page} / {pagination.last_page}
              </span>
              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setFilter({ ...filter, page: pagination.current_page + 1 })}
                className="btn"
                style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', cursor: pagination.current_page === pagination.last_page ? 'not-allowed' : 'pointer', opacity: pagination.current_page === pagination.last_page ? 0.5 : 1 }}
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>

      <RideFormModal
        open={showRideForm}
        mode={rideFormMode}
        ride={currentRide}
        defaultRideType={filter.ride_type}
        internalDrivers={internalDrivers}
        onClose={() => setShowRideForm(false)}
        onSubmit={async (payload) => {
          const loadingToast = toast.loading(rideFormMode === 'create' ? 'Đang tạo chuyến xe...' : 'Đang cập nhật chuyến xe...');
          try {
            if (rideFormMode === 'create') {
              await rideService.createRideBooking(payload);
              toast.success('Tạo chuyến xe thành công');
            } else if (currentRide) {
              await rideService.updateRideBooking(currentRide.id, payload);
              toast.success('Cập nhật chuyến xe thành công');
              setShowDetailModal(false);
            }
            fetchRides();
            fetchCounts();
          } catch (error) {
            toast.error(error.response?.data?.message || (rideFormMode === 'create' ? 'Không thể tạo chuyến xe' : 'Không thể cập nhật chuyến xe'));
          } finally {
            toast.dismiss(loadingToast);
          }
        }}
      />

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
                {currentRide.can_edit && (
                  <button 
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowDetailModal(false);
                      openEditRideModal(currentRide);
                    }}
                  >
                    Chỉnh sửa
                  </button>
                )}
                {currentRide.can_edit && (
                  <>
                    {dispatchMode === 1 && (
                      <button 
                        className="btn btn-primary-outline" 
                        onClick={() => { setShowDetailModal(false); handlePushToPool(currentRide.id); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <Send size={16} /> Đẩy ra pool
                      </button>
                    )}
                    <button 
                      className="btn btn-primary" 
                      onClick={() => { setShowDetailModal(false); openAssignModal(currentRide); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <UserPlus size={16} /> Gán tài xế
                    </button>
                  </>
                )}
                {currentRide.can_cancel && (
                  <button
                    className="btn btn-danger"
                    onClick={async () => {
                      const result = await Swal.fire({
                        title: 'Hủy chuyến xe?',
                        input: 'textarea',
                        inputLabel: 'Lý do hủy',
                        inputPlaceholder: 'Nhập lý do nếu có...',
                        showCancelButton: true,
                        confirmButtonText: 'Xác nhận hủy',
                        cancelButtonText: 'Đóng',
                        confirmButtonColor: '#ef4444'
                      });

                      if (result.isConfirmed) {
                        try {
                          await rideService.cancelRideBooking(currentRide.id, result.value || null);
                          toast.success('Hủy chuyến xe thành công');
                          setShowDetailModal(false);
                          fetchRides();
                          fetchCounts();
                        } catch (error) {
                          toast.error(error.response?.data?.message || 'Không thể hủy chuyến xe');
                        }
                      }
                    }}
                  >
                    <Trash2 size={16} /> Hủy chuyến
                  </button>
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
