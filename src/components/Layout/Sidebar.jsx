import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Car, Settings, LogOut, Package, Banknote, ClipboardCheck, Ticket, ShieldAlert, Gavel } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Users size={20} />, label: 'Khách hàng', path: '/customers' },
    { icon: <Car size={20} />, label: 'Tài xế', path: '/drivers' },
    { icon: <Ticket size={20} />, label: 'Vouchers', path: '/vouchers' },
    { icon: <Package size={20} />, label: 'Dịch vụ', path: '/services' },
    { icon: <Banknote size={20} />, label: 'Cấu hình giá', path: '/pricing' },
    { icon: <ShieldAlert size={20} />, label: 'Chống gian lận', path: '/risk/anti-fraud' },
    { icon: <Gavel size={20} />, label: 'Quy tắc xử phạt', path: '/risk/penalty-rules' },
    { icon: <Settings size={20} />, label: 'Cài đặt', path: '/settings' },

  ];


  return (
    <aside className="sidebar glass">

      <div className="logo" style={{
        padding: '0.5rem 1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img src="/logo.jpg" alt="Logo" style={{ 
          width: '100%', 
          maxWidth: '160px', 
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }} />
      </div>

      <nav style={{ flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end
            className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}
          >

            {item.icon}
            <span style={{ fontWeight: 600 }}>{item.label}</span>
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
