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
import merchantService from '../../services/merchantService';

const getOrderAmount = (order) => {
  const value = order?.total_amount ?? order?.final_fare ?? order?.total_price ?? 0;
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const FoodOrderFormModal = ({ open, mode, order, merchants, merchantMenuMap, onMerchantSelect, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    merchant_id: '',
    delivery_address: '',
    delivery_lat: '',
    delivery_lng: '',
    notes: '',
    subtotal_price: '',
    delivery_fee: '',
    service_fee: '',
    total_price: '',
    items: [],
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setForm({
      customer_name: order?.customer_name || '',
      customer_phone: order?.customer_phone || '',
      merchant_id: order?.merchant_id || '',
      delivery_address: order?.destination_address || '',
      delivery_lat: order?.destination_lat ?? '',
      delivery_lng: order?.destination_lng ?? '',
      notes: order?.notes || '',
      subtotal_price: order?.subtotal_price ?? '',
      delivery_fee: order?.delivery_fee ?? '',
      service_fee: order?.service_fee ?? '',
      total_price: getOrderAmount(order) || '',
      items: order?.items || [],
    });
  }, [open, order]);

  if (!open) return null;

  const currentMenu = merchantMenuMap[form.merchant_id] || [];

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { menu_item_id: '', quantity: 1, notes: '', options: [] }],
    }));
  };

  const updateItem = (index, patch) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    }));
  };

  const removeItem = (index) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.customer_name.trim()) return toast.error('Vui lòng nhập khách hàng.');
    if (!/^0[3-9]\d{8}$/.test(form.customer_phone.trim())) return toast.error('Số điện thoại khách hàng không hợp lệ.');
    if (!form.merchant_id) return toast.error('Vui lòng chọn nhà hàng.');
    if (!form.delivery_address.trim()) return toast.error('Vui lòng nhập địa chỉ giao hàng.');
    if (!form.items.length) return toast.error('Vui lòng chọn ít nhất một món ăn.');
    if (!form.subtotal_price || Number(form.subtotal_price) < 0) return toast.error('Phí món ăn không hợp lệ.');
    if (!form.delivery_fee || Number(form.delivery_fee) < 0) return toast.error('Phí giao hàng không hợp lệ.');
    if (!form.service_fee || Number(form.service_fee) < 0) return toast.error('Phí dịch vụ không hợp lệ.');
    if (!form.total_price || Number(form.total_price) < 0) return toast.error('Tổng thanh toán không hợp lệ.');

    setSubmitting(true);
    try {
      await onSubmit({
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        merchant_id: form.merchant_id,
        delivery_address: form.delivery_address.trim(),
        delivery_lat: form.delivery_lat === '' ? null : Number(form.delivery_lat),
        delivery_lng: form.delivery_lng === '' ? null : Number(form.delivery_lng),
        notes: form.notes.trim() || null,
        subtotal_price: Number(form.subtotal_price),
        delivery_fee: Number(form.delivery_fee),
        service_fee: Number(form.service_fee),
        total_price: Number(form.total_price),
        items: form.items.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: Number(item.quantity),
          notes: item.notes || null,
          options: item.options || [],
        })),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && onClose()}>
      <div className="modal-container" style={{ maxWidth: '1080px', width: '95vw' }}>
        <div className="modal-header">
          <h2>{mode === 'create' ? 'Tạo đơn đồ ăn' : 'Chỉnh sửa đơn đồ ăn'}</h2>
          <button className="close-btn" onClick={onClose}><XCircle size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
            <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input value={form.customer_name} onChange={(e) => handleChange('customer_name', e.target.value)} placeholder="Khách hàng" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                <input value={form.customer_phone} onChange={(e) => handleChange('customer_phone', e.target.value)} placeholder="Số điện thoại khách hàng" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                <select
                  value={form.merchant_id}
                  onChange={async (e) => {
                    handleChange('merchant_id', e.target.value);
                    await onMerchantSelect(e.target.value);
                  }}
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <option value="">Chọn nhà hàng</option>
                  {merchants.map((merchant) => (
                    <option key={merchant.id} value={merchant.id}>
                      {merchant.store_name}
                    </option>
                  ))}
                </select>
                <input value={form.delivery_address} onChange={(e) => handleChange('delivery_address', e.target.value)} placeholder="Địa chỉ giao hàng" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
              <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)} placeholder="Ghi chú đơn hàng" rows={3} style={{ marginTop: '1rem', width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <strong>Danh sách món ăn</strong>
                <button type="button" className="btn btn-secondary" onClick={addItem}>Thêm món</button>
              </div>
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {form.items.map((item, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '0.75rem', alignItems: 'center' }}>
                    <select
                      value={item.menu_item_id}
                      onChange={(e) => updateItem(index, { menu_item_id: e.target.value })}
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                      <option value="">Chọn món ăn</option>
                      {currentMenu.map((menuItem) => (
                        <option key={menuItem.id} value={menuItem.id}>
                          {menuItem.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: e.target.value })}
                      placeholder="SL"
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                    <input
                      value={item.notes || ''}
                      onChange={(e) => updateItem(index, { notes: e.target.value })}
                      placeholder="Ghi chú món ăn"
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    />
                    <button type="button" className="btn btn-danger" onClick={() => removeItem(index)}>Xóa</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
                <input type="number" value={form.subtotal_price} onChange={(e) => handleChange('subtotal_price', e.target.value)} placeholder="Phí món ăn" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                <input type="number" value={form.delivery_fee} onChange={(e) => handleChange('delivery_fee', e.target.value)} placeholder="Phí giao hàng" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                <input type="number" value={form.service_fee} onChange={(e) => handleChange('service_fee', e.target.value)} placeholder="Phí dịch vụ" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                <input type="number" value={form.total_price} onChange={(e) => handleChange('total_price', e.target.value)} placeholder="Tổng thanh toán" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            </div>
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem 1.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu...' : (mode === 'create' ? 'Tạo đơn đồ ăn' : 'Lưu thay đổi')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeliveryOrderFormModal = ({ open, mode, order, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    sender_name: '',
    sender_phone: '',
    pickup_address: '',
    pickup_lat: '',
    pickup_lng: '',
    receiver_name: '',
    receiver_phone: '',
    destination_address: '',
    destination_lat: '',
    destination_lng: '',
    goods_type: '',
    goods_note: '',
    total_price: '',
    distance_km: '',
    duration_minutes: '',
    driver_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    const deliveryInfo = order?.delivery_info || {};

    setForm({
      sender_name: deliveryInfo.sender_name || '',
      sender_phone: deliveryInfo.sender_phone || order?.customer_phone || '',
      pickup_address: order?.pickup_address || '',
      pickup_lat: order?.pickup_lat ?? '',
      pickup_lng: order?.pickup_lng ?? '',
      receiver_name: deliveryInfo.receiver_name || '',
      receiver_phone: deliveryInfo.receiver_phone || '',
      destination_address: order?.destination_address || '',
      destination_lat: order?.destination_lat ?? '',
      destination_lng: order?.destination_lng ?? '',
      goods_type: deliveryInfo.goods_type || '',
      goods_note: deliveryInfo.goods_note || '',
      total_price: getOrderAmount(order) || '',
      distance_km: order?.distance_km ?? '',
      duration_minutes: order?.duration_minutes ?? '',
      driver_id: order?.driver_id || '',
    });
  }, [open, order]);

  if (!open) return null;

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!form.sender_name.trim()) return toast.error('Vui lòng nhập người gửi.');
    if (!/^0[3-9]\d{8}$/.test(form.sender_phone.trim())) return toast.error('Số điện thoại người gửi không hợp lệ.');
    if (!form.pickup_address.trim()) return toast.error('Vui lòng nhập điểm lấy hàng.');
    if (!form.receiver_name.trim()) return toast.error('Vui lòng nhập người nhận.');
    if (!/^0[3-9]\d{8}$/.test(form.receiver_phone.trim())) return toast.error('Số điện thoại người nhận không hợp lệ.');
    if (!form.destination_address.trim()) return toast.error('Vui lòng nhập điểm giao hàng.');
    if (!form.goods_type.trim()) return toast.error('Vui lòng nhập loại hàng hóa.');
    if (!form.total_price || Number(form.total_price) < 0) return toast.error('Tổng thanh toán không hợp lệ.');

    setSubmitting(true);
    try {
      await onSubmit({
        sender_name: form.sender_name.trim(),
        sender_phone: form.sender_phone.trim(),
        pickup_address: form.pickup_address.trim(),
        pickup_lat: form.pickup_lat === '' ? null : Number(form.pickup_lat),
        pickup_lng: form.pickup_lng === '' ? null : Number(form.pickup_lng),
        receiver_name: form.receiver_name.trim(),
        receiver_phone: form.receiver_phone.trim(),
        destination_address: form.destination_address.trim(),
        destination_lat: form.destination_lat === '' ? null : Number(form.destination_lat),
        destination_lng: form.destination_lng === '' ? null : Number(form.destination_lng),
        goods_type: form.goods_type.trim(),
        goods_note: form.goods_note.trim() || null,
        total_price: Number(form.total_price),
        distance_km: form.distance_km === '' ? null : Number(form.distance_km),
        duration_minutes: form.duration_minutes === '' ? null : Number(form.duration_minutes),
        driver_id: form.driver_id || null,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.className === 'modal-backdrop' && onClose()}>
      <div className="modal-container" style={{ maxWidth: '980px', width: '95vw' }}>
        <div className="modal-header">
          <h2>{mode === 'create' ? 'Tạo đơn giao hàng' : 'Chỉnh sửa đơn giao hàng'}</h2>
          <button className="close-btn" onClick={onClose}><XCircle size={20} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '76vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Người gửi</div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <input value={form.sender_name} onChange={(e) => handleChange('sender_name', e.target.value)} placeholder="Người gửi" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  <input value={form.sender_phone} onChange={(e) => handleChange('sender_phone', e.target.value)} placeholder="Số điện thoại người gửi" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  <input value={form.pickup_address} onChange={(e) => handleChange('pickup_address', e.target.value)} placeholder="Điểm lấy hàng" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>
              <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>Người nhận</div>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <input value={form.receiver_name} onChange={(e) => handleChange('receiver_name', e.target.value)} placeholder="Người nhận" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  <input value={form.receiver_phone} onChange={(e) => handleChange('receiver_phone', e.target.value)} placeholder="Số điện thoại người nhận" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                  <input value={form.destination_address} onChange={(e) => handleChange('destination_address', e.target.value)} placeholder="Điểm giao hàng" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                </div>
              </div>
            </div>
            <div className="glass" style={{ padding: '1.25rem', borderRadius: '18px', marginTop: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input value={form.goods_type} onChange={(e) => handleChange('goods_type', e.target.value)} placeholder="Loại hàng hóa" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                <input value={form.total_price} type="number" onChange={(e) => handleChange('total_price', e.target.value)} placeholder="Tổng thanh toán" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                <input value={form.distance_km} type="number" onChange={(e) => handleChange('distance_km', e.target.value)} placeholder="Khoảng cách (km)" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                <input value={form.duration_minutes} type="number" onChange={(e) => handleChange('duration_minutes', e.target.value)} placeholder="Thời gian (phút)" style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
                <textarea value={form.goods_note} onChange={(e) => handleChange('goods_note', e.target.value)} placeholder="Ghi chú hàng hóa" rows={3} style={{ gridColumn: '1 / -1', width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', background: 'var(--bg-soft)', border: '1px solid var(--border)', color: 'var(--text)' }} />
              </div>
            </div>
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', padding: '1.25rem 1.5rem 1.5rem', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Hủy</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Đang lưu...' : (mode === 'create' ? 'Tạo đơn giao hàng' : 'Lưu thay đổi')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryFormMode, setDeliveryFormMode] = useState('create');
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [foodFormMode, setFoodFormMode] = useState('create');
  const [merchants, setMerchants] = useState([]);
  const [merchantMenuMap, setMerchantMenuMap] = useState({});

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

  const fetchMerchants = async () => {
    try {
      const response = await merchantService.getMerchants({ per_page: 100 });
      const list = response?.data?.data || response?.data || [];
      setMerchants(list);
    } catch (err) {
      toast.error('Không thể tải danh sách nhà hàng');
    }
  };

  const fetchMerchantMenu = async (merchantId) => {
    if (!merchantId || merchantMenuMap[merchantId]) return;

    try {
      const response = await merchantService.getMerchantMenu(merchantId);
      const categories = response?.data || [];
      const items = categories.flatMap((category) => category.items || []);
      setMerchantMenuMap((prev) => ({ ...prev, [merchantId]: items }));
    } catch (err) {
      toast.error('Không thể tải thực đơn nhà hàng');
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
    fetchMerchants();
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

  const openCreateDeliveryModal = () => {
    setDeliveryFormMode('create');
    setCurrentOrder(null);
    setShowDeliveryForm(true);
  };

  const openEditDeliveryModal = (order) => {
    setDeliveryFormMode('edit');
    setCurrentOrder(order);
    setShowDeliveryForm(true);
  };

  const openCreateFoodModal = () => {
    setFoodFormMode('create');
    setCurrentOrder(null);
    setShowFoodForm(true);
  };

  const openEditFoodModal = async (order) => {
    setFoodFormMode('edit');
    setCurrentOrder(order);
    if (order?.merchant_id) {
      await fetchMerchantMenu(order.merchant_id);
    }
    setShowFoodForm(true);
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

          {filter.type === 'Delivery' && (
            <button className="btn btn-primary" onClick={openCreateDeliveryModal}>
              <Package size={18} />
              Tạo đơn giao hàng
            </button>
          )}
          {filter.type === 'Food' && (
            <button className="btn btn-primary" onClick={openCreateFoodModal}>
              <Coffee size={18} />
              Tạo đơn đồ ăn
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
                      {order.type === 'Delivery' && order.can_edit && (
                        <button 
                          className="btn-action"
                          title="Chỉnh sửa đơn"
                          onClick={(e) => { e.stopPropagation(); openEditDeliveryModal(order); }}
                        >
                          <Filter size={16} />
                        </button>
                      )}
                      {order.type === 'Food' && order.can_edit && (
                        <button 
                          className="btn-action"
                          title="Chỉnh sửa đơn đồ ăn"
                          onClick={(e) => { e.stopPropagation(); openEditFoodModal(order); }}
                        >
                          <Filter size={16} />
                        </button>
                      )}
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
                      {order.type === 'Delivery' && order.can_cancel && (
                        <button
                          className="btn-action reject"
                          title="Hủy đơn"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const result = await Swal.fire({
                              title: 'Hủy đơn giao hàng?',
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
                                await adminService.cancelDeliveryOrder(order.id, result.value || null);
                                toast.success('Hủy đơn giao hàng thành công');
                                fetchOrders();
                              } catch (error) {
                                toast.error(error.response?.data?.message || 'Không thể hủy đơn giao hàng');
                              }
                            }
                          }}
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                      {order.type === 'Food' && order.can_cancel && (
                        <button
                          className="btn-action reject"
                          title="Hủy đơn đồ ăn"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const result = await Swal.fire({
                              title: 'Hủy đơn đồ ăn?',
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
                                await adminService.cancelFoodOrder(order.id, result.value || null);
                                toast.success('Hủy đơn đồ ăn thành công');
                                fetchOrders();
                              } catch (error) {
                                toast.error(error.response?.data?.message || 'Không thể hủy đơn đồ ăn');
                              }
                            }
                          }}
                        >
                          <XCircle size={16} />
                        </button>
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

      <DeliveryOrderFormModal
        open={showDeliveryForm}
        mode={deliveryFormMode}
        order={currentOrder}
        onClose={() => setShowDeliveryForm(false)}
        onSubmit={async (payload) => {
          const loadingToast = toast.loading(deliveryFormMode === 'create' ? 'Đang tạo đơn giao hàng...' : 'Đang cập nhật đơn giao hàng...');
          try {
            if (deliveryFormMode === 'create') {
              await adminService.createDeliveryOrder(payload);
              toast.success('Tạo đơn giao hàng thành công');
            } else if (currentOrder) {
              await adminService.updateDeliveryOrder(currentOrder.id, payload);
              toast.success('Cập nhật đơn giao hàng thành công');
            }
            fetchOrders();
          } catch (error) {
            toast.error(error.response?.data?.message || (deliveryFormMode === 'create' ? 'Không thể tạo đơn giao hàng' : 'Không thể cập nhật đơn giao hàng'));
          } finally {
            toast.dismiss(loadingToast);
          }
        }}
      />

      <FoodOrderFormModal
        open={showFoodForm}
        mode={foodFormMode}
        order={currentOrder}
        merchants={merchants}
        merchantMenuMap={merchantMenuMap}
        onMerchantSelect={fetchMerchantMenu}
        onClose={() => setShowFoodForm(false)}
        onSubmit={async (payload) => {
          const loadingToast = toast.loading(foodFormMode === 'create' ? 'Đang tạo đơn đồ ăn...' : 'Đang cập nhật đơn đồ ăn...');
          try {
            if (foodFormMode === 'create') {
              await adminService.createFoodOrder(payload);
              toast.success('Tạo đơn đồ ăn thành công');
            } else if (currentOrder) {
              await adminService.updateFoodOrder(currentOrder.id, payload);
              toast.success('Cập nhật đơn đồ ăn thành công');
            }
            fetchOrders();
          } catch (error) {
            toast.error(error.response?.data?.message || (foodFormMode === 'create' ? 'Không thể tạo đơn đồ ăn' : 'Không thể cập nhật đơn đồ ăn'));
          } finally {
            toast.dismiss(loadingToast);
          }
        }}
      />

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
