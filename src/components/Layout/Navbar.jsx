import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Sun, Moon, LogOut } from 'lucide-react';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [theme, setTheme] = useState(localStorage.getItem('admin_theme') || 'light');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <header className="navbar-glass">
      {/* Search bar removed per request */}

      <div className="user-actions">
        {/* Nút chuyển đổi Theme */}
        <button className="theme-toggle-btn" onClick={toggleTheme} title="Chế độ sáng/tối">
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="notification-icon">
          <Bell size={22} />
          <span className="unread-dot"></span>
        </div>
        
        <div className="profile-group">
          <div className="profile">
            <div className="avatar-box">
              <User size={20} color="white" />
            </div>
            <div className="user-info">
              <div className="name">{user?.full_name || 'Quản trị hệ thống'}</div>
              <div className="role">{user?.role_name || 'Quản trị viên'}</div>
            </div>
          </div>
          
          <button className="logout-btn" onClick={handleLogout} title="Đăng xuất">
            <LogOut size={20} />
          </button>
        </div>
      </div>


      <style dangerouslySetInnerHTML={{ __html: `
        .navbar-glass {
          padding: 0.75rem 2rem;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          margin-bottom: 2rem;
          background: var(--glass);
          backdrop-filter: blur(12px);
          border-radius: 16px;
          border: 1px solid var(--border);
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: var(--transition);
        }

        .search-bar { position: relative; width: 350px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .search-bar input {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.5rem;
          background: var(--bg-soft);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          outline: none;
        }

        .user-actions { display: flex; align-items: center; gap: 1.25rem; }

        .theme-toggle-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .theme-toggle-btn:hover { background: var(--bg-soft); transform: rotate(15deg); }

        .notification-icon { position: relative; cursor: pointer; color: var(--text-muted); padding: 5px; }
        .unread-dot {
          position: absolute; top: 5px; right: 5px;
          width: 8px; height: 8px;
          background: var(--error);
          border-radius: 50%;
          border: 2px solid var(--bg);
        }

        .profile-group {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-left: 1rem;
          border-left: 1px solid var(--border);
        }

        .profile {
          display: flex; align-items: center; gap: 0.75rem;
          cursor: pointer; padding: 0.25rem 0.5rem;
          border-radius: 12px; transition: var(--transition);
        }
        .profile:hover { background: var(--bg-soft); }

        .avatar-box {
          width: 36px; height: 36px;
          background: var(--primary);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }

        .user-info .name { font-size: 0.875rem; font-weight: 600; color: var(--text); }
        .user-info .role { font-size: 0.75rem; color: var(--text-muted); }

        .logout-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: var(--error);
          color: white;
          border-color: var(--error);
          transform: translateY(-2px);
        }


        @media (max-width: 768px) {
          .search-bar { display: none; }
          .navbar-glass { padding: 0.75rem 1rem; }
        }
      `}} />
    </header>
  );
};

export default Navbar;
