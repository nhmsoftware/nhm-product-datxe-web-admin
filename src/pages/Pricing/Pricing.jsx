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
import {
  SCHEDULED_PRICING_SERVICE_OPTIONS,
  SCHEDULED_PRICING_SERVICE_LABEL_MAP,
  SCHEDULED_RIDE_MODE_OPTIONS,
  SCHEDULED_RIDE_MODE_LABEL_MAP,
} from '../../constants/serviceCatalog';

const VIETNAM_PROVINCES = [
  "Hà Nội", "Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Cần Thơ", 
  "An Giang", "Bà Rịa - Vũng Tàu", "Bắc Giang", "Bắc Kạn", "Bạc Liêu", "Bắc Ninh", "Bến Tre", "Bình Định", "Bình Dương", "Bình Phước", "Bình Thuận", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai", "Hà Giang", "Hà Nam", "Hà Tĩnh", "Hải Dương", "Hậu Giang", "Hòa Bình", "Hưng Yên", "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An", "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình", "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng", "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa", "Thừa Thiên Huế", "Tiền Giang", "Trà Vinh", "Tuyên Quang", "Vĩnh Long", "Vĩnh Phúc", "Yên Bái"
].sort();

const VEHICLE_ICON_MAP = {
  bike: { icon: <Bike size={22} />, color: 'var(--primary)' },
  car_4: { icon: <Car size={22} />, color: '#00906a' },
  car_7: { icon: <CarFront size={22} />, color: '#b78300' },
  car_9: { icon: <Bus size={22} />, color: '#ef4444' },
  car_shared: { icon: <Users size={22} />, color: '#0ea5e9' },
  chauffeur: { icon: <User size={22} />, color: '#6366f1' },
  default: { icon: <Car size={22} />, color: 'var(--primary)' },
};

const CONFIG_STATUS_META = {
  configured: {
    label: 'Đang hoạt động',
    description: 'Loại xe này đang có bảng giá được áp dụng.',
    tone: 'active',
  },
  inactive: {
    label: 'Đã lưu trữ',
    description: 'Có cấu hình cũ nhưng hiện không còn áp dụng.',
    tone: 'inactive',
  },
  not_configured: {
    label: 'Chưa cấu hình',
    description: 'Chưa có bảng giá. Loại xe sẽ không thể đặt chuyến.',
    tone: 'draft',
  },
};

const Pricing = () => {
  const [configs, setConfigs] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
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
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showVehicleTypeModal, setShowVehicleTypeModal] = useState(false);
  const [editingVehicleTypeId, setEditingVehicleTypeId] = useState(null);
  const [configForm, setConfigForm] = useState({
    vehicleTypeId: 0,
    basePrice: 0,
    distanceRate: 0,
    timeRate: 0,
    minFare: 0,
    surgeMultiplier: 1,
    commissionRate: 20,
    isActive: true,
  });
  const [vehicleTypeForm, setVehicleTypeForm] = useState({
    name_vi: '',
    code: '',
    description_vi: '',
    capacity: 1,
    estimated_wait_time: '',
    service_scopes: [],
    is_bookable: true,
    is_active: true,
    sort_order: 0,
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
        adminService.getScheduledPricing(),
      ]);
      const vehicleTypeRes = await adminService.getAdminVehicleTypes();

      // Backend: { data: { configs: [...], global_settings: { is_free_mode: bool } } }
      const configData = configRes?.data ?? {};
      setConfigs(Array.isArray(configData.configs) ? configData.configs : []);
      setVehicleTypes(Array.isArray(vehicleTypeRes?.data) ? vehicleTypeRes.data : []);
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
    setEditingConfigId(config.vehicle_type_id);
    setConfigForm({
      vehicleTypeId: config.vehicle_type_id,
      basePrice: config.base_price ?? 0,
      distanceRate: config.distance_rate ?? 0,
      timeRate: config.time_rate ?? 0,
      minFare: config.min_fare ?? 0,
      surgeMultiplier: config.surge_multiplier ?? 1,
      commissionRate: config.commission_rate ?? 20,
      isActive: config.is_active ?? true,
    });
    setShowConfigModal(true);
  };

  const handleCreateConfig = () => {
    const defaultType = configs.find(cfg => cfg.config_status === 'not_configured') || configs[0];
    setEditingConfigId(null);
    setConfigForm({
      vehicleTypeId: defaultType?.vehicle_type_id ?? 0,
      basePrice: 0,
      distanceRate: 0,
      timeRate: 0,
      minFare: 0,
      surgeMultiplier: 1,
      commissionRate: 20,
      isActive: true,
    });
    setShowConfigModal(true);
  };

  const handleCreateVehicleType = () => {
    setEditingVehicleTypeId(null);
    setVehicleTypeForm({
      name_vi: '',
      code: '',
      description_vi: '',
      capacity: 1,
      estimated_wait_time: '',
      service_scopes: [],
      is_bookable: true,
      is_active: true,
      sort_order: vehicleTypes.length + 1,
    });
    setShowVehicleTypeModal(true);
  };

  const handleEditVehicleType = (vehicleType) => {
    setEditingVehicleTypeId(vehicleType.id);
    setVehicleTypeForm({
      name_vi: vehicleType.name_vi || '',
      code: vehicleType.code || '',
      description_vi: vehicleType.description_vi || '',
      capacity: vehicleType.capacity || 1,
      estimated_wait_time: vehicleType.estimated_wait_time || '',
      service_scopes: Array.isArray(vehicleType.service_scopes) ? vehicleType.service_scopes : [],
      is_bookable: vehicleType.is_bookable ?? true,
      is_active: vehicleType.is_active ?? true,
      sort_order: vehicleType.sort_order || 0,
    });
    setShowVehicleTypeModal(true);
  };

  const handleSaveConfig = async () => {
    try {
      await adminService.updatePricingConfig({
        vehicle_type_id: Number(configForm.vehicleTypeId),
        base_price: configForm.basePrice,
        distance_rate: configForm.distanceRate,
        time_rate: configForm.timeRate,
        min_fare: configForm.minFare,
        surge_multiplier: configForm.surgeMultiplier,
        commission_rate: configForm.commissionRate,
        is_active: configForm.isActive,
      });
      setEditingConfigId(null);
      setShowConfigModal(false);
      await fetchData();
      toast.success('Đã lưu cấu hình giá mới!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu cấu hình');
    }
  };

  const handleDeleteConfig = async (vehicleTypeId, vehicleLabel) => {
    const result = await Swal.fire({
      title: 'Lưu trữ cấu hình giá?',
      text: `Cấu hình hiện tại của ${vehicleLabel} sẽ bị chuyển sang trạng thái không hoạt động.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Lưu trữ',
      cancelButtonText: 'Hủy',
      background: document.body.className.includes('dark') ? '#1e293b' : '#fff',
      color: document.body.className.includes('dark') ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        await adminService.archivePricingConfig(vehicleTypeId);
        await fetchData();
        toast.success('Đã lưu trữ cấu hình giá thành công.');
      } catch (error) {
        toast.error('Không thể lưu trữ cấu hình giá.');
      }
    }
  };

  const handleSaveVehicleType = async () => {
    try {
      const payload = {
        ...vehicleTypeForm,
        capacity: Number(vehicleTypeForm.capacity || 1),
        sort_order: Number(vehicleTypeForm.sort_order || 0),
      };

      if (editingVehicleTypeId) {
        await adminService.updateVehicleType(editingVehicleTypeId, payload);
        toast.success('Đã cập nhật phương tiện thành công.');
      } else {
        await adminService.createVehicleType(payload);
        toast.success('Đã tạo phương tiện thành công.');
      }

      setShowVehicleTypeModal(false);
      setEditingVehicleTypeId(null);
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể lưu phương tiện.');
    }
  };

  const handleDeleteVehicleType = async (vehicleType) => {
    const result = await Swal.fire({
      title: 'Lưu trữ phương tiện?',
      text: `Phương tiện "${vehicleType.name_vi}" sẽ bị ẩn khỏi danh mục khả dụng.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Lưu trữ',
      cancelButtonText: 'Hủy',
      background: document.body.className.includes('dark') ? '#1e293b' : '#fff',
      color: document.body.className.includes('dark') ? '#fff' : '#000',
    });

    if (result.isConfirmed) {
      try {
        await adminService.deleteVehicleType(vehicleType.id);
        await fetchData();
        toast.success('Đã lưu trữ phương tiện.');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể lưu trữ phương tiện.');
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

      const invalidRuleIndex = rulesToUse.findIndex((rule) => !Array.isArray(rule.ranges) || rule.ranges.length === 0);
      if (invalidRuleIndex >= 0) {
        toast.error(`Bảng giá #${invalidRuleIndex + 1} chưa có khoảng KM nào.`);
        return;
      }

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
          vehicle_type_id: Number(rule.vehicle_type_id ?? rule.vehicle_type),
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
      const errorData = error.response?.data;
      const firstError = errorData?.errors ? Object.values(errorData.errors)[0]?.[0] : null;
      toast.error(firstError || errorData?.message || 'Lỗi khi cập nhật cấu hình');
    } finally {
      setSavingScheduled(false);
    }
  };

  const handleSaveRuleModal = async (e) => {
    e.preventDefault();
    if (!Array.isArray(editRuleForm.ranges) || editRuleForm.ranges.length === 0) {
      toast.error('Vui lòng thêm ít nhất một khoảng KM trước khi lưu.');
      return;
    }
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

  const VEHICLE_INFO = vehicleTypes.reduce((acc, type) => {
    const visual = VEHICLE_ICON_MAP[type.code] || VEHICLE_ICON_MAP.default;
    acc[type.id] = {
      name: type.name_vi,
      icon: visual.icon,
      color: visual.color,
      code: type.code,
    };
    return acc;
  }, {});

  const SURGE_CONDITIONS = [
    { id: 'peak_hour', label: 'Giờ cao điểm', icon: <Clock size={16} /> },
    { id: 'weather_rain', label: 'Thời tiết xấu', icon: <CloudRain size={16} /> },
  ];
  const SERVICE_SCOPE_OPTIONS = [
    { id: 'city', label: 'Chuyến thường' },
    { id: 'intercity', label: 'Đi tỉnh' },
    { id: 'airport', label: 'Sân bay' },
    { id: 'delivery', label: 'Giao hàng' },
    { id: 'chauffeur', label: 'Lái hộ' },
  ];

  const activeConfigCount = configs.filter((config) => config.config_status === 'configured' && config.is_active).length;
  const notConfiguredCount = configs.filter((config) => config.config_status === 'not_configured').length;
  const archivedConfigCount = configs.filter((config) => config.config_status === 'inactive' || !config.is_active).length;

  if (loading && configs.length === 0) {
    return <div className="loading-screen">Đang tải dữ liệu cấu hình...</div>;
  }

  return (
    <div className="pricing-page">
      
      <div className="header-info">
        <h1 className="main-title">Cấu hình giá cước</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button className="btn-premium" onClick={handleCreateConfig}>
            <Plus size={18} /> Thêm cấu hình giá
          </button>
          <button className="btn glass" onClick={handleCreateVehicleType}>
            <Plus size={18} /> Thêm phương tiện
          </button>
          <div className="free-mode-wrapper">
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Chế độ miễn phí</span>
            <button className={`switch-btn ${isFreeMode ? 'active' : ''}`} onClick={handleToggleFreeMode}>
              <div className="switch-handle" />
            </button>
          </div>
        </div>
      </div>

      <div className="pricing-summary">
        <div className="summary-card glass">
          <span className="summary-label">Đang hoạt động</span>
          <strong className="summary-value">{activeConfigCount}</strong>
        </div>
        <div className="summary-card glass">
          <span className="summary-label">Chưa cấu hình</span>
          <strong className="summary-value">{notConfiguredCount}</strong>
        </div>
        <div className="summary-card glass">
          <span className="summary-label">Đã lưu trữ</span>
          <strong className="summary-value">{archivedConfigCount}</strong>
        </div>
      </div>

      <div className="pricing-grid">
        {configs.map(config => (
          <div
            key={config.vehicle_type_id}
            className={`price-card glass config-status-${config.config_status === 'configured' && config.is_active ? 'configured' : config.config_status}`}
          >
            <div className="card-top">
              <div className="icon-badge" style={{ color: VEHICLE_INFO[Number(config.vehicle_type_id)]?.color }}>
                {VEHICLE_INFO[Number(config.vehicle_type_id)]?.icon}
              </div>
              <div className="title-box">
                <h3>{config.vehicle_label || VEHICLE_INFO[Number(config.vehicle_type_id)]?.name || 'Loại xe mới'}</h3>
                <p>{CONFIG_STATUS_META[config.config_status]?.description || 'Cấu hình tiêu chuẩn'}</p>
              </div>
              <div className="card-actions" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                {config.config_status !== 'not_configured' && (
                  <button
                    onClick={() => handleDeleteConfig(config.vehicle_type_id, config.vehicle_label)}
                    className="btn-icon btn-icon-danger"
                    title="Lưu trữ cấu hình"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                <button onClick={() => handleEditConfig(config)} className="btn-icon" style={{ color: 'var(--primary)', borderColor: 'var(--primary)' }} title={config.config_status === 'not_configured' ? 'Tạo cấu hình' : 'Chỉnh sửa'}>
                  {config.config_status === 'not_configured' ? <Plus size={18} /> : <Edit2 size={18} />}
                </button>
              </div>

            </div>

            <div className="card-body">
              <PriceBox 
                label="Giá mở cửa" value={config.base_price ?? 0}
                editing={false}
                unit="đ"
              />
              <PriceBox 
                label="Giá tối thiểu" value={config.min_fare ?? 0}
                editing={false}
                unit="đ"
              />
              <PriceBox 
                label="Giá / km" value={config.distance_rate ?? 0}
                editing={false}
                unit="đ"
              />
              <PriceBox 
                label="Giá / phút" value={config.time_rate ?? 0}
                editing={false}
                unit="đ"
              />
              <PriceBox 
                label="Hệ số Surge" value={config.surge_multiplier ?? 1}
                editing={false}
                unit="x"
              />
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`status-tag ${CONFIG_STATUS_META[config.config_status]?.tone || ''}`}>
                {CONFIG_STATUS_META[config.config_status]?.label || (config.is_active ? 'Đang hoạt động' : 'Đã lưu trữ')}
              </span>
              {!config.is_bookable && (
                <span className="status-tag status-tag-blocked">
                  Không thể đặt chuyến
                </span>
              )}
              {Array.isArray(config.service_scopes) && config.service_scopes.length > 0 && (
                <span className="scope-chip">
                  {config.service_scopes.join(' • ')}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="surge-section glass" style={{ marginBottom: '2rem' }}>
        <div className="section-header">
          <h3>Danh mục phương tiện</h3>
          <button className="btn-premium" onClick={handleCreateVehicleType}>
            <Plus size={18} /> Thêm phương tiện
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tên phương tiện</th>
                <th>Mã</th>
                <th>Sức chứa</th>
                <th>Dịch vụ</th>
                <th>Trạng thái</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {vehicleTypes.map((type) => (
                <tr key={type.id}>
                  <td style={{ fontWeight: 700 }}>{type.name_vi}</td>
                  <td>{type.code}</td>
                  <td>{type.capacity}</td>
                  <td>
                    <div className="badge-list">
                      {(type.service_scopes || []).map((scope) => (
                        <span key={scope} className="mini-badge">{scope}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`status-tag ${type.is_active ? 'active' : 'inactive'}`}>
                      {type.is_active ? 'Đang dùng' : 'Đã lưu trữ'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn-action btn-action-edit" onClick={() => handleEditVehicleType(type)}>
                        <Edit2 size={16} /> Sửa
                      </button>
                      <button className="btn-action btn-action-danger" onClick={() => handleDeleteVehicleType(type)}>
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
                service_type: SCHEDULED_PRICING_SERVICE_OPTIONS[0]?.id ?? 6,
                ride_mode: 'shared',
                vehicle_type_id: 2,
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
                    <td style={{ fontWeight: 600 }}>{SCHEDULED_PRICING_SERVICE_LABEL_MAP[Number(rule.service_type)] || `Dịch vụ #${rule.service_type}`}</td>
                    <td>{SCHEDULED_RIDE_MODE_LABEL_MAP[rule.ride_mode] || rule.ride_mode}</td>
                    <td>{VEHICLE_INFO[rule.vehicle_type_id ?? rule.vehicle_type]?.name}</td>
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
                      {SCHEDULED_PRICING_SERVICE_OPTIONS.map((service) => (
                        <option key={service.id} value={service.id}>{service.label} ({service.id})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Hình thức đi</label>
                    <select className="form-select" value={editRuleForm.ride_mode} onChange={e => setEditRuleForm({...editRuleForm, ride_mode: e.target.value})}>
                      {SCHEDULED_RIDE_MODE_OPTIONS.map((mode) => (
                        <option key={mode.id} value={mode.id}>{mode.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Loại xe</label>
                    <select className="form-select" value={editRuleForm.vehicle_type_id ?? editRuleForm.vehicle_type ?? ''} onChange={e => setEditRuleForm({...editRuleForm, vehicle_type_id: e.target.value})}>
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

      {showConfigModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px', width: '90%' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{editingConfigId ? 'Chỉnh sửa cấu hình giá' : 'Thêm cấu hình giá'}</h3>
              <button className="btn-icon" onClick={() => setShowConfigModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Loại xe</label>
                <select
                  value={configForm.vehicleTypeId}
                  disabled={!!editingConfigId}
                  onChange={(e) => setConfigForm({ ...configForm, vehicleTypeId: Number(e.target.value) })}
                >
                  {configs.map(cfg => (
                    <option key={cfg.vehicle_type_id} value={cfg.vehicle_type_id}>
                      {cfg.vehicle_label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Giá mở cửa</label>
                  <input type="number" min="0" value={configForm.basePrice} onChange={(e) => setConfigForm({ ...configForm, basePrice: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Giá tối thiểu</label>
                  <input type="number" min="0" value={configForm.minFare} onChange={(e) => setConfigForm({ ...configForm, minFare: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Giá / km</label>
                  <input type="number" min="0" value={configForm.distanceRate} onChange={(e) => setConfigForm({ ...configForm, distanceRate: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Giá / phút</label>
                  <input type="number" min="0" value={configForm.timeRate} onChange={(e) => setConfigForm({ ...configForm, timeRate: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Hệ số surge</label>
                  <input type="number" min="0" step="0.1" value={configForm.surgeMultiplier} onChange={(e) => setConfigForm({ ...configForm, surgeMultiplier: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Tỷ lệ hoa hồng</label>
                  <input type="number" min="0" max="100" step="0.1" value={configForm.commissionRate} onChange={(e) => setConfigForm({ ...configForm, commissionRate: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" checked={configForm.isActive} onChange={(e) => setConfigForm({ ...configForm, isActive: e.target.checked })} />
                  Kích hoạt cấu hình ngay sau khi lưu
                </label>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowConfigModal(false)} className="btn glass" style={{ color: 'var(--text)' }}>Hủy</button>
                <button type="button" onClick={handleSaveConfig} className="btn-premium">
                  <Save size={18} /> Lưu cấu hình
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVehicleTypeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', width: '92%' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>{editingVehicleTypeId ? 'Chỉnh sửa phương tiện' : 'Thêm phương tiện mới'}</h3>
              <button className="btn-icon" onClick={() => setShowVehicleTypeModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Tên phương tiện</label>
                  <input value={vehicleTypeForm.name_vi} onChange={(e) => setVehicleTypeForm({ ...vehicleTypeForm, name_vi: e.target.value })} placeholder="Ví dụ: Xe điện 4 chỗ" />
                </div>
                <div className="form-group">
                  <label>Mã phương tiện</label>
                  <input value={vehicleTypeForm.code} onChange={(e) => setVehicleTypeForm({ ...vehicleTypeForm, code: e.target.value })} placeholder="Ví dụ: ev_car_4" />
                </div>
                <div className="form-group">
                  <label>Sức chứa</label>
                  <input type="number" min="1" value={vehicleTypeForm.capacity} onChange={(e) => setVehicleTypeForm({ ...vehicleTypeForm, capacity: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Thời gian chờ ước tính</label>
                  <input value={vehicleTypeForm.estimated_wait_time} onChange={(e) => setVehicleTypeForm({ ...vehicleTypeForm, estimated_wait_time: e.target.value })} placeholder="Ví dụ: 3-5 phút" />
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <input value={vehicleTypeForm.description_vi} onChange={(e) => setVehicleTypeForm({ ...vehicleTypeForm, description_vi: e.target.value })} placeholder="Mô tả ngắn cho phương tiện" />
              </div>
              <div className="form-group">
                <label>Scope dịch vụ</label>
                <div className="conditions-grid">
                  {SERVICE_SCOPE_OPTIONS.map((scope) => (
                    <label key={scope.id} className="cond-checkbox">
                      <input
                        type="checkbox"
                        checked={vehicleTypeForm.service_scopes.includes(scope.id)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...vehicleTypeForm.service_scopes, scope.id]
                            : vehicleTypeForm.service_scopes.filter((item) => item !== scope.id);
                          setVehicleTypeForm({ ...vehicleTypeForm, service_scopes: next });
                        }}
                      />
                      <span>{scope.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Thứ tự hiển thị</label>
                  <input type="number" min="0" value={vehicleTypeForm.sort_order} onChange={(e) => setVehicleTypeForm({ ...vehicleTypeForm, sort_order: e.target.value })} />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={vehicleTypeForm.is_bookable} onChange={(e) => setVehicleTypeForm({ ...vehicleTypeForm, is_bookable: e.target.checked })} />
                    Cho phép đặt chuyến
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" checked={vehicleTypeForm.is_active} onChange={(e) => setVehicleTypeForm({ ...vehicleTypeForm, is_active: e.target.checked })} />
                    Kích hoạt phương tiện
                  </label>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowVehicleTypeModal(false)} className="btn glass" style={{ color: 'var(--text)' }}>Hủy</button>
                <button type="button" onClick={handleSaveVehicleType} className="btn-premium">
                  <Save size={18} /> Lưu phương tiện
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .pricing-page { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .header-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem; }
        .main-title { font-size: 1.75rem; font-weight: 800; color: var(--text); }

        .pricing-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
          margin-bottom: 1.75rem;
        }
        .summary-card {
          padding: 1rem 1.2rem;
          border-radius: 18px;
          background: var(--card);
          border: 1px solid var(--border);
        }
        .summary-label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 0.35rem;
          font-weight: 700;
        }
        .summary-value {
          font-size: 1.65rem;
          color: var(--text);
          font-weight: 800;
        }

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

        .price-card { padding: 1.5rem; border-radius: 20px; transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s; background: var(--card); border: 1px solid transparent; }
        .price-card:hover { transform: translateY(-5px); }
        .price-card.config-status-configured { border-color: rgba(0, 144, 106, 0.24); box-shadow: 0 18px 45px rgba(0, 144, 106, 0.08); }
        .price-card.config-status-inactive { border-color: rgba(245, 158, 11, 0.24); box-shadow: 0 18px 45px rgba(245, 158, 11, 0.08); }
        .price-card.config-status-not_configured { border-color: rgba(239, 68, 68, 0.22); box-shadow: 0 18px 45px rgba(239, 68, 68, 0.08); }
        
        .card-top { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .icon-badge { width: 48px; height: 48px; border-radius: 12px; background: rgba(99, 102, 241, 0.1); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .title-box { flex: 1; min-width: 0; }
        .title-box h3 { font-size: 1rem; font-weight: 700; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .title-box p { font-size: 0.78rem; color: var(--text-muted); margin: 0.2rem 0 0; line-height: 1.45; }
        
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
        .btn-icon-danger { color: var(--error); border-color: rgba(239, 68, 68, 0.3); }
        .btn-icon-danger:hover { border-color: var(--error); color: var(--error); background: rgba(239, 68, 68, 0.08); }
        
        .badge-list { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .mini-badge { font-size: 0.75rem; padding: 0.2rem 0.5rem; background: var(--bg-soft); border-radius: 6px; display: flex; align-items: center; gap: 0.25rem; }
        .multiplier-text { font-weight: 800; color: var(--warning); font-size: 1.1rem; }
        
        .status-tag { padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .status-tag.active { background: rgba(0, 144, 106, 0.1); color: #00906a; }
        .status-tag.inactive { background: rgba(245, 158, 11, 0.12); color: #b45309; }
        .status-tag.draft { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
        .status-tag-blocked { background: rgba(239,68,68,0.1); color: var(--error); }
        .scope-chip {
          padding: 0.28rem 0.7rem;
          border-radius: 999px;
          font-size: 0.72rem;
          font-weight: 700;
          background: var(--bg-soft);
          color: var(--text-muted);
          border: 1px solid var(--border);
        }

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
          .pricing-summary { grid-template-columns: 1fr; }
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
