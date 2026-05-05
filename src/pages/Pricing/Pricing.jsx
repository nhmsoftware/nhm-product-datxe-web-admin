import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { 
  Car, Save, Edit2, X, Plus, Trash2, Clock, 
  CloudRain, TrendingUp, Users, Monitor, RefreshCw,
  Bike, Bus, CarFront
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';

const Pricing = () => {
  const [configs, setConfigs] = useState([]);
  const [isFreeMode, setIsFreeMode] = useState(false);
  const [surgeRules, setSurgeRules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho việc sửa giá cố định
  const [editingConfigId, setEditingConfigId] = useState(null);
  const [configForm, setConfigForm] = useState({
    vehicleType: 0,
    basePrice: 0,
    distanceRate: 0,
    timeRate: 0,
    minFare: 0,
    surgeMultiplier: 1,
    commissionRate: 0
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
      const [configRes, surgeRes] = await Promise.all([
        adminService.getPricingConfigs(),
        adminService.getSurgeRules()
      ]);
      setConfigs(configRes.data.configs);
      setIsFreeMode(configRes.data.is_free_mode);
      setSurgeRules(surgeRes.data);
    } catch (error) {
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
      commissionRate: config.commission_rate
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
        commission_rate: configForm.commissionRate
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
      confirmButtonColor: '#6366f1',
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

  const VEHICLE_INFO = {
    1: { name: 'Xe máy (Bike)', icon: <Bike size={22} />, color: '#6366f1' },
    2: { name: 'Ô tô 4 chỗ (Car 4)', icon: <Car size={22} />, color: '#10b981' },
    3: { name: 'Ô tô 7 chỗ (Car 7)', icon: <CarFront size={22} />, color: '#f59e0b' },
    4: { name: 'Ô tô 9 chỗ (Car 9)', icon: <Bus size={22} />, color: '#ef4444' },
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
              <div className="actions">
                {editingConfigId === config.vehicle_type ? (
                  <div className="edit-actions">
                    <button onClick={handleSaveConfig} className="btn-icon save"><Save size={18} /></button>
                    <button onClick={() => setEditingConfigId(null)} className="btn-icon cancel"><X size={18} /></button>
                  </div>
                ) : (
                  <div className="actions">
                    <button onClick={() => handleResetConfig(config.vehicle_type)} className="btn-icon reset" title="Khôi phục mặc định"><RefreshCw size={18} /></button>
                    <button onClick={() => handleEditConfig(config)} className="btn-icon edit"><Edit2 size={18} /></button>
                  </div>
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
              <PriceBox 
                label="Hoa hồng" value={config.commission_rate} 
                editing={editingConfigId === config.vehicle_type}
                editValue={configForm.commissionRate}
                onChange={val => setConfigForm({...configForm, commissionRate: val})}
                unit="%"
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
                    <button className="btn-icon" onClick={() => { setEditSurgeRule({...rule, rule_id: rule.id}); setShowSurgeModal(true); }}><Edit2 size={16} /></button>
                    <button className="btn-icon danger" onClick={async () => { 
                       const delRes = await Swal.fire({
                          title: 'Xác nhận xóa?',
                          text: "Hành động này không thể hoàn tác!",
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonColor: '#ef4444',
                          confirmButtonText: 'Xóa ngay',
                          background: document.body.className.includes('dark') ? '#1e293b' : '#fff',
                          color: document.body.className.includes('dark') ? '#fff' : '#000',
                       });
                       if(delRes.isConfirmed) { 
                          await adminService.deleteSurgeRule(rule.id); 
                          fetchData(); 
                          toast.success('Đã xóa quy tắc!');
                       } 
                    }}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showSurgeModal && (
        <div className="modal-overlay" onClick={(e) => {
          if (e.target.className === 'modal-overlay') setShowSurgeModal(false);
        }}>
          <div className="modal-content glass">
            <h3>{editSurgeRule.rule_id ? 'Chỉnh sửa quy tắc' : 'Thêm mới quy tắc'}</h3>
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

              <div className="form-row">
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

              <div className="modal-footer">
                <button type="button" onClick={() => setShowSurgeModal(false)} className="btn-cancel-text">Hủy</button>
                <button type="submit" className="btn-premium">Lưu cấu hình</button>
              </div>
            </form>
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
        .icon-badge { width: 48px; height: 48px; border-radius: 12px; background: rgba(99, 102, 241, 0.1); display: flex; align-items: center; justify-content: center; }
        .title-box h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
        .title-box p { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
        
        .actions { margin-left: auto; display: flex; gap: 0.5rem; }
        .btn-edit, .btn-save, .btn-cancel { border: none; background: var(--bg-soft); color: var(--text-muted); padding: 0.5rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .btn-edit:hover { color: var(--primary); background: rgba(99, 102, 241, 0.1); }
        .btn-save:hover { color: var(--success); background: rgba(16, 185, 129, 0.1); }

        .card-body { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
        .price-item { padding: 0.75rem; background: var(--bg-soft); border-radius: 12px; border: 1px solid var(--border); }
        .price-item label { display: block; font-size: 0.65rem; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.25rem; font-weight: 600; }
        .price-item .val { font-size: 1.1rem; font-weight: 700; }
        .price-item .unit { font-size: 0.8rem; color: var(--text-muted); margin-left: 2px; }

        .surge-section { padding: 2rem; border-radius: 24px; background: var(--card); }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        
        .badge-list { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .mini-badge { font-size: 0.75rem; padding: 0.2rem 0.5rem; background: var(--bg-soft); border-radius: 6px; display: flex; align-items: center; gap: 0.25rem; }
        .multiplier-text { font-weight: 800; color: var(--warning); font-size: 1.1rem; }
        
        .status-tag { padding: 0.25rem 0.6rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; background: rgba(239, 68, 68, 0.1); color: var(--error); }
        .status-tag.active { background: rgba(16, 185, 129, 0.1); color: var(--success); }

        .btn-icon { border: 1px solid var(--border); background: transparent; padding: 0.4rem; border-radius: 8px; color: var(--text-muted); cursor: pointer; margin-left: 0.4rem; }
        .btn-icon:hover { color: var(--primary); border-color: var(--primary); }
        .btn-icon.danger:hover { color: var(--error); border-color: var(--error); }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-content { width: 100%; max-width: 500px; padding: 2.5rem; border-radius: 24px; background: var(--card); max-height: 90vh; overflow-y: auto; }
        .conditions-grid { display: flex; flex-wrap: wrap; gap: 0.75rem; background: var(--bg-soft); padding: 1rem; border-radius: 12px; border: 1px solid var(--border); }
        .cond-checkbox { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem; padding: 0.25rem 0.5rem; border-radius: 6px; transition: background 0.2s; }
        .cond-checkbox:hover { background: rgba(99, 102, 241, 0.1); }
        .cond-checkbox input { width: auto; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--text-muted); }
        .form-group select, .form-group input { width: 100%; padding: 0.75rem; border-radius: 10px; border: 1px solid var(--border); background: var(--bg); color: var(--text); outline: none; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1.5rem; margin-top: 2rem; }
        .btn-cancel-text { background: transparent; border: none; color: var(--text-muted); font-weight: 600; cursor: pointer; }

        @media (max-width: 640px) {
          .pricing-grid { grid-template-columns: 1fr; }
          .card-body { grid-template-columns: 1fr; }
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
