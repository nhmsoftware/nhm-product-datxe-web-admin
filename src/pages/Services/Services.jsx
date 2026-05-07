import React from 'react';
import { Package, Search, Plus } from 'lucide-react';

const Services = () => {
  return (
    <div className="services-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Quản lý Dịch vụ</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Danh sách các dịch vụ vận chuyển hiện có trên hệ thống.</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={18} /> Thêm dịch vụ
        </button>
      </div>

      <div className="glass" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm dịch vụ..." 
            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)', outline: 'none' }}
          />
        </div>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
        <div className="empty-state">
          <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>Chưa có dữ liệu dịch vụ</h3>
          <p>Hệ thống hiện chưa có thông tin dịch vụ nào được cấu hình.</p>
        </div>
      </div>
    </div>
  );
};

export default Services;
