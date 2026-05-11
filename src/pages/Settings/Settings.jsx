import React from 'react';
import { Settings as SettingsIcon, Bell, Shield, Smartphone, Globe } from 'lucide-react';

const Settings = () => {
  const settingGroups = [
    { icon: <Globe size={20} />, title: 'Cài đặt chung', desc: 'Ngôn ngữ, múi giờ và cấu hình cơ bản' },
    { icon: <Bell size={20} />, title: 'Thông báo', desc: 'Quản lý thông báo đẩy và email' },
    { icon: <Shield size={20} />, title: 'Bảo mật', desc: 'Đổi mật khẩu và phân quyền' },
    { icon: <Smartphone size={20} />, title: 'Thiết bị', desc: 'Quản lý các thiết bị đã đăng nhập' },
  ];

  return (
    <div className="settings-page">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Cài đặt hệ thống</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Tùy chỉnh các tham số hoạt động của ứng dụng.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {settingGroups.map((group, index) => (
          <div key={index} className="glass glass-hover" style={{ padding: '1.5rem', borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'rgba(99, 102, 241, 0.1)', 
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {group.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{group.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{group.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ marginTop: '2rem', padding: '2rem', borderRadius: '24px' }}>
        <div className="empty-state">
          <SettingsIcon size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3>Những cài đặt trong trang này sẽ áp dụng cho toàn bộ hệ thống.</h3>
          <p>Các tính năng cài đặt chi tiết sẽ sớm được cập nhật.</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
