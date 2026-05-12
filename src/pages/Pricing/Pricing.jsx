import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { 
  Car, Save, Edit2, X, Plus, Trash2, Clock, 
  CloudRain, TrendingUp, Users, Monitor, RefreshCw,
  Bike, Bus, CarFront, Loader2, ClipboardCheck,
  MapPin, Plane, Package, Banknote, User
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

const Pricing = () => {
  const [configs, setConfigs] = useState([]);
  const [isFreeMode, setIsFreeMode] = useState(false);
  const [surgeRules, setSurgeRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduledConfig, setScheduledConfig] = useState({
    base_price: 0,
    scheduled_surcharge: 0,
    intercity_base_price: 0,
    intercity_distance_rate: 0,
    intercity_time_rate: 0,
    intercity_min_fare: 0,
    airport_base_price: 0,
    airport_distance_rate: 0,
    airport_time_rate: 0,
    airport_min_fare: 0,
    delivery_base_price: 0,
    delivery_distance_rate: 0,
    delivery_time_rate: 0,
    delivery_min_fare: 0,
    dispatch_mode: 1
  });
  const [savingScheduled, setSavingScheduled] = useState(false);
  const [isEditingScheduled, setIsEditingScheduled] = useState(false);
  
  // State cho việc sửa giá cố định
  const [editingConfigId, setEditingConfigId] = useState(null);
  const [configForm, setConfigForm] = useState({
    vehicleType: 0,
    basePrice: 0,
    distanceRate: 0,
    timeRate: 0,
    minFare: 0,
    surgeMultiplier: 1,
  });

  // State cho việc quản lý Surge Rules
  const [showSurgeModal, setShowSurgeModal] = useState(false);
  const [editSurgeRule, setEditSurgeRule] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configRes, surgeRes, scheduledRes] = await Promise.all([
        adminService.getPricingConfigs(),
        adminService.getSurgeRules(),
        adminService.getScheduledPricing()
      ]);

      // Backend: { data: { configs: [...], global_settings: { is_free_mode: bool } } }
      const configData = configRes?.data ?? {};
      setConfigs(Array.isArray(configData.configs) ? configData.configs : []);
      setIsFreeMode(configData.global_settings?.is_free_mode ?? false);

      // Backend: { data: [...] } — array trực tiếp
      // Normalize surge rules: ensure each rule's conditions is an array
      const rawSurgeRules = Array.isArray(surgeRes?.data) ? surgeRes.data : [];
      setSurgeRules(rawSurgeRules.map(rule => ({
        ...rule,
        conditions: Array.isArray(rule.conditions)
          ? rule.conditions
          : (typeof rule.conditions === 'string' ? JSON.parse(rule.conditions || '[]') : [])
      })));

      // Backend: { data: { pricing: {...}, dispatch_mode: ... } }
      const sData = scheduledRes?.data ?? {};
      setScheduledConfig({
        base_price: sData?.pricing?.base_price || 0,
        scheduled_surcharge: sData?.pricing?.scheduled_surcharge || 0,
        intercity_base_price: sData?.pricing?.intercity_base_price || 0,
        intercity_distance_rate: sData?.pricing?.intercity_distance_rate || 0,
        intercity_time_rate: sData?.pricing?.intercity_time_rate || 0,
        intercity_min_fare: sData?.pricing?.intercity_min_fare || 0,
        airport_base_price: sData?.pricing?.airport_base_price || 0,
        airport_distance_rate: sData?.pricing?.airport_distance_rate || 0,
        airport_time_rate: sData?.pricing?.airport_time_rate || 0,
        airport_min_fare: sData?.pricing?.airport_min_fare || 0,
        delivery_base_price: sData?.pricing?.delivery_base_price || 0,
        delivery_distance_rate: sData?.pricing?.delivery_distance_rate || 0,
        delivery_time_rate: sData?.pricing?.delivery_time_rate || 0,
        delivery_min_fare: sData?.pricing?.delivery_min_fare || 0,
        dispatch_mode: sData?.dispatch_mode || 1
      });
    } catch (error) {
      console.error('fetchData error:', error);
      toast.error('Không thể tải dữ liệu cấu hình!');
    } finally {
      setLoading(false);
    }
  };

  const handleEditConfig = (config) => {
    setEditingConfigId(config.vehicle_type);
    setConfigForm({
      vehicleType: config.vehicle_type,
      basePrice: config.base_price,
      distanceRate: config.distance_rate,
      timeRate: config.time_rate,
      minFare: config.min_fare,
      surgeMultiplier: config.surge_multiplier,
    });
  };

  const handleSaveConfig = async () => {
    try {
      await adminService.updatePricingConfig({
        vehicle_type: configForm.vehicleType,
        base_price: configForm.basePrice,
        distance_rate: configForm.distanceRate,
        time_rate: configForm.timeRate,
        min_fare: configForm.minFare,
        surge_multiplier: configForm.surgeMultiplier,
      });
      setEditingConfigId(null);
      fetchData();
      toast.success('Đã lưu cấu hình giá mới!');
    } catch (error) {
      toast.error('Lỗi khi lưu cấu hình');
    }
  };

  const handleResetConfig = async (vehicleType) => {
    const result = await Swal.fire({
      title: 'Khôi phục mặc định?',
      text: "Hệ thống sẽ quay về giá cước mặc định trong code cho loại xe này.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      background: document.body.className.includes('dark') ? '#1e293b' : '#fff',
      color: document.body.className.includes('dark') ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        await adminService.resetPricingConfig(vehicleType);
        fetchData();
        toast.success('Đã khôi phục giá mặc định thành công.');
      } catch (error) {
        toast.error('Không thể khôi phục giá mặc định.');
      }
    }
  };

  const handleToggleFreeMode = async () => {
    const newStatus = !isFreeMode;
    const result = await Swal.fire({
      title: newStatus ? 'Bật chế độ miễn phí?' : 'Tắt chế độ miễn phí?',
      text: newStatus ? 'Tài xế sẽ nhận 100% doanh thu (0% hoa hồng).' : 'Hệ thống sẽ thu hoa hồng theo cấu hình chuẩn.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Xác nhận',
      background: document.body.className.includes('dark') ? '#1e293b' : '#fff',
      color: document.body.className.includes('dark') ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        await adminService.toggleFreeMode(newStatus);
        setIsFreeMode(newStatus);
        toast.success(newStatus ? 'Đã kích hoạt chế độ miễn phí!' : 'Đã tắt chế độ miễn phí.');
      } catch (error) {
        toast.error('Không thể cập nhật chế độ miễn phí.');
      }
    }
  };

  const handleSaveSurgeRule = async (e) => {
    e.preventDefault();
    try {
      // Làm sạch dữ liệu và chỉ gửi các trường Backend cần
      const payload = {
        vehicle_type: Number(editSurgeRule.vehicle_type),
        conditions: editSurgeRule.conditions,
        multiplier: Number(editSurgeRule.multiplier),
        start_time: editSurgeRule.start_time ? editSurgeRule.start_time.substring(0, 5) : null,
        end_time: editSurgeRule.end_time ? editSurgeRule.end_time.substring(0, 5) : null,
        rule_id: editSurgeRule.rule_id || null,
        area_id: editSurgeRule.area_id || null
      };

      await adminService.saveSurgeRule(payload);
      setShowSurgeModal(false);
      fetchData();
      toast.success('Đã lưu quy tắc Surge thành công!');
    } catch (error) {
      console.error('Save Error:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Lỗi khi lưu quy tắc.';
      toast.error(errorMsg);
    }
  };
  
  const handleUpdateScheduledConfig = async () => {
    try {
      setSavingScheduled(true);
      const payload = {
        base_price: Number(scheduledConfig.base_price),
        scheduled_surcharge: Number(scheduledConfig.scheduled_surcharge),
        intercity_base_price: Number(scheduledConfig.intercity_base_price),
        intercity_distance_rate: Number(scheduledConfig.intercity_distance_rate),
        intercity_time_rate: Number(scheduledConfig.intercity_time_rate),
        intercity_min_fare: Number(scheduledConfig.intercity_min_fare),
        airport_base_price: Number(scheduledConfig.airport_base_price),
        airport_distance_rate: Number(scheduledConfig.airport_distance_rate),
        airport_time_rate: Number(scheduledConfig.airport_time_rate),
        airport_min_fare: Number(scheduledConfig.airport_min_fare),
        delivery_base_price: Number(scheduledConfig.delivery_base_price),
        delivery_distance_rate: Number(scheduledConfig.delivery_distance_rate),
        delivery_time_rate: Number(scheduledConfig.delivery_time_rate),
        delivery_min_fare: Number(scheduledConfig.delivery_min_fare),
        dispatch_mode: scheduledConfig.dispatch_mode === 2 ? 2 : 1
      };

      await adminService.updateScheduledPricing(payload);
      toast.success('Đã cập nhật cấu hình đặt trước!');
      setIsEditingScheduled(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật cấu hình');
    } finally {
      setSavingScheduled(false);
    }
  };

  const toggleScheduledEdit = () => {
    setIsEditingScheduled(true);
  };

  const VEHICLE_INFO = {
    1: { name: 'Xe máy (Bike)', icon: <Bike size={22} />, color: 'var(--primary)' },
    2: { name: 'Ô tô 4 chỗ (Car 4)', icon: <Car size={22} />, color: '#10b981' },
    3: { name: 'Ô tô 7 chỗ (Car 7)', icon: <CarFront size={22} />, color: '#f59e0b' },
    4: { name: 'Ô tô 9 chỗ (Car 9)', icon: <Bus size={22} />, color: '#ef4444' },
    6: { name: 'Dịch vụ Lái hộ', icon: <User size={22} />, color: '#6366f1' },
  };

  const SURGE_CONDITIONS = [
    { id: 'peak_hour', label: 'Giờ cao điểm', icon: <Clock size={16} /> },
    { id: 'weather_rain', label: 'Thời tiết xấu', icon: <CloudRain size={16} /> },
    { id: 'high_demand', label: 'Nhu cầu cao', icon: <TrendingUp size={16} /> },
    { id: 'low_supply', label: 'Thiếu tài xế', icon: <Users size={16} /> },
  ];

  if (loading && configs.length === 0) {
    return <div className="loading-screen">Đang tải dữ liệu cấu hình...</div>;
  }

  return (
    <div className="pricing-page">
      <Toaster position="top-right" reverseOrder={false} />
      
      <div className="header-info">
        <h1 className="main-title">Cấu hình giá cước</h1>
        <div className="free-mode-wrapper">
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Chế độ miễn phí</span>
          <button className={`switch-btn ${isFreeMode ? 'active' : ''}`} onClick={handleToggleFreeMode}>
            <div className="switch-handle" />
          </button>
        </div>
      </div>

      <div className="pricing-grid">
        {configs.map(config => (
          <div key={config.vehicle_type} className="price-card glass">
            <div className="card-top">
              <div className="icon-badge" style={{ color: VEHICLE_INFO[Number(config.vehicle_type)]?.color }}>
                {VEHICLE_INFO[Number(config.vehicle_type)]?.icon}
              </div>
              <div className="title-box">
                <h3>{VEHICLE_INFO[Number(config.vehicle_type)]?.name || 'Loại xe mới'}</h3>
                <p>{editingConfigId === config.vehicle_type ? 'Đang chỉnh sửa...' : 'Cấu hình tiêu chuẩn'}</p>
              </div>
              <div className="card-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                {editingConfigId === config.vehicle_type ? (
                  <>
                    <button onClick={handleSaveConfig} className="btn-icon" style={{ color: 'var(--success)', borderColor: 'var(--success)' }} title="Lưu"><Save size={18} /></button>
                    <button onClick={() => setEditingConfigId(null)} className="btn-icon" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} title="Hủy"><X size={18} /></button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleResetConfig(config.vehicle_type)} className="btn-icon" title="Khôi phục mặc định"><RefreshCw size={18} /></button>
                    <button onClick={() => handleEditConfig(config)} className="btn-icon" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} title="Chỉnh sửa"><Edit2 size={18} /></button>
                  </>
                )}
              </div>

            </div>

            <div className="card-body">
              <PriceBox 
                label="Giá mở cửa" value={config.base_price} 
                editing={editingConfigId === config.vehicle_type}
                editValue={configForm.basePrice}
                onChange={val => setConfigForm({...configForm, basePrice: val})}
                unit="đ"
              />
              <PriceBox 
                label="Giá tối thiểu" value={config.min_fare} 
                editing={editingConfigId === config.vehicle_type}
                editValue={configForm.minFare}
                onChange={val => setConfigForm({...configForm, minFare: val})}
                unit="đ"
              />
              <PriceBox 
                label="Giá / km" value={config.distance_rate} 
                editing={editingConfigId === config.vehicle_type}
                editValue={configForm.distanceRate}
                onChange={val => setConfigForm({...configForm, distanceRate: val})}
                unit="đ"
              />
              <PriceBox 
                label="Giá / phút" value={config.time_rate} 
                editing={editingConfigId === config.vehicle_type}
                editValue={configForm.timeRate}
                onChange={val => setConfigForm({...configForm, timeRate: val})}
                unit="đ"
              />
              <PriceBox 
                label="Hệ số Surge" value={config.surge_multiplier} 
                editing={editingConfigId === config.vehicle_type}
                editValue={configForm.surgeMultiplier}
                onChange={val => setConfigForm({...configForm, surgeMultiplier: val})}
                unit="x" step="0.1"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="surge-section glass">
        <div className="section-header">
          <h3>Quy tắc tăng giá cao điểm (Surge)</h3>
          <button className="btn-premium" onClick={() => {
              setEditSurgeRule({ vehicle_type: 1, conditions: [], multiplier: 1.5, start_time: '07:00', end_time: '09:00', is_active: true });
              setShowSurgeModal(true);
          }}>
            <Plus size={18} /> Thêm quy tắc
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Loại xe</th>
                <th>Điều kiện áp dụng</th>
                <th>Hệ số</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {surgeRules.map(rule => (
                <tr key={rule.id}>
                  <td style={{ fontWeight: 700 }}>{VEHICLE_INFO[rule.vehicle_type]?.name}</td>
                  <td>
                    <div className="badge-list">
                      {rule.conditions.map((c, i) => (
                        <span key={i} className="mini-badge">
                          {SURGE_CONDITIONS.find(sc => sc.id === c)?.icon}
                          {SURGE_CONDITIONS.find(sc => sc.id === c)?.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td><span className="multiplier-text">{rule.multiplier}x</span></td>
                  <td>{rule.start_time?.substring(0,5)} - {rule.end_time?.substring(0,5)}</td>
                  <td>
                    <span className={`status-tag ${rule.is_active ? 'active' : ''}`}>
                      {rule.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        className="btn-action btn-action-edit" 
                        onClick={() => { setEditSurgeRule({...rule, rule_id: rule.id, conditions: Array.isArray(rule.conditions) ? rule.conditions : []}); setShowSurgeModal(true); }}
                      >
                        <Edit2 size={16} /> Sửa
                      </button>
                      <button 
                        className="btn-action btn-action-danger" 
                        onClick={async () => { 
                          const delRes = await Swal.fire({
                              title: 'Xác nhận xóa?',
                              text: "Hành động này không thể hoàn tác!",
                              icon: 'warning',
                              showCancelButton: true,
                              confirmButtonColor: '#ef4444',
                              confirmButtonText: 'Xóa ngay',
                              cancelButtonText: 'Hủy',
                              background: document.body.className.includes('dark') ? '#1e293b' : '#fff',
                              color: document.body.className.includes('dark') ? '#fff' : '#000',
                          });
                          if(delRes.isConfirmed) { 
                              await adminService.deleteSurgeRule(rule.id); 
                              fetchData(); 
                              toast.success('Đã xóa quy tắc!');
                          } 
                        }}
                      >
                        <Trash2 size={16} /> Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* UC-118: Scheduled Ride & Service Type Pricing */}
      <div className="section-divider">
        <h2 className="section-title">Quản lý Chuyến xe & Dịch vụ</h2>
        <div className="section-actions">
          {isEditingScheduled ? (
            <>
              <button onClick={handleUpdateScheduledConfig} disabled={savingScheduled} className="btn-premium btn-success">
                {savingScheduled ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Lưu cấu hình
              </button>
              <button onClick={() => setIsEditingScheduled(false)} className="btn glass text-error">Hủy</button>
            </>
          ) : (
            <button onClick={toggleScheduledEdit} className="btn-premium">
              <Edit2 size={18} /> Chỉnh sửa cấu hình
            </button>
          )}
        </div>
      </div>

      <div className="service-pricing-grid">
        {/* Đi tỉnh */}
        <div className="price-card glass service-card">
          <div className="card-top">
            <div className="icon-badge intercity-icon"><MapPin size={24} /></div>
            <div className="title-box">
              <h3>Dịch vụ Đi tỉnh</h3>
              <p>Cấu hình chuyến đi liên tỉnh</p>
            </div>
          </div>
          <div className="card-body">
            <PriceBox label="Giá mở cửa" value={scheduledConfig.intercity_base_price} editing={isEditingScheduled} editValue={scheduledConfig.intercity_base_price} onChange={val => setScheduledConfig({...scheduledConfig, intercity_base_price: val})} unit="đ" />
            <PriceBox label="Giá tối thiểu" value={scheduledConfig.intercity_min_fare} editing={isEditingScheduled} editValue={scheduledConfig.intercity_min_fare} onChange={val => setScheduledConfig({...scheduledConfig, intercity_min_fare: val})} unit="đ" />
            <PriceBox label="Giá / km" value={scheduledConfig.intercity_distance_rate} editing={isEditingScheduled} editValue={scheduledConfig.intercity_distance_rate} onChange={val => setScheduledConfig({...scheduledConfig, intercity_distance_rate: val})} unit="đ" />
            <PriceBox label="Giá / phút" value={scheduledConfig.intercity_time_rate} editing={isEditingScheduled} editValue={scheduledConfig.intercity_time_rate} onChange={val => setScheduledConfig({...scheduledConfig, intercity_time_rate: val})} unit="đ" />
          </div>
        </div>

        {/* Sân bay */}
        <div className="price-card glass service-card">
          <div className="card-top">
            <div className="icon-badge airport-icon"><Plane size={24} /></div>
            <div className="title-box">
              <h3>Dịch vụ Sân bay</h3>
              <p>Cấu hình đón/tiễn sân bay</p>
            </div>
          </div>
          <div className="card-body">
            <PriceBox label="Giá mở cửa" value={scheduledConfig.airport_base_price} editing={isEditingScheduled} editValue={scheduledConfig.airport_base_price} onChange={val => setScheduledConfig({...scheduledConfig, airport_base_price: val})} unit="đ" />
            <PriceBox label="Giá tối thiểu" value={scheduledConfig.airport_min_fare} editing={isEditingScheduled} editValue={scheduledConfig.airport_min_fare} onChange={val => setScheduledConfig({...scheduledConfig, airport_min_fare: val})} unit="đ" />
            <PriceBox label="Giá / km" value={scheduledConfig.airport_distance_rate} editing={isEditingScheduled} editValue={scheduledConfig.airport_distance_rate} onChange={val => setScheduledConfig({...scheduledConfig, airport_distance_rate: val})} unit="đ" />
            <PriceBox label="Giá / phút" value={scheduledConfig.airport_time_rate} editing={isEditingScheduled} editValue={scheduledConfig.airport_time_rate} onChange={val => setScheduledConfig({...scheduledConfig, airport_time_rate: val})} unit="đ" />
          </div>
        </div>

        {/* Giao hàng */}
        <div className="price-card glass service-card">
          <div className="card-top">
            <div className="icon-badge delivery-icon"><Package size={24} /></div>
            <div className="title-box">
              <h3>Dịch vụ Giao hàng</h3>
              <p>Cấu hình vận chuyển hàng hóa</p>
            </div>
          </div>
          <div className="card-body">
            <PriceBox label="Giá mở cửa" value={scheduledConfig.delivery_base_price} editing={isEditingScheduled} editValue={scheduledConfig.delivery_base_price} onChange={val => setScheduledConfig({...scheduledConfig, delivery_base_price: val})} unit="đ" />
            <PriceBox label="Giá tối thiểu" value={scheduledConfig.delivery_min_fare} editing={isEditingScheduled} editValue={scheduledConfig.delivery_min_fare} onChange={val => setScheduledConfig({...scheduledConfig, delivery_min_fare: val})} unit="đ" />
            <PriceBox label="Giá / km" value={scheduledConfig.delivery_distance_rate} editing={isEditingScheduled} editValue={scheduledConfig.delivery_distance_rate} onChange={val => setScheduledConfig({...scheduledConfig, delivery_distance_rate: val})} unit="đ" />
            <PriceBox label="Giá / phút" value={scheduledConfig.delivery_time_rate} editing={isEditingScheduled} editValue={scheduledConfig.delivery_time_rate} onChange={val => setScheduledConfig({...scheduledConfig, delivery_time_rate: val})} unit="đ" />
          </div>
        </div>
      </div>

      {showSurgeModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') setShowSurgeModal(false);
        }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{editSurgeRule.rule_id ? 'Chỉnh sửa quy tắc' : 'Thêm mới quy tắc'}</h3>
              <button className="btn-icon" onClick={() => setShowSurgeModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveSurgeRule}>
                <div className="form-group">
                  <label>Loại phương tiện</label>
                  <select value={editSurgeRule.vehicle_type} onChange={e => setEditSurgeRule({...editSurgeRule, vehicle_type: e.target.value})}>
                    {Object.entries(VEHICLE_INFO).map(([id, info]) => <option key={id} value={id}>{info.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Điều kiện áp dụng</label>
                  <div className="conditions-grid">
                    {SURGE_CONDITIONS.map(cond => (
                      <label key={cond.id} className="cond-checkbox">
                        <input 
                          type="checkbox" 
                          checked={editSurgeRule.conditions.includes(cond.id)}
                          onChange={(e) => {
                            const newConds = e.target.checked 
                              ? [...editSurgeRule.conditions, cond.id]
                              : editSurgeRule.conditions.filter(c => c !== cond.id);
                            setEditSurgeRule({...editSurgeRule, conditions: newConds});
                          }}
                        />
                        <span>{cond.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                      <label>Giờ bắt đầu</label>
                      <input type="time" value={editSurgeRule.start_time} onChange={e => setEditSurgeRule({...editSurgeRule, start_time: e.target.value})} />
                  </div>
                  <div className="form-group">
                      <label>Giờ kết thúc</label>
                      <input type="time" value={editSurgeRule.end_time} onChange={e => setEditSurgeRule({...editSurgeRule, end_time: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Hệ số tăng giá (multiplier)</label>
                  <input type="number" step="0.1" value={editSurgeRule.multiplier} onChange={e => setEditSurgeRule({...editSurgeRule, multiplier: e.target.value})} />
                </div>

                <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                  <button type="button" onClick={() => setShowSurgeModal(false)} className="btn glass" style={{ color: 'var(--text)' }}>Hủy</button>
                  <button type="submit" className="btn-premium">Lưu cấu hình</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .pricing-page { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .header-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem; }
        .main-title { font-size: 1.75rem; font-weight: 800; color: var(--text); }

        .free-mode-wrapper { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 1rem; background: var(--bg-soft); border-radius: 12px; }
        .switch-btn { width: 44px; height: 24px; border-radius: 12px; background: #cbd5e1; border: none; cursor: pointer; position: relative; transition: background 0.3s; }
        .switch-btn.active { background: var(--success); }
        .switch-handle { width: 18px; height: 18px; border-radius: 50%; background: white; position: absolute; top: 3px; left: 3px; transition: transform 0.3s; }
        .switch-btn.active .switch-handle { transform: translateX(20px); }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .price-card { padding: 1.5rem; border-radius: 20px; transition: transform 0.2s; background: var(--card); }
        .price-card:hover { transform: translateY(-5px); }
        
        .card-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .icon-badge { width: 48px; height: 48px; border-radius: 12px; background: rgba(99, 102, 241, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .title-box { flex: 1; min-width: 0; }
        .title-box h3 { font-size: 1rem; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .title-box p { font-size: 0.75rem; color: var(--text-muted); margin: 0; }
        
        .card-body { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .price-item { 
          padding: 0.875rem; 
          background: var(--bg-soft); 
          border-radius: 12px; 
          border: 1px solid var(--border);
          border-left: 3px solid var(--primary);
          transition: var(--transition);
        }
        .price-item:hover { background: var(--bg); border-color: var(--primary); }
        .price-item label { display: block; font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.35rem; font-weight: 700; letter-spacing: 0.5px; }
        .price-item .val { font-size: 1.1rem; font-weight: 800; color: var(--text); }
        .price-item .unit { font-size: 0.8rem; color: var(--text-muted); margin-left: 4px; font-weight: 600; }


        .surge-section { padding: 2rem; border-radius: 24px; background: var(--card); }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; gap: 1rem; flex-wrap: nowrap; }
        .btn-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); background: var(--bg-soft); color: var(--text-muted); cursor: pointer; transition: var(--transition); flex-shrink: 0; }
        .btn-icon:hover { border-color: var(--primary); color: var(--primary); transform: translateY(-2px); }
        
        .badge-list { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .mini-badge { font-size: 0.75rem; padding: 0.2rem 0.5rem; background: var(--bg-soft); border-radius: 6px; display: flex; align-items: center; gap: 0.25rem; }
        .multiplier-text { font-weight: 800; color: var(--warning); font-size: 1.1rem; }
        
        .status-tag { padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .status-tag.active { background: rgba(16, 185, 129, 0.1); color: var(--success); }

        .conditions-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; background: var(--bg-soft); padding: 1rem; border-radius: 12px; border: 1px solid var(--border); }
        .cond-checkbox { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; padding: 0.25rem 0.5rem; border-radius: 6px; transition: background 0.2s; }
        .cond-checkbox:hover { background: rgba(99, 102, 241, 0.1); }
        .cond-checkbox input { width: auto; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--text-muted); }
        .form-group select, .form-group input { width: 100%; padding: 0.75rem; border-radius: 10px; border: 1px solid var(--border); background: var(--bg); color: var(--text); outline: none; }

        @media (max-width: 640px) {
          .pricing-grid { grid-template-columns: 1fr; }
          .card-body { grid-template-columns: 1fr; }
        }

        .section-divider { display: flex; justify-content: space-between; align-items: center; margin: 4rem 0 2rem; border-bottom: 2px solid var(--border); padding-bottom: 1rem; }
        .section-title { font-size: 1.5rem; font-weight: 800; color: var(--text); margin: 0; }
        .section-actions { display: flex; gap: 1rem; }
        .service-pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .service-card { border-top: 4px solid var(--primary); }
        .service-card:nth-child(2) { border-top-color: var(--secondary); }
        .service-card:nth-child(3) { border-top-color: var(--success); }

        .intercity-icon { background: rgba(67, 97, 238, 0.1) !important; color: var(--primary) !important; }
        .airport-icon { background: rgba(247, 37, 133, 0.1) !important; color: var(--secondary) !important; }
        .delivery-icon { background: rgba(6, 214, 160, 0.1) !important; color: var(--success) !important; }

        .btn-success { background: var(--success) !important; color: white !important; }
        .text-error { color: var(--error) !important; }
        .mt-8 { margin-top: 2rem; }
      `}} />

    </div>
  );
};

const PriceBox = ({ label, value = 0, editing, editValue, onChange, unit, step = "1" }) => (
  <div className="price-item">
    <label>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {editing ? (
        <input 
          type="number" step={step} autoFocus
          style={{ background: 'transparent', border: 'none', color: 'inherit', fontSize: '1.1rem', fontWeight: 700, width: '100%', outline: 'none' }}
          value={editValue} 
          onChange={e => onChange(e.target.value)} 
        />
      ) : (
        <span className="val">{step === "1" ? (Number(value) || 0).toLocaleString() : value}</span>
      )}
      <span className="unit">{unit}</span>
    </div>
  </div>
);

export default Pricing;
