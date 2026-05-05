import React, { useState, useEffect } from 'react';
import { Bell, Search, User, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const [theme, setTheme] = useState(localStorage.getItem('admin_theme') || 'light');

  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="navbar-glass">
      <div className="search-bar">
        <Search size={18} className="search-icon" />
        <input type="text" placeholder="Tìm kiếm nhanh..." />
      </div>

      <div className="user-actions">
        {/* Nút chuyển đổi Theme */}
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="notification-icon">
          <Bell size={22} />
          <span className="unread-dot"></span>
        </div>
        
        <div className="profile">
          <div className="avatar-box">
            <User size={20} color="white" />
          </div>
          <div className="user-info">
            <div className="name">System Admin</div>
            <div className="role">Admin Role</div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .navbar-glass {
          padding: 0.75rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
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

        .profile {
          display: flex; align-items: center; gap: 0.75rem;
          cursor: pointer; padding: 0.25rem 0.5rem;
          border-radius: 12px; transition: var(--transition);
        }
        .profile:hover { background: var(--bg-soft); }

        .avatar-box {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--primary), #a855f7);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }

        .user-info .name { font-size: 0.875rem; font-weight: 600; color: var(--text); }
        .user-info .role { font-size: 0.75rem; color: var(--text-muted); }

        @media (max-width: 768px) {
          .search-bar { display: none; }
          .navbar-glass { padding: 0.75rem 1rem; }
        }
      `}} />
    </header>
  );
};

export default Navbar;
