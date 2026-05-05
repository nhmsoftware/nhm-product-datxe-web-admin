import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Car, Settings, LogOut, Package, Banknote } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Users size={20} />, label: 'Khách hàng', path: '/customers' },
    { icon: <Car size={20} />, label: 'Tài xế', path: '/drivers' },
    { icon: <Package size={20} />, label: 'Dịch vụ', path: '/services' },
    { icon: <Banknote size={20} />, label: 'Cấu hình giá', path: '/pricing' },
    { icon: <Settings size={20} />, label: 'Cài đặt', path: '/settings' },
  ];

  return (
    <aside className="sidebar glass" style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      borderRadius: '0 24px 24px 0'
    }}>
      <div className="logo" style={{
        padding: '0 1rem 3rem',
        fontSize: '1.5rem',
        fontWeight: 800,
        color: 'var(--primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'var(--primary)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>NHM</div>
        <span>DATXE</span>
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              color: isActive ? 'white' : 'var(--text-muted)',
              textDecoration: 'none',
              borderRadius: '12px',
              marginBottom: '0.5rem',
              background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
              transition: 'var(--transition)'
            })}
          >
            {item.icon}
            <span style={{ fontWeight: 500 }}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="btn-logout" style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        color: '#ef4444',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 600
      }}>
        <LogOut size={20} />
        Thoát
      </button>
    </aside>
  );
};

export default Sidebar;
