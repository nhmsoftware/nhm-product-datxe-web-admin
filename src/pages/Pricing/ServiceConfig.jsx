import React, { useState, useEffect } from 'react';
import { 
  Save, ShieldCheck, Zap, Info, ChevronRight, Car, 
  UserCheck, Globe, Banknote, Power, Settings2, Trash2, Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ServiceConfig = ({ title, type }) => {
  const [active, setActive] = useState(true);
  const [priorityHouse, setPriorityHouse] = useState(true);
  
  // Pricing state for different vehicle types
  const [pricing, setPricing] = useState([
    { id: 1, vehicle: 'Xe 4 chỗ (Economy)', base_price: 50000, price_per_km: 12000, wait_fee: 1000 },
    { id: 2, vehicle: 'Xe 7 chỗ (Premium)', base_price: 70000, price_per_km: 15000, wait_fee: 1500 }
  ]);

  const handleUpdatePrice = (id, field, value) => {
    setPricing(prev => prev.map(p => p.id === id ? { ...p, [field]: parseInt(value) || 0 } : p));
  };

  const handleSave = () => {
    toast.success(`Đã lưu cấu hình riêng cho ${title}`);
  };

  return (
    <div className="service-config-page">
      <div style={{ marginBottom: '3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', marginBottom: '0.75rem', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Settings2 size={18} />
            Cấu hình chuyên sâu
          </div>
          <h1 className="page-title" style={{ fontSize: '2.5rem', fontWeight: 800 }}>{title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', marginTop: '0.5rem' }}>Thiết lập giá cước và cơ chế vận hành đặc thù cho dịch vụ này.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={active ? 'btn-success-rect' : 'btn-danger-rect'} 
            onClick={() => setActive(!active)}
            style={{ padding: '14px 24px' }}
          >
            <Power size={20} /> {active ? 'Dịch vụ đang Bật' : 'Dịch vụ đang Tắt'}
          </button>
          <button className="btn-primary-rect" style={{ padding: '14px 32px' }} onClick={handleSave}>
            <Save size={20} /> Lưu thay đổi
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2.5rem' }}>
        {/* Left Column: Dispatch Logic */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div className="stat-icon-box primary">
                <Zap size={24} />
              </div>
              <div>
                <h3 style={{ fontWeight: 800, fontSize: '1.5rem' }}>Chiến lược Điều phối</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Cách hệ thống phân bổ chuyến xe cho tài xế.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div 
                className="config-option" 
                style={{ 
                  padding: '1.75rem', 
                  borderRadius: '18px', 
                  border: '2px solid',
                  borderColor: priorityHouse ? 'var(--primary)' : 'var(--border-color)',
                  background: priorityHouse ? 'var(--primary-soft)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onClick={() => setPriorityHouse(true)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <UserCheck size={28} color={priorityHouse ? 'var(--primary)' : 'var(--text-muted)'} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: priorityHouse ? 'var(--primary)' : 'var(--text-main)' }}>Ưu tiên Đội xe nhà</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>Bảo vệ quyền lợi xe nhà, chỉ công khai khi không có xe nhà nhận.</div>
                    </div>
                  </div>
                  {priorityHouse && <ShieldCheck size={24} color="var(--primary)" />}
                </div>
              </div>

              <div 
                className="config-option" 
                style={{ 
                  padding: '1.75rem', 
                  borderRadius: '18px', 
                  border: '2px solid',
                  borderColor: !priorityHouse ? 'var(--success)' : 'var(--border-color)',
                  background: !priorityHouse ? 'var(--success-soft)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onClick={() => setPriorityHouse(false)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <Globe size={28} color={!priorityHouse ? 'var(--success)' : 'var(--text-muted)'} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: !priorityHouse ? 'var(--success)' : 'var(--text-main)' }}>Thả đơn Công khai</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '4px' }}>Tất cả tài xế trong khu vực đều nhận được thông báo đồng thời.</div>
                    </div>
                  </div>
                  {!priorityHouse && <ShieldCheck size={24} color="var(--success)" />}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem', background: 'var(--bg-light)', borderStyle: 'dashed' }}>
             <div style={{ display: 'flex', gap: '1rem' }}>
                <Info size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
                <div>
                   <h4 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Thông tin quan trọng</h4>
                   <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                     Mỗi loại dịch vụ ({title}) có thể có cấu hình giá và cơ chế điều phối hoàn toàn khác nhau. Dữ liệu này sẽ được áp dụng ngay khi bạn nhấn <b>Lưu thay đổi</b>.
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Detailed Pricing per Vehicle */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div className="stat-icon-box warning">
                <Banknote size={24} />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1.5rem' }}>Cấu hình Giá theo Xe</h3>
            </div>
            <button className="btn-icon-rect" title="Thêm loại xe"><Plus size={20} /></button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {pricing.map((p) => (
              <div key={p.id} style={{ paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Car size={20} color="var(--primary)" />
                    <span style={{ fontWeight: 800, fontSize: '1.125rem' }}>{p.vehicle}</span>
                  </div>
                  <button className="btn-icon-rect" style={{ border: 'none', color: 'var(--danger)' }}><Trash2 size={18} /></button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Giá mở cửa (VND)</label>
                    <input 
                      className="input-field"
                      type="number" 
                      value={p.base_price} 
                      onChange={(e) => handleUpdatePrice(p.id, 'base_price', e.target.value)} 
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Giá / KM (VND)</label>
                    <input 
                      className="input-field"
                      type="number" 
                      value={p.price_per_km} 
                      onChange={(e) => handleUpdatePrice(p.id, 'price_per_km', e.target.value)} 
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phí chờ mỗi phút (VND)</label>
                    <input 
                      className="input-field"
                      type="number" 
                      value={p.wait_fee} 
                      onChange={(e) => handleUpdatePrice(p.id, 'wait_fee', e.target.value)} 
                      style={{ fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceConfig;
