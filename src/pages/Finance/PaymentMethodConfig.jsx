import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Edit, 
  ArrowLeft, 
  Save, 
  RefreshCcw, 
  Globe, 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  Info, 
  Wallet, 
  CreditCard, 
  Landmark, 
  AlertTriangle,
  Lock,
  Percent,
  CheckCircle2,
  X
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Helper to safely parse JSON field in case backend returns stringified JSON
const parseJsonField = (field) => {
  if (!field) return {};
  if (typeof field === 'object') return field;
  try {
    return JSON.parse(field);
  } catch (e) {
    return {};
  }
};

const PaymentMethodConfig = () => {
  const navigate = useNavigate();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    type: 'e_wallet',
    code: '',
    name: '',
    is_active: false,
    min_amount: '',
    max_amount: '',
    icon_url: '',
    sort_order: '',
    transfer_info: {
      bank_name: '',
      account_number: '',
      account_name: '',
      bank_code: '',
      branch: '',
      qr_url: '',
      default_content: '',
      content_syntax: 'TOPUP_[DriverCode]_[TransactionCode]',
      auto_reconciliation: false
    },
    metadata: {
      merchant_id: '',
      partner_code: '',
      access_key: '',
      secret_key: '',
      app_id: '',
      key_1: '',
      key_2: '',
      client_id: '',
      api_key: '',
      checksum_key: '',
      webhook_url: '',
      endpoint: '',
      transaction_fee: '',
      internal_note: '',
      require_otp: false
    }
  });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/admin/finance/payment-methods');
      if (response.data.success) {
        setMethods(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('Không thể tải danh sách phương thức nạp tiền');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingMethod(null);
    setFormData({
      type: 'e_wallet',
      code: '',
      name: '',
      is_active: false,
      min_amount: '',
      max_amount: '',
      icon_url: '',
      sort_order: '',
      transfer_info: {
        bank_name: '',
        account_number: '',
        account_name: '',
        bank_code: '',
        branch: '',
        qr_url: '',
        default_content: '',
        content_syntax: 'TOPUP_[DriverCode]_[TransactionCode]',
        auto_reconciliation: false
      },
      metadata: {
        merchant_id: '',
        partner_code: '',
        access_key: '',
        secret_key: '',
        app_id: '',
        key_1: '',
        key_2: '',
        client_id: '',
        api_key: '',
        checksum_key: '',
        webhook_url: '',
        endpoint: '',
        transaction_fee: '',
        internal_note: '',
        require_otp: false
      }
    });
    setShowModal(true);
  };

  const handleOpenEdit = (method) => {
    setEditingMethod(method);
    
    const transferInfo = parseJsonField(method.transfer_info);
    const metadata = parseJsonField(method.metadata);

    // Merge existing values to form state safely
    setFormData({
      type: method.type || 'e_wallet',
      code: method.code || '',
      name: method.name || '',
      is_active: !!method.is_active,
      min_amount: method.min_amount !== undefined && method.min_amount !== null ? method.min_amount : '',
      max_amount: method.max_amount !== undefined && method.max_amount !== null ? method.max_amount : '',
      icon_url: method.icon_url || '',
      sort_order: method.sort_order !== undefined && method.sort_order !== null ? method.sort_order : '',
      transfer_info: {
        bank_name: transferInfo.bank_name || '',
        account_number: transferInfo.account_number || '',
        account_name: transferInfo.account_name || '',
        bank_code: transferInfo.bank_code || '',
        branch: transferInfo.branch || '',
        qr_url: transferInfo.qr_url || '',
        default_content: transferInfo.default_content || '',
        content_syntax: transferInfo.content_syntax || 'TOPUP_[DriverCode]_[TransactionCode]',
        auto_reconciliation: !!transferInfo.auto_reconciliation
      },
      metadata: {
        merchant_id: metadata.merchant_id || '',
        partner_code: metadata.partner_code || '',
        access_key: metadata.access_key || '',
        secret_key: metadata.secret_key || '',
        app_id: metadata.app_id || '',
        key_1: metadata.key_1 || '',
        key_2: metadata.key_2 || '',
        client_id: metadata.client_id || '',
        api_key: metadata.api_key || '',
        checksum_key: metadata.checksum_key || '',
        webhook_url: metadata.webhook_url || '',
        endpoint: metadata.endpoint || '',
        transaction_fee: metadata.transaction_fee !== undefined && metadata.transaction_fee !== null ? metadata.transaction_fee : '',
        internal_note: metadata.internal_note || '',
        require_otp: !!metadata.require_otp
      }
    });
    setShowModal(true);
  };

  const handleToggle = async (method) => {
    try {
      const response = await api.patch(`/v1/admin/finance/payment-methods/${method.id}/toggle`);
      if (response.data.success) {
        toast.success(response.data.message || 'Cập nhật trạng thái thành công');
        
        // Cảnh báo nếu sau khi tắt, không có phương thức nào active
        if (response.data.message.includes('không có phương thức')) {
          Swal.fire({
            title: 'Cảnh báo hệ thống',
            text: response.data.message,
            icon: 'warning',
            confirmButtonText: 'Đã hiểu'
          });
        }
        
        fetchMethods();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || '';
      
      // Kiểm tra xem lỗi có phải do pending transaction cảnh báo
      if (error.response?.status === 400 && errorMsg.includes('giao dịch chờ xử lý')) {
        const confirmResult = await Swal.fire({
          title: 'Cảnh báo giao dịch pending',
          text: errorMsg,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Vẫn vô hiệu hóa',
          cancelButtonText: 'Hủy bỏ'
        });

        if (confirmResult.isConfirmed) {
          try {
            const retryResponse = await api.patch(`/v1/admin/finance/payment-methods/${method.id}/toggle`, null, {
              params: { confirm: true }
            });
            if (retryResponse.data.success) {
              toast.success(retryResponse.data.message || 'Đã vô hiệu hóa thành công');
              
              if (retryResponse.data.message.includes('không có phương thức')) {
                Swal.fire({
                  title: 'Cảnh báo hệ thống',
                  text: retryResponse.data.message,
                  icon: 'warning',
                  confirmButtonText: 'Đã hiểu'
                });
              }
              
              fetchMethods();
            }
          } catch (retryError) {
            toast.error(retryError.response?.data?.message || 'Có lỗi xảy ra khi vô hiệu hóa');
          }
        }
      } else {
        toast.error(errorMsg || 'Không thể thay đổi trạng thái phương thức');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const minVal = formData.min_amount === '' ? 0 : parseFloat(formData.min_amount);
    const maxVal = formData.max_amount === '' ? 0 : parseFloat(formData.max_amount);
    if (minVal > maxVal) {
      toast.error('Giới hạn số tiền nạp không hợp lệ. Số tiền tối thiểu không được lớn hơn tối đa.');
      return;
    }

    // Chuẩn hóa dữ liệu gửi API theo đúng type để tránh lỗi validation do ConvertEmptyStringsToNull của Laravel
    const submitData = {
      type: formData.type,
      code: formData.code,
      name: formData.name,
      is_active: !!formData.is_active,
      min_amount: minVal,
      max_amount: maxVal,
      sort_order: formData.sort_order === '' ? 0 : parseInt(formData.sort_order),
      icon_url: formData.icon_url || null
    };

    if (formData.type === 'bank_transfer') {
      submitData.transfer_info = {
        bank_name: formData.transfer_info.bank_name || '',
        account_number: formData.transfer_info.account_number || '',
        account_name: formData.transfer_info.account_name || '',
        bank_code: formData.transfer_info.bank_code || '',
        branch: formData.transfer_info.branch || null,
        qr_url: formData.transfer_info.qr_url || null,
        default_content: formData.transfer_info.default_content || null,
        content_syntax: formData.transfer_info.content_syntax || 'TOPUP_[DriverCode]_[TransactionCode]',
        auto_reconciliation: !!formData.transfer_info.auto_reconciliation
      };
      
      // Xóa các trường trống không bắt buộc
      if (!submitData.transfer_info.branch) delete submitData.transfer_info.branch;
      if (!submitData.transfer_info.qr_url) delete submitData.transfer_info.qr_url;
      if (!submitData.transfer_info.default_content) delete submitData.transfer_info.default_content;
    } else {
      submitData.metadata = {
        merchant_id: formData.metadata.merchant_id || null,
        partner_code: formData.metadata.partner_code || null,
        access_key: formData.metadata.access_key || null,
        secret_key: formData.metadata.secret_key || null,
        app_id: formData.metadata.app_id || null,
        key_1: formData.metadata.key_1 || null,
        key_2: formData.metadata.key_2 || null,
        client_id: formData.metadata.client_id || null,
        api_key: formData.metadata.api_key || null,
        checksum_key: formData.metadata.checksum_key || null,
        webhook_url: formData.metadata.webhook_url || null,
        endpoint: formData.metadata.endpoint || null,
        transaction_fee: (formData.metadata.transaction_fee === '' || formData.metadata.transaction_fee === undefined) ? 0 : parseFloat(formData.metadata.transaction_fee),
        internal_note: formData.metadata.internal_note || null,
        require_otp: !!formData.metadata.require_otp
      };

      // Lọc bỏ các trường null/rỗng để tránh dư thừa data
      Object.keys(submitData.metadata).forEach(key => {
        if (submitData.metadata[key] === null || submitData.metadata[key] === '') {
          delete submitData.metadata[key];
        }
      });
    }

    setSubmitting(true);
    try {
      let response;
      if (editingMethod) {
        response = await api.put(`/v1/admin/finance/payment-methods/${editingMethod.id}`, submitData);
      } else {
        response = await api.post('/v1/admin/finance/payment-methods', submitData);
      }

      if (response.data.success) {
        toast.success(editingMethod ? 'Cập nhật phương thức thành công.' : 'Tạo phương thức thành công.');
        
        if (response.data.message && response.data.message.includes('không có phương thức')) {
          Swal.fire({
            title: 'Cảnh báo hệ thống',
            text: response.data.message,
            icon: 'warning',
            confirmButtonText: 'Đã hiểu'
          });
        }

        setShowModal(false);
        fetchMethods();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || '';
      
      // Xử lý cảnh báo pending transaction trong PUT update
      if (error.response?.status === 400 && errorMsg.includes('giao dịch chờ xử lý')) {
        const confirmResult = await Swal.fire({
          title: 'Cảnh báo giao dịch pending',
          text: errorMsg,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'Vẫn cập nhật & Vô hiệu hóa',
          cancelButtonText: 'Hủy bỏ'
        });

        if (confirmResult.isConfirmed) {
          try {
            const retryResponse = await api.put(`/v1/admin/finance/payment-methods/${editingMethod.id}`, {
              ...submitData,
              confirm: true
            });
            if (retryResponse.data.success) {
              toast.success('Cập nhật phương thức thành công.');
              
              if (retryResponse.data.message && retryResponse.data.message.includes('không có phương thức')) {
                Swal.fire({
                  title: 'Cảnh báo hệ thống',
                  text: retryResponse.data.message,
                  icon: 'warning',
                  confirmButtonText: 'Đã hiểu'
                });
              }
              
              setShowModal(false);
              fetchMethods();
            }
          } catch (retryError) {
            toast.error(retryError.response?.data?.message || 'Lỗi khi cập nhật cấu hình.');
          }
        }
      } else {
        toast.error(errorMsg || 'Không thể lưu cấu hình phương thức nạp tiền.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const getMethodIcon = (type) => {
    switch (type) {
      case 'e_wallet':
        return <Wallet className="text-warning" size={24} />;
      case 'bank_card':
        return <CreditCard className="text-secondary" size={24} />;
      case 'bank_transfer':
        return <Landmark className="text-primary" size={24} />;
      default:
        return <Wallet size={24} />;
    }
  };

  const getMethodTypeLabel = (type) => {
    switch (type) {
      case 'e_wallet':
        return 'Ví điện tử';
      case 'bank_card':
        return 'Thẻ ngân hàng nội địa';
      case 'bank_transfer':
        return 'Chuyển khoản trực tiếp';
      default:
        return type;
    }
  };

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="payment-methods-page animate-slide-up" style={{ padding: '2rem' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2.5rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
              boxShadow: 'var(--shadow)'
            }}
            title="Quay lại"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Cấu hình Phương thức nạp tiền</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
              Quản lý các cổng thanh toán, tài khoản ngân hàng và kiểm soát giới hạn nạp tiền của Driver.
            </p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={18} />
          Thêm phương thức mới
        </button>
      </header>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <RefreshCcw className="animate-spin text-primary" size={48} />
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {methods.map((method) => {
            const transferInfo = parseJsonField(method.transfer_info);
            const metadata = parseJsonField(method.metadata);
            
            return (
              <div 
                key={method.id} 
                className="glass glass-hover" 
                style={{ 
                  padding: '1.75rem', 
                  borderRadius: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border)',
                  position: 'relative'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '14px', 
                      background: 'var(--bg-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {method.icon_url ? (
                        <img src={method.icon_url} alt={method.name} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                      ) : (
                        getMethodIcon(method.type)
                      )}
                    </div>
                    
                    {/* Status Toggle Switch */}
                    <div 
                      style={{ 
                        width: '54px', 
                        height: '28px', 
                        background: method.is_active ? 'var(--success)' : '#cbd5e1',
                        borderRadius: '20px',
                        padding: '3px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        justifyContent: method.is_active ? 'flex-end' : 'flex-start'
                      }}
                      onClick={() => handleToggle(method)}
                      title={method.is_active ? "Click để tắt phương thức" : "Click để bật phương thức"}
                    >
                      <div style={{ width: '22px', height: '22px', background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>{method.name}</h3>
                  <span className="badge" style={{ 
                    background: 'rgba(0, 73, 172, 0.08)', 
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '8px',
                    fontWeight: 600
                  }}>
                    {getMethodTypeLabel(method.type)} ({method.code})
                  </span>

                  <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'var(--bg-soft)', borderRadius: '14px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Nạp tối thiểu:</span>
                      <span style={{ fontWeight: 700 }}>{formatMoney(method.min_amount)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Nạp tối đa:</span>
                      <span style={{ fontWeight: 700 }}>{formatMoney(method.max_amount)}</span>
                    </div>
                  </div>

                  {method.type === 'bank_transfer' && transferInfo && (
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                      <p style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: 'var(--text)' }}>
                        Tài khoản nhận: <span style={{ color: 'var(--primary)' }}>{transferInfo.bank_name}</span>
                      </p>
                      <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-muted)' }}>
                        Số TK: <span style={{ fontWeight: 700, color: 'var(--text)' }}>{transferInfo.account_number}</span>
                      </p>
                      <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                        Chủ TK: <span style={{ fontWeight: 700, color: 'var(--text)' }}>{transferInfo.account_name}</span>
                      </p>
                    </div>
                  )}

                  {method.type !== 'bank_transfer' && metadata && (
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem', color: 'var(--text-muted)' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <Globe size={14} className="text-secondary" />
                        <span style={{ wordBreak: 'break-all' }}>{metadata.endpoint || 'Chưa cấu hình Endpoint'}</span>
                      </div>
                      {metadata.transaction_fee > 0 && (
                        <p style={{ margin: '0.25rem 0 0 0', fontWeight: 600 }}>
                          Phí giao dịch: <span style={{ color: 'var(--success)' }}>{metadata.transaction_fee}%</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                  <button 
                    className="btn btn-glass" 
                    style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem' }}
                    onClick={() => handleOpenEdit(method)}
                  >
                    <Edit size={14} />
                    Sửa cấu hình
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Add/Edit payment method */}
      {showModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-slide-up" style={{ 
            maxWidth: '900px', 
            padding: '2.5rem',
            position: 'relative' // Định vị nút X tuyệt đối
          }}>
            {/* Nút X đóng nhanh modal */}
            <button 
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(0, 0, 0, 0.05)',
                border: 'none',
                color: 'var(--text)',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              title="Đóng cửa sổ"
              className="btn-icon-hover"
            >
              <X size={18} />
            </button>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.75rem', paddingRight: '2rem' }}>
              {editingMethod ? `Cấu hình: ${formData.name}` : 'Thêm phương thức nạp tiền mới'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                {/* Method Type */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Loại phương thức</label>
                  <select 
                    className="btn-glass"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                    value={formData.type || 'e_wallet'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    disabled={!!editingMethod}
                  >
                    <option value="e_wallet">Ví điện tử</option>
                    <option value="bank_card">Thẻ ngân hàng nội địa</option>
                    <option value="bank_transfer">Chuyển khoản trực tiếp</option>
                  </select>
                </div>

                {/* Unique Code */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Mã định danh (Code)</label>
                  <select 
                    className="btn-glass"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                    disabled={!!editingMethod}
                    required
                  >
                    <option value="" disabled>-- Chọn mã định danh --</option>
                    <option value="momo">Ví MoMo (momo)</option>
                    <option value="zalopay">Ví ZaloPay (zalopay)</option>
                    <option value="payos">Chuyển khoản 24/7 (payos)</option>
                    <option value="bank_transfer">Chuyển khoản thủ công (bank_transfer)</option>
                    <option value="bank_card">Thẻ ATM nội địa (bank_card)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                {/* Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Tên hiển thị</label>
                  <input 
                    type="text" 
                    className="btn-glass"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Ví MoMo, Chuyển khoản Vietcombank"
                    required
                  />
                </div>
                
                {/* Sort Order */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Thứ tự sắp xếp</label>
                  <input 
                    type="number" 
                    className="btn-glass"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value === '' ? '' : parseInt(e.target.value) })}
                    placeholder="VD: 1, 2, 3..."
                  />
                </div>
              </div>

              {/* Transaction Limits */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Nạp tối thiểu (VND)</label>
                  <input 
                    type="number" 
                    className="btn-glass"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                    value={formData.min_amount}
                    onChange={(e) => setFormData({ ...formData, min_amount: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                    placeholder="VD: 10000"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Nạp tối đa (VND)</label>
                  <input 
                    type="number" 
                    className="btn-glass"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                    value={formData.max_amount}
                    onChange={(e) => setFormData({ ...formData, max_amount: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                    placeholder="VD: 10000000"
                    required
                  />
                </div>
              </div>

              {/* Icon URL */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem' }}>Đường dẫn Logo/Icon (URL)</label>
                <input 
                  type="text" 
                  className="btn-glass"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                  value={formData.icon_url || ''}
                  onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                  placeholder="https://cdn.example.com/icon.png"
                />
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox"
                  id="modal_is_active"
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  checked={!!formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="modal_is_active" style={{ fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
                  Kích hoạt phương thức này (Active)
                </label>
              </div>

              {/* Sub-form for E-Wallet / Bank Card (stored in metadata) */}
              {formData.type !== 'bank_transfer' && (
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                    <ShieldCheck size={18} />
                    Cấu hình kết nối Cổng thanh toán (Payment Gateway)
                  </h4>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Endpoint kết nối API</label>
                    <input 
                      type="url" 
                      className="btn-glass"
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                      value={formData.metadata?.endpoint || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        metadata: { ...(formData.metadata || {}), endpoint: e.target.value } 
                      })}
                      placeholder="https://payment.momo.vn/v2/gateway/api"
                      required={!!formData.is_active}
                    />
                  </div>

                  {/* Dynamic Fields based on Code */}
                  {formData.code?.toLowerCase().includes('momo') && (
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', marginBottom: '1rem' }}>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text)' }}>Cấu hình MoMo</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Partner Code</label>
                          <input type="text" className="btn-glass" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={formData.metadata?.partner_code || ''} onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, partner_code: e.target.value }})} placeholder="MOMO..." />
                          <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Mã đối tác (Thường bắt đầu bằng chữ MOMO) được cấp trong trang quản trị MoMo Business.</small>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Merchant ID</label>
                          <input type="text" className="btn-glass" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={formData.metadata?.merchant_id || ''} onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, merchant_id: e.target.value }})} placeholder="MOMO_12345" />
                          <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Mã định danh doanh nghiệp (Thông thường sẽ giống hệt với Partner Code).</small>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Access Key</label>
                          <input type="password" className="btn-glass" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={formData.metadata?.access_key || ''} onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, access_key: e.target.value }})} placeholder="••••••••" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Secret Key</label>
                          <input type="password" className="btn-glass" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={formData.metadata?.secret_key || ''} onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, secret_key: e.target.value }})} placeholder="••••••••" />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.code?.toLowerCase().includes('zalopay') && (
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', marginBottom: '1rem' }}>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text)' }}>Cấu hình ZaloPay</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>App ID</label>
                          <input type="text" className="btn-glass" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={formData.metadata?.app_id || ''} onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, app_id: e.target.value }})} placeholder="2553" />
                          <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>ID Ứng dụng được cấp trên ZaloPay Merchant Portal (VD: 2553).</small>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Key 1</label>
                          <input type="password" className="btn-glass" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={formData.metadata?.key_1 || ''} onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, key_1: e.target.value }})} placeholder="••••••••" />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Key 2</label>
                          <input type="password" className="btn-glass" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={formData.metadata?.key_2 || ''} onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, key_2: e.target.value }})} placeholder="••••••••" />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.code?.toLowerCase().includes('payos') && (
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', marginBottom: '1rem' }}>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.8rem', color: 'var(--text)' }}>Cấu hình payOS</h5>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Client ID</label>
                          <input type="text" className="btn-glass" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={formData.metadata?.client_id || ''} onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, client_id: e.target.value }})} placeholder="Client ID" />
                          <small style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Mã Client ID (Mã khách hàng) lấy từ Dashboard của payOS.</small>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>API Key</label>
                          <input type="password" className="btn-glass" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={formData.metadata?.api_key || ''} onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, api_key: e.target.value }})} placeholder="••••••••" />
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Checksum Key</label>
                          <input type="password" className="btn-glass" style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)' }}
                            value={formData.metadata?.checksum_key || ''} onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, checksum_key: e.target.value }})} placeholder="••••••••" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Other standard gateways (if not momo, zalopay, payos) */}
                  {!['momo', 'zalopay', 'payos'].some(code => formData.code?.toLowerCase().includes(code)) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Mã đối tác (Merchant ID)</label>
                        <input type="text" className="btn-glass" style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                          value={formData.metadata?.merchant_id || ''} onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, merchant_id: e.target.value }})} placeholder="MOMO_12345" />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Khóa bảo mật (Secret Key)</label>
                        <input type="password" className="btn-glass" style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                          value={formData.metadata?.secret_key || ''} onChange={(e) => setFormData({ ...formData, metadata: { ...formData.metadata, secret_key: e.target.value }})} placeholder="••••••••••••••" />
                      </div>
                    </div>
                  )}

                  {/* Common fields: Webhook & Transaction Fee */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Webhook URL (Nhận kết quả)</label>
                      <input 
                        type="url" 
                        className="btn-glass"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                        value={formData.metadata?.webhook_url || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          metadata: { ...(formData.metadata || {}), webhook_url: e.target.value } 
                        })}
                        placeholder={`${import.meta.env.VITE_API_URL || 'https://api.domain.com/api'}/v1/finance/wallet/top-up/callback/${formData.code || '[gateway]'}`}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Phí giao dịch (%)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        className="btn-glass"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                        value={formData.metadata?.transaction_fee !== undefined && formData.metadata?.transaction_fee !== null ? formData.metadata.transaction_fee : ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          metadata: { ...(formData.metadata || {}), transaction_fee: e.target.value === '' ? '' : parseFloat(e.target.value) } 
                        })}
                        placeholder="VD: 1.5"
                      />
                    </div>
                  </div>

                  {formData.type === 'bank_card' && (
                    <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input 
                        type="checkbox"
                        id="require_otp_checkbox"
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        checked={!!formData.metadata?.require_otp}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          metadata: { ...(formData.metadata || {}), require_otp: e.target.checked } 
                        })}
                      />
                      <label htmlFor="require_otp_checkbox" style={{ fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                        Yêu cầu xác thực OTP khi nạp tiền
                      </label>
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Ghi chú nội bộ</label>
                    <textarea 
                      className="btn-glass"
                      style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)', minHeight: '60px' }}
                      value={formData.metadata?.internal_note || ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        metadata: { ...(formData.metadata || {}), internal_note: e.target.value } 
                      })}
                      placeholder="Ghi chú cấu hình..."
                    />
                  </div>
                </div>
              )}

              {/* Sub-form for Direct Transfer (stored in transfer_info) */}
              {formData.type === 'bank_transfer' && (
                <div style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '16px', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                    <Landmark size={18} />
                    Thông tin tài khoản thụ hưởng
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Tên Ngân hàng thụ hưởng</label>
                      <input 
                        type="text" 
                        className="btn-glass"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                        value={formData.transfer_info?.bank_name || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          transfer_info: { ...(formData.transfer_info || {}), bank_name: e.target.value } 
                        })}
                        placeholder="Ví dụ: Vietcombank, Techcombank"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Mã NH (Code)</label>
                      <input 
                        type="text" 
                        className="btn-glass"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                        value={formData.transfer_info?.bank_code || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          transfer_info: { ...(formData.transfer_info || {}), bank_code: e.target.value.toUpperCase() } 
                        })}
                        placeholder="VCB, TCB..."
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Số tài khoản</label>
                      <input 
                        type="text" 
                        className="btn-glass"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                        value={formData.transfer_info?.account_number || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          transfer_info: { ...(formData.transfer_info || {}), account_number: e.target.value } 
                        })}
                        placeholder="1023847293"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Tên Chủ tài khoản</label>
                      <input 
                        type="text" 
                        className="btn-glass"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                        value={formData.transfer_info?.account_name || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          transfer_info: { ...(formData.transfer_info || {}), account_name: e.target.value.toUpperCase() } 
                        })}
                        placeholder="NGUYEN VAN A"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Chi nhánh (nếu có)</label>
                      <input 
                        type="text" 
                        className="btn-glass"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                        value={formData.transfer_info?.branch || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          transfer_info: { ...(formData.transfer_info || {}), branch: e.target.value } 
                        })}
                        placeholder="Chi nhánh Hà Nội..."
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Mã QR URL</label>
                      <input 
                        type="url" 
                        className="btn-glass"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                        value={formData.transfer_info?.qr_url || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          transfer_info: { ...(formData.transfer_info || {}), qr_url: e.target.value } 
                        })}
                        placeholder="https://img.vietqr.io/image/vcb..."
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Nội dung mặc định</label>
                      <input 
                        type="text" 
                        className="btn-glass"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                        value={formData.transfer_info?.default_content || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          transfer_info: { ...(formData.transfer_info || {}), default_content: e.target.value } 
                        })}
                        placeholder="NAP TIEN VI"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>Cú pháp nội dung</label>
                      <input 
                        type="text" 
                        className="btn-glass"
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.9rem', border: '1px solid var(--border)' }}
                        value={formData.transfer_info?.content_syntax || ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          transfer_info: { ...(formData.transfer_info || {}), content_syntax: e.target.value } 
                        })}
                        placeholder="TOPUP_[DriverCode]_[TransactionCode]"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="checkbox"
                      id="auto_reconciliation_checkbox"
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      checked={!!formData.transfer_info?.auto_reconciliation}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        transfer_info: { ...(formData.transfer_info || {}), auto_reconciliation: e.target.checked } 
                      })}
                    />
                    <label htmlFor="auto_reconciliation_checkbox" style={{ fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                      Tự động đối soát chuyển khoản ngân hàng
                    </label>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn btn-glass"
                  style={{ flex: 1, padding: '0.875rem' }}
                  onClick={() => setShowModal(false)}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '0.875rem' }}
                  disabled={submitting}
                >
                  {submitting ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
                  {submitting ? 'Đang lưu cấu hình...' : 'Lưu cấu hình'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default PaymentMethodConfig;
