import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { 
  Car, Save, Edit2, X, Plus, Trash2, Clock, 
  CloudRain, TrendingUp, Users, Monitor, RefreshCw,
  Bike, Bus, CarFront, Loader2, ClipboardCheck,
  MapPin, Plane, Package, Banknote, User, ChevronDown, ChevronUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const VIETNAM_PROVINCES = [
  "Hà Nội", "Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Cần Thơ", 
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
].sort();

const Pricing = () => {
  const [configs, setConfigs] = useState([]);
  const [isFreeMode, setIsFreeMode] = useState(false);
  const [surgeRules, setSurgeRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduledConfig, setScheduledConfig] = useState({
    surcharges: {
      pre_book_surcharge: 0,
      night_surcharge: 0,
      holiday_surcharge: 0,
      waiting_surcharge: 0,
      toll_surcharge: 0,
    },
    dispatch_mode: 1,
    rules: []
  });
  const [savingScheduled, setSavingScheduled] = useState(false);
  
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editRuleIndex, setEditRuleIndex] = useState(null);
  const [editRuleForm, setEditRuleForm] = useState(null);
  
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
        surcharges: sData?.pricing?.surcharges || {
          pre_book_surcharge: 0,
          night_surcharge: 0,
          holiday_surcharge: 0,
          waiting_surcharge: 0,
          toll_surcharge: 0,
        },
        rules: sData?.pricing?.rules || [],
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
      toast.error(error.response?.data?.message || 'Lỗi khi lưu cấu hình');
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
      confirmButtonColor: '#00906a',
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
        area_id: (editSurgeRule.province ? (editSurgeRule.commune ? editSurgeRule.commune + ', ' + editSurgeRule.province : editSurgeRule.province) : null)
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
  
  const handleUpdateScheduledConfig = async (overrideRules = null) => {
    try {
      setSavingScheduled(true);
      const rulesToUse = overrideRules || scheduledConfig.rules;
      const payload = {
        pre_book_surcharge: Number(scheduledConfig.surcharges?.pre_book_surcharge || 0),
        night_surcharge: Number(scheduledConfig.surcharges?.night_surcharge || 0),
        holiday_surcharge: Number(scheduledConfig.surcharges?.holiday_surcharge || 0),
        waiting_surcharge: Number(scheduledConfig.surcharges?.waiting_surcharge || 0),
        toll_surcharge: Number(scheduledConfig.surcharges?.toll_surcharge || 0),
        dispatch_mode: scheduledConfig.dispatch_mode === 2 ? 2 : 1,
        rules: rulesToUse.map(rule => ({
          service_type: Number(rule.service_type),
          ride_mode: rule.ride_mode,
          vehicle_type: Number(rule.vehicle_type),
          airport_id: rule.airport_id || null,
          ranges: rule.ranges.map(range => ({
            start_km: Number(range.start_km),
            end_km: Number(range.end_km),
            price: Number(range.price),
            unit: range.unit || 'per_trip'
          }))
        }))
      };

      await adminService.updateScheduledPricing(payload);
      toast.success('Đã cập nhật cấu hình đặt trước!');
      if (overrideRules) {
        setScheduledConfig({...scheduledConfig, rules: overrideRules});
      } else {
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật cấu hình');
    } finally {
      setSavingScheduled(false);
    }
  };

  const handleSaveRuleModal = async (e) => {
    e.preventDefault();
    const newRules = [...scheduledConfig.rules];
    if (editRuleIndex !== null) {
      newRules[editRuleIndex] = editRuleForm;
    } else {
      newRules.push(editRuleForm);
    }
    await handleUpdateScheduledConfig(newRules);
    setShowRuleModal(false);
  };

  const handleDeleteRule = async (rIndex) => {
    const delRes = await Swal.fire({
        title: 'Xác nhận xóa?',
        text: "Bạn có chắc chắn muốn xóa bảng giá này?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Xóa ngay',
        cancelButtonText: 'Hủy'
    });
    if(delRes.isConfirmed) { 
        const newRules = [...scheduledConfig.rules];
        newRules.splice(rIndex, 1);
        await handleUpdateScheduledConfig(newRules);
    } 
  };

  const VEHICLE_INFO = {
    1: { name: 'Xe máy (Bike)', icon: <Bike size={22} />, color: 'var(--primary)' },
    2: { name: 'Ô tô 4 chỗ (Car 4)', icon: <Car size={22} />, color: '#00906a' },
    3: { name: 'Ô tô 7 chỗ (Car 7)', icon: <CarFront size={22} />, color: '#b78300' },
    4: { name: 'Ô tô 9 chỗ (Car 9)', icon: <Bus size={22} />, color: '#ef4444' },
    6: { name: 'Dịch vụ Lái hộ', icon: <User size={22} />, color: '#6366f1' },
  };

  const SURGE_CONDITIONS = [
    { id: 'peak_hour', label: 'Giờ cao điểm', icon: <Clock size={16} /> },
    { id: 'weather_rain', label: 'Thời tiết xấu', icon: <CloudRain size={16} /> },
  ];

  if (loading && configs.length === 0) {
    return <div className="loading-screen">Đang tải dữ liệu cấu hình...</div>;
  }

  return (
    <div className="pricing-page">
      
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
              setEditSurgeRule({ vehicle_type: 1, conditions: [], multiplier: 1.5, start_time: '07:00', end_time: '09:00', is_active: true, province: '', commune: '' });
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
                        onClick={() => { 
                          let prov = '';
                          let com = '';
                          if (rule.area_id) {
                            const parts = rule.area_id.split(', ');
                            if (parts.length > 1) {
                              com = parts[0];
                              prov = parts[1];
                            } else {
                              prov = rule.area_id;
                            }
                          }
                          setEditSurgeRule({...rule, rule_id: rule.id, province: prov, commune: com, conditions: Array.isArray(rule.conditions) ? rule.conditions : []}); 
                          setShowSurgeModal(true); 
                        }}
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
        <h2 className="section-title">Quản lý Chuyến xe Đặt trước</h2>
      </div>

      <div className="service-pricing-grid" style={{ gridTemplateColumns: '1fr' }}>
        {/* Surcharges Panel */}
        <div className="price-card glass service-card" style={{ borderTopColor: 'var(--primary)' }}>
          <div className="card-top">
            <div className="icon-badge intercity-icon"><Banknote size={24} /></div>
            <div className="title-box">
              <h3>Phụ phí đặt trước</h3>
              <p>Cấu hình các loại phụ phí áp dụng chung</p>
            </div>
            <div className="card-actions" style={{ marginLeft: 'auto' }}>
              <button onClick={() => handleUpdateScheduledConfig()} disabled={savingScheduled} className="btn-premium btn-success">
                {savingScheduled ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Lưu phụ phí
              </button>
            </div>
          </div>
          <div className="card-body">
            <PriceBox label="Phụ phí đặt trước" value={scheduledConfig.surcharges?.pre_book_surcharge} editing={true} editValue={scheduledConfig.surcharges?.pre_book_surcharge} onChange={val => setScheduledConfig({...scheduledConfig, surcharges: {...scheduledConfig.surcharges, pre_book_surcharge: val}})} unit="đ" />
            <PriceBox label="Phụ phí ban đêm" value={scheduledConfig.surcharges?.night_surcharge} editing={true} editValue={scheduledConfig.surcharges?.night_surcharge} onChange={val => setScheduledConfig({...scheduledConfig, surcharges: {...scheduledConfig.surcharges, night_surcharge: val}})} unit="đ" />
            <PriceBox label="Phụ phí Lễ/Tết" value={scheduledConfig.surcharges?.holiday_surcharge} editing={true} editValue={scheduledConfig.surcharges?.holiday_surcharge} onChange={val => setScheduledConfig({...scheduledConfig, surcharges: {...scheduledConfig.surcharges, holiday_surcharge: val}})} unit="đ" />
            <PriceBox label="Phụ phí chờ" value={scheduledConfig.surcharges?.waiting_surcharge} editing={true} editValue={scheduledConfig.surcharges?.waiting_surcharge} onChange={val => setScheduledConfig({...scheduledConfig, surcharges: {...scheduledConfig.surcharges, waiting_surcharge: val}})} unit="đ" />
            <PriceBox label="Phụ phí cầu đường" value={scheduledConfig.surcharges?.toll_surcharge} editing={true} editValue={scheduledConfig.surcharges?.toll_surcharge} onChange={val => setScheduledConfig({...scheduledConfig, surcharges: {...scheduledConfig.surcharges, toll_surcharge: val}})} unit="đ" />
          </div>
        </div>

        {/* Rules Panel */}
        <div className="surge-section glass" style={{ padding: '0', background: 'transparent' }}>
          <div className="section-header" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
            <h3>Danh sách bảng giá (Rules)</h3>
            <button className="btn-premium" onClick={() => {
              setEditRuleIndex(null);
              setEditRuleForm({
                service_type: 6,
                ride_mode: 'shared',
                vehicle_type: 2,
                airport_id: '',
                ranges: []
              });
              setShowRuleModal(true);
            }}>
              <Plus size={18} /> Thêm bảng giá
            </button>
          </div>

          <div className="table-container glass">
            <table>
              <thead>
                <tr>
                  <th>Loại dịch vụ</th>
                  <th>Hình thức đi</th>
                  <th>Loại xe</th>
                  <th>Sân bay</th>
                  <th>Chi tiết giá (VNĐ)</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {scheduledConfig.rules.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                      <p style={{ color: 'var(--text-muted)' }}>Chưa có cấu hình giá nào được thiết lập. Vui lòng thêm mới.</p>
                    </td>
                  </tr>
                )}
                {scheduledConfig.rules.map((rule, rIndex) => (
                  <tr key={rIndex}>
                    <td style={{ fontWeight: 600 }}>{String(rule.service_type) === '6' ? 'Đi Tỉnh' : 'Sân bay'}</td>
                    <td>{rule.ride_mode === 'shared' ? 'Ghép (Shared)' : 'Bao xe (Private)'}</td>
                    <td>{VEHICLE_INFO[rule.vehicle_type]?.name}</td>
                    <td>
                      {String(rule.service_type) === '6' ? (
                        <span style={{ color: 'var(--text-muted)' }}>- Không áp dụng -</span>
                      ) : (
                        rule.airport_id ? <span className="badge badge-primary">{rule.airport_id}</span> : <span style={{ color: 'var(--text-muted)' }}>Tất cả sân bay</span>
                      )}
                    </td>
                    <td>
                      {rule.ranges.length === 0 ? (
                        <span style={{ color: 'var(--error)' }}>Chưa cấu hình giá</span>
                      ) : rule.ranges.length === 1 && Number(rule.ranges[0].start_km) === 0 && Number(rule.ranges[0].end_km) === 0 ? (
                        <strong>Giá cố định: <span style={{ color: 'var(--success)' }}>{Number(rule.ranges[0].price).toLocaleString()}đ</span> /{rule.ranges[0].unit === 'per_trip' ? 'Chuyến' : 'Khách'}</strong>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                          {rule.ranges.map((range, idx) => (
                            <div key={idx} style={{ background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                              Từ <strong>{range.start_km}</strong> đến <strong>{Number(range.end_km) === 0 ? '∞' : range.end_km}</strong> km: 
                              <span style={{ color: 'var(--success)', fontWeight: 600, marginLeft: '4px' }}>{Number(range.price).toLocaleString()}đ</span> /{range.unit === 'per_trip' ? 'Chuyến' : 'Khách'}
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-action btn-action-edit" onClick={() => {
                          setEditRuleIndex(rIndex);
                          setEditRuleForm(JSON.parse(JSON.stringify(rule)));
                          setShowRuleModal(true);
                        }}>
                          <Edit2 size={16} /> Sửa
                        </button>
                        <button className="btn-action btn-action-danger" onClick={() => handleDeleteRule(rIndex)}>
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
      </div>

      {showRuleModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{editRuleIndex !== null ? 'Chỉnh sửa bảng giá' : 'Thêm mới bảng giá'}</h3>
              <button className="btn-icon" onClick={() => setShowRuleModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveRuleModal}>
                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="form-group">
                    <label>Loại Dịch vụ</label>
                    <select className="form-select" value={editRuleForm.service_type} onChange={e => setEditRuleForm({...editRuleForm, service_type: e.target.value})}>
                      <option value={6}>Đi Tỉnh (6)</option>
                      <option value={7}>Sân bay (7)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Hình thức đi</label>
                    <select className="form-select" value={editRuleForm.ride_mode} onChange={e => setEditRuleForm({...editRuleForm, ride_mode: e.target.value})}>
                      <option value="shared">Ghép (Shared)</option>
                      <option value="private">Bao xe (Private)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Loại xe</label>
                    <select className="form-select" value={editRuleForm.vehicle_type} onChange={e => setEditRuleForm({...editRuleForm, vehicle_type: e.target.value})}>
                      {Object.entries(VEHICLE_INFO).map(([id, info]) => <option key={id} value={id}>{info.name}</option>)}
                    </select>
                  </div>
                  {String(editRuleForm.service_type) === '7' && (
                  <div className="form-group">
                    <label>Mã Sân bay</label>
                    <input type="text" className="form-input" placeholder="VD: SGN" value={editRuleForm.airport_id || ''} onChange={e => setEditRuleForm({...editRuleForm, airport_id: e.target.value})} />
                  </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Khoảng KM và Giá cước</label>
                  <table style={{ minWidth: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                    <thead>
                      <tr>
                        <th>Start KM</th>
                        <th>End KM</th>
                        <th>Giá (VNĐ)</th>
                        <th>Đơn vị tính</th>
                        <th style={{ textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {editRuleForm.ranges.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>Chưa có cấu hình giá</td>
                        </tr>
                      )}
                      {editRuleForm.ranges.map((range, rangeIdx) => (
                        <tr key={rangeIdx}>
                          <td><input type="number" step="0.1" min="0" className="form-input" value={range.start_km} onChange={e => { if (e.target.value < 0) { toast.error("Giá trị không hợp lệ! Không thể nhập số âm."); return; } const newRanges = [...editRuleForm.ranges]; newRanges[rangeIdx].start_km = e.target.value; setEditRuleForm({...editRuleForm, ranges: newRanges}); }} /></td>
                          <td><input type="number" step="0.1" min="0" className="form-input" value={range.end_km} onChange={e => { if (e.target.value < 0) { toast.error("Giá trị không hợp lệ! Không thể nhập số âm."); return; } const newRanges = [...editRuleForm.ranges]; newRanges[rangeIdx].end_km = e.target.value; setEditRuleForm({...editRuleForm, ranges: newRanges}); }} /></td>
                          <td><input type="number" min="0" className="form-input" value={range.price} onChange={e => { if (e.target.value < 0) { toast.error("Giá trị không hợp lệ! Không thể nhập số âm."); return; } const newRanges = [...editRuleForm.ranges]; newRanges[rangeIdx].price = e.target.value; setEditRuleForm({...editRuleForm, ranges: newRanges}); }} /></td>
                          <td>
                            <select className="form-select" value={range.unit} onChange={e => { const newRanges = [...editRuleForm.ranges]; newRanges[rangeIdx].unit = e.target.value; setEditRuleForm({...editRuleForm, ranges: newRanges}); }}>
                              <option value="per_passenger">Hành khách</option>
                              <option value="per_trip">Chuyến</option>
                            </select>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button type="button" className="btn-icon" onClick={() => { const newRanges = [...editRuleForm.ranges]; newRanges.splice(rangeIdx, 1); setEditRuleForm({...editRuleForm, ranges: newRanges}); }}><X size={16} color="var(--error)" /></button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', paddingTop: '1rem' }}>
                          <button type="button" className="btn glass" onClick={() => {
                            setEditRuleForm({...editRuleForm, ranges: [...editRuleForm.ranges, {start_km: 0, end_km: 0, price: 0, unit: 'per_trip'}]});
                          }}><Plus size={16} /> Thêm khoảng KM</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="modal-actions" style={{ marginTop: '2rem' }}>
                  <button type="button" className="btn glass" onClick={() => setShowRuleModal(false)}>Hủy</button>
                  <button type="submit" disabled={savingScheduled} className="btn-premium btn-success">
                    {savingScheduled ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Xác nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showSurgeModal && (
        <div className="modal-overlay">
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

                <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                      <label>Tỉnh/Thành phố (Khu vực)</label>
                      <select value={editSurgeRule.province || ''} onChange={e => setEditSurgeRule({...editSurgeRule, province: e.target.value})}>
                         <option value="">-- Tất cả Tỉnh/Thành phố --</option>
                         {VIETNAM_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                  </div>
                  <div className="form-group">
                      <label>Quận/Huyện/Xã</label>
                      <input type="text" placeholder="Nhập tên Phường/Xã (Tùy chọn)" value={editSurgeRule.commune || ''} onChange={e => setEditSurgeRule({...editSurgeRule, commune: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Hệ số tăng giá (multiplier)</label>
                  <input type="number" step="0.1" min="0" value={editSurgeRule.multiplier} onChange={e => { if (e.target.value < 0) { toast.error("Hệ số tăng giá không hợp lệ!"); return; } setEditSurgeRule({...editSurgeRule, multiplier: e.target.value})}} />
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
        .switch-btn.active { background: #00906a; }
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
        .status-tag.active { background: rgba(0, 144, 106, 0.1); color: #00906a; }

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

        .form-input, .form-select {
          padding: 0.5rem;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg);
          color: var(--text);
          font-size: 0.9rem;
          outline: none;
        }
        .form-input:focus, .form-select:focus {
          border-color: var(--primary);
        }
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
          type="number" step={step} min="0" autoFocus
          style={{ background: 'transparent', border: 'none', color: 'inherit', fontSize: '1.1rem', fontWeight: 700, width: '100%', outline: 'none' }}
          value={editValue} 
          onChange={e => {
             if (e.target.value < 0) {
                 toast.error("Giá trị không hợp lệ! Không thể nhập số âm.");
                 return;
             }
             onChange(e.target.value);
          }} 
        />
      ) : (
        <span className="val">{step === "1" ? (Number(value) || 0).toLocaleString() : value}</span>
      )}
      <span className="unit">{unit}</span>
    </div>
  </div>
);

export default Pricing;
