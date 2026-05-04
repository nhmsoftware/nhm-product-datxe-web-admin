import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="glass" style={{
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '2rem',
      borderRadius: '16px'
    }}>
      <div className="search-bar" style={{
        position: 'relative',
        width: '400px'
      }}>
        <Search size={18} style={{
          position: 'absolute',
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)'
        }} />
        <input 
          type="text" 
          placeholder="Tìm kiếm nhanh..." 
          style={{
            width: '100%',
            padding: '0.75rem 1rem 0.75rem 2.5rem',
            background: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            color: 'white',
            outline: 'none'
          }}
        />
      </div>

      <div className="user-actions" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={22} color="var(--text-muted)" />
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '8px',
            height: '8px',
            background: 'var(--error)',
            borderRadius: '50%',
            border: '2px solid var(--bg-dark)'
          }}></span>
        </div>
        
        <div className="profile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '12px',
          transition: 'var(--transition)'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, var(--primary), #a855f7)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>System Admin</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin Role</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
