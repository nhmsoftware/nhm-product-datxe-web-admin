import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Save, 
  RefreshCcw, 
  ShieldCheck, 
  AlertCircle, 
  Info,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CreditWalletConfig = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    min_balance: 50000,
    auto_lock: true,
    commission_rule: ''
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/admin/finance/credit-wallet-config');
      if (response.data.success) {
        setConfig(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching credit wallet config:', error);
      toast.error('Không thể tải cấu hình ví tín dụng');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (config.min_balance <= 0) {
      toast.error('Minimum Credit Balance không hợp lệ.');
      return;
    }

    try {
      setSaving(true);
      const response = await api.post('/v1/admin/finance/credit-wallet-config', config);
      if (response.data.success) {
        toast.success('Cấu hình Credit Wallet thành công.');
        setConfig(response.data.data);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Không thể cập nhật Credit Wallet Configuration.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <RefreshCcw className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="finance-config-page" style={{ padding: '2rem', maxWidth: '800px' }}>
      <header style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button 
          onClick={() => navigate('/finance/driver-summary')} 
          className="btn-icon animate-pulse" 
          style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: '14px', 
            border: '1.5px solid var(--border)', 
            background: 'var(--card)', 
            color: 'var(--text)', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            transition: 'var(--transition)',
            boxShadow: 'var(--shadow)'
          }}
          title="Quay lại Quản lý Tài chính"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Cấu hình Ví Tín Dụng</h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
            Thiết lập các quy tắc cho tài xế đối tác (Partner/Freelance). 
            Tài xế nội bộ (Internal Fleet) sẽ bỏ qua các quy tắc này.
          </p>
        </div>
      </header>

      <div className="glass" style={{ padding: '2.5rem', borderRadius: '32px' }}>
        <form onSubmit={handleSave}>
          {/* Minimum Balance */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem' }}>
              Số dư tối thiểu (Minimum Credit Balance)
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number"
                className="btn-glass"
                style={{ 
                  width: '100%', 
                  padding: '1rem 1.5rem', 
                  borderRadius: '16px',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  outline: 'none',
                  border: '1px solid var(--border)'
                }}
                value={config.min_balance}
                onChange={(e) => setConfig({...config, min_balance: parseFloat(e.target.value)})}
                placeholder="Ví dụ: 50000"
                required
              />
              <span style={{ 
                position: 'absolute', 
                right: '1.5rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                fontWeight: 700,
                color: 'var(--text-muted)'
              }}>
                VND
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Info size={14} />
              Tài xế sẽ bị khóa nhận cuốc nếu số dư ví thấp hơn mức này.
            </p>
          </div>

          {/* Auto Lock Rule */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '1.25rem 1.5rem',
              background: 'var(--bg-soft)',
              borderRadius: '20px',
              border: '1px solid var(--border)'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Tự động khóa nhận cuốc (Auto Lock)</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Hệ thống tự động chuyển trạng thái "Dispatch Locked" khi hết tiền.
                </p>
              </div>
              <div 
                style={{ 
                  width: '60px', 
                  height: '32px', 
                  background: config.auto_lock ? 'var(--success)' : '#cbd5e1',
                  borderRadius: '20px',
                  padding: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  justifyContent: config.auto_lock ? 'flex-end' : 'flex-start'
                }}
                onClick={() => setConfig({...config, auto_lock: !config.auto_lock})}
              >
                <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
              </div>
            </div>
          </div>

          {/* Commission Deduction Rule */}
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem' }}>
              Quy tắc trừ hoa hồng (Commission Deduction Rule)
            </label>
            <textarea 
              className="btn-glass"
              style={{ 
                width: '100%', 
                padding: '1.25rem', 
                borderRadius: '16px',
                fontSize: '0.95rem',
                minHeight: '120px',
                outline: 'none',
                border: '1px solid var(--border)',
                lineHeight: 1.6
              }}
              value={config.commission_rule || ''}
              onChange={(e) => setConfig({...config, commission_rule: e.target.value})}
              placeholder="Mô tả quy tắc trừ tiền hoa hồng từ ví tín dụng..."
            />
          </div>

          {/* Summary Box */}
          <div style={{ 
            padding: '1.5rem', 
            background: 'rgba(0, 73, 172, 0.05)', 
            borderRadius: '20px', 
            border: '1px dashed var(--primary)',
            marginBottom: '2.5rem'
          }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                background: 'var(--primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white'
              }}>
                <ShieldCheck size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.25rem' }}>Kiểm soát Dispatch</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Khi lưu cấu hình này, hệ thống sẽ ngay lập tức áp dụng cho toàn bộ tài xế đối tác. 
                  Tài xế đang trực tuyến nhưng không đủ số dư sẽ bị khóa ngay lập tức.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              type="button"
              className="btn btn-glass"
              style={{ flex: 1, padding: '1rem' }}
              onClick={() => window.history.back()}
            >
              Hủy bỏ
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, padding: '1rem' }}
              disabled={saving}
            >
              {saving ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
              {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </form>
      </div>

      {/* Audit Info */}
      <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}</p>
      </div>
    </div>
  );
};

export default CreditWalletConfig;
