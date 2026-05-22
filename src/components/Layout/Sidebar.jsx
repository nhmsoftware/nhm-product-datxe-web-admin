import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Car, Settings, LogOut, Package, Banknote, ClipboardCheck, Ticket, ShieldAlert, Gavel, XCircle, Store, MessageSquare, Undo2, AlertTriangle, Landmark, Megaphone, Newspaper } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Bảng điều khiển', path: '/' },
    { icon: <ClipboardCheck size={20} />, label: 'Quản lý chuyến xe', path: '/rides/scheduled' },
    { icon: <Package size={20} />, label: 'Quản lý Dịch vụ', path: '/services' },
    { icon: <Car size={20} />, label: 'Quản lý Lái hộ', path: '/chauffeur/rides' },
    { icon: <Users size={20} />, label: 'Khách hàng', path: '/customers' },
    { icon: <Car size={20} />, label: 'Tài xế', path: '/drivers' },
    { icon: <Store size={20} />, label: 'Nhà hàng', path: '/merchants' },
    { icon: <Megaphone size={20} />, label: 'Quản lý Banners', path: '/marketing/banners' },
    { icon: <Newspaper size={20} />, label: 'Quản lý Tin tức', path: '/marketing/news' },
    { icon: <Ticket size={20} />, label: 'Mã giảm giá', path: '/vouchers' },
    { icon: <Banknote size={20} />, label: 'Cấu hình giá', path: '/pricing' },
    { icon: <Landmark size={20} />, label: 'Tài chính tài xế', path: '/finance/driver-summary' },
    { icon: <Banknote size={20} />, label: 'Cấu hình hoa hồng', path: '/finance/commissions' },
    { icon: <MessageSquare size={20} />, label: 'Khiếu nại', path: '/operations/complaints' },
    { icon: <Undo2 size={20} />, label: 'Hoàn tiền', path: '/operations/refunds' },
    { icon: <AlertTriangle size={20} />, label: 'Vi phạm & Cảnh báo', path: '/operations/violations' },
    { icon: <ShieldAlert size={20} />, label: 'Chống gian lận', path: '/risk/anti-fraud' },
    { icon: <Gavel size={20} />, label: 'Quy tắc xử phạt', path: '/risk/penalty-rules' },
    { icon: <XCircle size={20} />, label: 'Phí hủy chuyến', path: '/risk/cancellation-configs' },
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
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" style={{
          width: '100%', 
          maxWidth: '160px', 
          height: 'auto'
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
