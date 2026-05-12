import React, { useEffect, useState } from 'react';
import { 
  Search, Filter, Check, X, Ban, Unlock, Eye, 
  MapPin, Calendar, Smartphone, ShieldCheck, 
  Mail, Info, Store, ChevronLeft, ChevronRight,
  FileText, User, RefreshCcw, Lock
} from 'lucide-react';
import merchantService from '../../services/merchantService';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const MerchantDetailModal = ({ merchantId, onClose, onRefresh }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [merchantId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await merchantService.getMerchantDetail(merchantId);
      setData(response.data.data);
    } catch (error) {
      toast.error('Không thể tải chi tiết Merchant');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '4rem' }}>
          <RefreshCcw size={48} className="animate-spin text-primary" style={{ margin: '0 auto 1.5rem' }} />
          <div className="skeleton" style={{ width: '200px', height: '2rem', margin: '0 auto 1rem' }}></div>
          <div className="skeleton" style={{ width: '150px', height: '1.5rem', margin: '0 auto' }}></div>
        </div>
      </div>
    </div>
  );

  const { merchant, application } = data;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        <div className="modal-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Store size={24} className="text-primary" /> Chi tiết Merchant
          </h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem' }}>
            <div style={{ 
              width: '140px', 
              height: '140px', 
              borderRadius: '28px', 
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '3.5rem',
              fontWeight: 800,
              color: 'white',
              boxShadow: '0 15px 30px rgba(0, 73, 172, 0.25)',
              overflow: 'hidden'
            }}>
              {merchant.store_image ? (
                <img src={merchant.store_image} alt="Store" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                merchant.store_name?.[0] || 'M'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text)' }}>
                    {merchant.store_name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    <MapPin size={16} /> {merchant.store_address}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                   <span className={`badge ${
                    merchant.status === 2 ? 'badge-success' : 
                    merchant.status === 1 ? 'badge-warning' : 
                    'badge-error'
                  }`}>
                    {merchant.status === 2 ? 'Đã duyệt' : merchant.status === 1 ? 'Chờ duyệt' : 'Đã từ chối'}
                  </span>
                  <span className={`badge ${merchant.user?.is_active ? 'badge-success' : 'badge-error'}`}>
                    {merchant.user?.is_active ? 'Hoạt động' : 'Đang bị khóa'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            {/* Store Information */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
                <Store size={18} /> THÔNG TIN CỬA HÀNG
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <InfoItem icon={<FileText size={18} />} label="Mã số thuế/GPKD" value={merchant.business_license || 'Chưa cập nhật'} />
                <InfoItem icon={<Calendar size={18} />} label="Giờ hoạt động" value={`${merchant.opening_time} - ${merchant.closing_time}`} />
                <div style={{ marginTop: '0.5rem' }}>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Ảnh GPKD</div>
                   {merchant.business_license_image ? (
                     <img 
                       src={merchant.business_license_image} 
                       alt="License" 
                       style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)' }} 
                     />
                   ) : <div style={{ padding: '1rem', background: 'var(--bg-soft)', borderRadius: '12px', textAlign: 'center', fontSize: '0.875rem' }}>Chưa có ảnh</div>}
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
                <User size={18} /> THÔNG TIN CHỦ SỞ HỮU
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <InfoItem icon={<User size={18} />} label="Họ và tên" value={merchant.user?.customer_profile?.full_name || 'N/A'} />
                <InfoItem icon={<Smartphone size={18} />} label="Số điện thoại" value={merchant.user?.phone} />
                <InfoItem icon={<Mail size={18} />} label="Email" value={merchant.user?.email || 'Chưa cập nhật'} />
                <InfoItem icon={<Calendar size={18} />} label="Ngày đăng ký" value={new Date(merchant.user?.created_at).toLocaleDateString('vi-VN')} />
              </div>

              {merchant.reject_reason && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--error)', borderRadius: '12px' }}>
                   <div style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 700, marginBottom: '0.25rem' }}>LÝ DO TỪ CHỐI</div>
                   <div style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{merchant.reject_reason}</div>
                </div>
              )}

              {merchant.user?.lock_reason && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--error)', borderRadius: '12px' }}>
                   <div style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 700, marginBottom: '0.25rem' }}>LÝ DO KHÓA TÀI KHOẢN</div>
                   <div style={{ fontSize: '0.875rem', color: 'var(--text)' }}>{merchant.user.lock_reason}</div>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Hết hạn: {new Date(merchant.user.lock_expired_at).toLocaleString('vi-VN')}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ color: 'var(--primary)' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{value}</div>
    </div>
  </div>
);

const MerchantList = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [params, setParams] = useState({ 
    keyword: '', 
    status: '', 
    page: 1 
  });
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);

  useEffect(() => {
    fetchMerchants();
  }, [params]);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await merchantService.getMerchants(params);
      const paginator = response.data.data;
      setMerchants(paginator.data || []);
      setPagination({
        current_page: paginator.current_page,
        last_page: paginator.last_page,
        total: paginator.total
      });
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Merchant');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (m) => {
    const result = await Swal.fire({
      title: 'Duyệt Merchant?',
      text: `Duyệt hồ sơ kinh doanh cho "${m.store_name}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy',
      confirmButtonColor: '#00906a'
    });

    if (result.isConfirmed) {
      try {
        await merchantService.approveMerchant(m.id);
        toast.success('Duyệt Merchant thành công');
        fetchMerchants();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi duyệt');
      }
    }
  };

  const handleReject = async (m) => {
    const { value: reason } = await Swal.fire({
      title: 'Từ chối Merchant',
      input: 'textarea',
      inputLabel: 'Lý do từ chối',
      inputPlaceholder: 'Vui lòng nhập lý do...',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      confirmButtonColor: '#ef4444'
    });

    if (reason) {
      try {
        await merchantService.rejectMerchant(m.id, reason);
        toast.success('Đã từ chối Merchant');
        fetchMerchants();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Lỗi khi từ chối');
      }
    }
  };

  const handleToggleLock = async (m) => {
    const isLocking = m.user?.is_active;
    
    if (isLocking) {
      const { value: formValues } = await Swal.fire({
        title: 'Khóa tài khoản Merchant',
        html: `
          <div style="text-align: left;">
            <label style="display: block; margin-bottom: 8px; font-weight: 600;">Lý do khóa <span style="color: var(--error);">*</span></label>
            <textarea id="lock-reason" class="swal2-textarea" style="margin: 0; width: 100%;" placeholder="Nhập lý do khóa..."></textarea>
            
            <label style="display: block; margin-top: 1.5rem; margin-bottom: 8px; font-weight: 600;">Số ngày khóa (Mặc định 2 ngày)</label>
            <input id="lock-days" type="number" class="swal2-input" style="margin: 0; width: 100%;" placeholder="Ví dụ: 7" min="1" value="2">
          </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Xác nhận khóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: 'var(--error)',
        preConfirm: () => {
          const reason = document.getElementById('lock-reason').value;
          const days = document.getElementById('lock-days').value;
          
          if (!reason) {
            Swal.showValidationMessage('Vui lòng nhập lý do khóa tài khoản.');
            return false;
          }
          
          return {
            reason: reason,
            locked_days: days ? parseInt(days) : 2
          };
        }
      });

      if (formValues) {
        try {
          const loadingToast = toast.loading('Đang xử lý...');
          await merchantService.toggleLock(m.id, true, formValues.reason, formValues.locked_days);
          toast.dismiss(loadingToast);
          toast.success('Đã khóa tài khoản Merchant');
          fetchMerchants();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Lỗi khi khóa');
        }
      }
    } else {
      const result = await Swal.fire({
        title: 'Mở khóa Merchant?',
        text: `Bạn có chắc chắn muốn mở khóa cho Merchant "${m.store_name}" không?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý mở khóa',
        cancelButtonText: 'Hủy',
        confirmButtonColor: 'var(--success)'
      });

      if (result.isConfirmed) {
        try {
          const loadingToast = toast.loading('Đang xử lý...');
          await merchantService.toggleLock(m.id, false);
          toast.dismiss(loadingToast);
          toast.success('Mở khóa tài khoản thành công');
          fetchMerchants();
        } catch (error) {
          toast.error(error.response?.data?.message || 'Lỗi khi mở khóa');
        }
      }
    }
  };

  return (
    <div className="merchants-page" style={{ padding: '2rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Quản lý Merchant</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Hệ thống xét duyệt và quản lý đối tác nhà hàng, cửa hàng.</p>
        </div>
        <button className="btn btn-glass" onClick={() => fetchMerchants()}>
          <RefreshCcw size={18} /> Làm mới
        </button>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => { setActiveTab('all'); setParams({ ...params, status: '', page: 1 }); }}
        >
          Tất cả
        </button>
        <button 
          className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => { setActiveTab('pending'); setParams({ ...params, status: '1', page: 1 }); }}
        >
          Đang chờ duyệt
        </button>
        <button 
          className={`tab-item ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => { setActiveTab('approved'); setParams({ ...params, status: '2', page: 1 }); }}
        >
          Đã duyệt
        </button>
      </div>

      <div className="glass" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', borderRadius: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm theo tên cửa hàng, SĐT, Email..." 
            style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', background: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '14px', color: 'var(--text)', outline: 'none' }}
            onChange={(e) => setParams({ ...params, keyword: e.target.value, page: 1 })}
          />
        </div>
      </div>

      <div className="glass" style={{ padding: '0', borderRadius: '24px', overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">Đang tải dữ liệu...</div>
        ) : merchants.length === 0 ? (
          <div className="empty-state" style={{ padding: '5rem 0' }}>
            <Store size={64} style={{ marginBottom: '1.5rem', opacity: 0.2, color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Không có Merchant nào</h3>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cửa hàng</th>
                  <th>Chủ sở hữu</th>
                  <th>Trạng thái duyệt</th>
                  <th>Tài khoản</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map(m => (
                  <tr key={m.id} className="glass-hover">
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '44px', height: '44px', borderRadius: '12px', 
                          background: 'var(--primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white'
                        }}>
                          {m.store_name?.[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700 }}>{m.store_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.store_address}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.user?.customer_profile?.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.user?.phone}</div>
                    </td>
                    <td>
                      <span className={`badge ${
                        m.status === 2 ? 'badge-success' : 
                        m.status === 1 ? 'badge-warning' : 
                        'badge-error'
                      }`}>
                        {m.status === 2 ? 'Đã duyệt' : m.status === 1 ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${m.user?.is_active ? 'badge-success' : 'badge-error'}`} style={{ marginBottom: m.user?.is_active ? 0 : '4px' }}>
                        {m.user?.is_active ? 'Kích hoạt' : 'Bị khóa'}
                      </span>
                      {!m.user?.is_active && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: '1.2' }}>
                          <div style={{ fontWeight: 600, color: 'var(--error)' }}>Lý do: {m.user?.lock_reason || 'N/A'}</div>
                          <div>Hết hạn: {m.user?.lock_expired_at ? new Date(m.user.lock_expired_at).toLocaleString('vi-VN') : 'Vĩnh viễn'}</div>
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button onClick={() => setSelectedMerchantId(m.id)} className="btn-action btn-action-view">
                          <Eye size={16} /> Chi tiết
                        </button>
                        
                        {m.status === 1 && (
                          <>
                            <button onClick={() => handleApprove(m)} className="btn-action btn-action-approve"><Check size={16} /></button>
                            <button onClick={() => handleReject(m)} className="btn-action btn-action-reject"><X size={16} /></button>
                          </>
                        )}
                        
                        <button onClick={() => handleToggleLock(m)} className="btn-icon" title={m.user?.is_active ? 'Khóa' : 'Mở khóa'}>
                          {m.user?.is_active ? <Ban size={18} className="text-error" /> : <Unlock size={18} className="text-success" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedMerchantId && (
        <MerchantDetailModal 
          merchantId={selectedMerchantId} 
          onClose={() => setSelectedMerchantId(null)} 
          onRefresh={fetchMerchants}
        />
      )}
    </div>
  );
};

export default MerchantList;
