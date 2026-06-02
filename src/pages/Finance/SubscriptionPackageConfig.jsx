import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  EyeOff, 
  Eye, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Percent, 
  Clock, 
  X,
  CheckCircle2,
  AlertCircle,
  Package,
  Info,
  ArrowLeft
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const SubscriptionPackageConfig = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    package_type: 'monthly',
    price: '',
    duration_days: '',
    service_fee_reduction_percent: 100,
    description: ''
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/v1/admin/finance/subscriptions/packages');
      if (response.data.success) {
        setPackages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching subscription packages:', error);
      toast.error('Không thể tải danh sách gói thuê bao');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pkg = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        package_type: pkg.package_type,
        price: pkg.price,
        duration_days: pkg.duration_days,
        service_fee_reduction_percent: pkg.service_fee_reduction_percent,
        description: pkg.description || ''
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        package_type: 'monthly',
        price: '',
        duration_days: '',
        service_fee_reduction_percent: 100,
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPackage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple client-side validation
    if (!formData.name || !formData.price || !formData.duration_days) {
      toast.error('Vui lòng nhập đầy đủ các trường bắt buộc');
      return;
    }

    try {
      let response;
      if (editingPackage) {
        response = await api.put(`/v1/admin/finance/subscriptions/packages/${editingPackage.id}`, formData);
      } else {
        response = await api.post('/v1/admin/finance/subscriptions/packages', formData);
      }

      if (response.data.success) {
        toast.success(editingPackage ? 'Cập nhật thành công' : 'Thêm gói mới thành công');
        handleCloseModal();
        fetchPackages();
      }
    } catch (error) {
      console.error('Error saving package:', error);
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi lưu cấu hình';
      toast.error(message);
    }
  };

  const handleDisable = async (pkg) => {
    const result = await Swal.fire({
      title: 'Vô hiệu hóa gói?',
      text: `Gói "${pkg.name}" sẽ ngừng bán cho tài xế mới. Các tài xế đang sử dụng vẫn có hiệu lực đến ngày hết hạn.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--error)',
      cancelButtonColor: 'var(--text-muted)',
      confirmButtonText: 'Đồng ý vô hiệu hóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const response = await api.patch(`/v1/admin/finance/subscriptions/packages/${pkg.id}/disable`);
        if (response.data.success) {
          toast.success(response.data.message || 'Đã vô hiệu hóa gói thành công');
          fetchPackages();
        }
      } catch (error) {
        toast.error('Không thể vô hiệu hóa gói thuê bao');
      }
    }
  };

  const filteredPackages = packages.filter(pkg => {
    const name = pkg.name || '';
    const type = pkg.package_type || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           type.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="finance-page" style={{ padding: '2rem' }}>
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
              transition: 'var(--transition)',
              boxShadow: 'var(--shadow)'
            }}
            title="Quay lại Quản lý Tài chính"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title" style={{ margin: 0 }}>Cấu hình Gói thuê bao (UC-118)</h1>
            <p style={{ color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>Thiết lập các gói dịch vụ trả trước để tài xế nhận 100% cước phí.</p>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} />
          Thêm gói mới
        </button>
      </header>

      {/* Action Bar */}
      <div className="glass" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', borderRadius: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm theo tên gói hoặc loại..." 
            className="form-control" 
            style={{ paddingLeft: '40px', borderRadius: '12px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-glass" onClick={fetchPackages}>
          Làm mới
        </button>
      </div>

      {/* Package Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang tải danh sách gói...</p>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="glass" style={{ textAlign: 'center', padding: '5rem', borderRadius: '24px' }}>
          <Package size={64} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '1.5rem' }} />
          <h3 style={{ color: 'var(--text-muted)' }}>Chưa có gói thuê bao nào</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Hãy bắt đầu bằng việc tạo một gói thuê bao mới cho tài xế.</p>
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>Tạo gói đầu tiên</button>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '2rem' 
        }}>
          {filteredPackages.map((pkg) => (
            <div key={pkg.id} className={`glass glass-hover animate-slide-up ${!pkg.is_active ? 'opacity-60' : ''}`} style={{ 
              padding: '2rem', 
              borderRadius: '24px',
              position: 'relative',
              border: pkg.is_active ? '1px solid rgba(255,255,255,0.1)' : '1px dashed var(--error)',
              overflow: 'hidden'
            }}>
              {!pkg.is_active && (
                <div style={{ 
                  position: 'absolute', 
                  top: '12px', 
                  right: '-30px', 
                  background: 'var(--error)', 
                  color: 'white', 
                  padding: '4px 40px', 
                  transform: 'rotate(45deg)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  NGỪNG BÁN
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: pkg.is_active ? 'var(--bg-soft)' : 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: pkg.is_active ? 'var(--primary)' : 'var(--error)'
                }}>
                  <Package size={24} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn-icon" 
                    onClick={() => handleOpenModal(pkg)}
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={16} />
                  </button>
                  {pkg.is_active && (
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDisable(pkg)}
                      style={{ color: 'var(--error)' }}
                      title="Vô hiệu hóa"
                    >
                      <EyeOff size={16} />
                    </button>
                  )}
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{pkg.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <span className={`badge ${pkg.package_type === 'monthly' ? 'badge-primary' : 'badge-success'}`}>
                  {{
                    daily: 'Hàng ngày',
                    weekly: 'Hàng tuần',
                    monthly: 'Hàng tháng'
                  }[pkg.package_type] || pkg.package_type.toUpperCase()}
                </span>
                <span className="text-muted" style={{ fontSize: '0.85rem' }}>• {pkg.duration_days} ngày hiệu lực</span>
              </div>

              <div style={{ background: 'var(--bg-soft)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>Giá gói:</span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>{formatCurrency(pkg.price)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted" style={{ fontSize: '0.9rem' }}>Quyền lợi:</span>
                  <span style={{ fontWeight: 700, color: 'var(--success)' }}>Giảm {pkg.service_fee_reduction_percent}% phí DV</span>
                </div>
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, minHeight: '3rem' }}>
                {pkg.description || 'Chưa có mô tả quyền lợi cho gói này.'}
              </p>

              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  <Clock size={14} />
                  Cập nhật: {new Date(pkg.updated_at).toLocaleDateString('vi-VN')}
                </div>
                {pkg.is_active ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 700 }}>
                    <CheckCircle2 size={14} />
                    ĐANG KINH DOANH
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--error)', fontSize: '0.75rem', fontWeight: 700 }}>
                    <AlertCircle size={14} />
                    ĐÃ NGỪNG BÁN
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
         }}>
          <div className="glass animate-scale-in" onClick={(e) => e.stopPropagation()} style={{ 
            width: '100%', 
            maxWidth: '600px', 
            borderRadius: '32px', 
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: 'white' }}>
                  <Plus size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{editingPackage ? 'Cập nhật Gói thuê bao' : 'Thêm Gói thuê bao mới'}</h2>
              </div>
              <button className="btn-icon" onClick={handleCloseModal}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Tên gói thuê bao *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="VD: Gói tháng Kim Cương" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Loại gói</label>
                  <select 
                    className="form-control"
                    value={formData.package_type}
                    onChange={(e) => setFormData({...formData, package_type: e.target.value})}
                  >
                    <option value="daily">Ngày (Daily)</option>
                    <option value="weekly">Tuần (Weekly)</option>
                    <option value="monthly">Tháng (Monthly)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Thời hạn (Ngày) *</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ paddingLeft: '40px' }}
                      placeholder="VD: 30" 
                      value={formData.duration_days}
                      onChange={(e) => setFormData({...formData, duration_days: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Giá gói (VND) *</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ paddingLeft: '40px' }}
                      placeholder="VD: 500000" 
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Giảm phí dịch vụ (%)</label>
                  <div style={{ position: 'relative' }}>
                    <Percent size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ paddingLeft: '40px' }}
                      max="100"
                      min="0"
                      value={formData.service_fee_reduction_percent}
                      onChange={(e) => setFormData({...formData, service_fee_reduction_percent: e.target.value})}
                    />
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Mô tả quyền lợi</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="Mô tả các quyền lợi mà tài xế nhận được khi mua gói này..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-glass" style={{ flex: 1 }} onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  {editingPackage ? 'Cập nhật cấu hình' : 'Lưu gói thuê bao'}
                </button>
              </div>
            </form>

            <div style={{ padding: '1.5rem 2rem', background: 'rgba(0,0,0,0.1)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Info size={18} className="text-primary" />
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Sau khi lưu, gói sẽ hiển thị ngay lập tức trên ứng dụng của tài xế đối tác. 
                Gói đã được tài xế mua sẽ không bị ảnh hưởng nếu bạn thay đổi thông tin sau này.
              </p>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .opacity-60 { opacity: 0.6; }
        .modal-overlay { animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255,255,255,0.1);
          border-left-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .form-label {
          font-size: 0.8rem;
          font-weight: 750;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
          display: block;
        }
        .form-control {
          width: 100%;
          background: var(--bg-soft);
          border: 1.5px solid var(--border);
          border-radius: 14px;
          padding: 0.85rem 1.15rem;
          font-size: 0.9rem;
          color: var(--text);
          font-weight: 600;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          outline: none;
        }
        .form-control:focus {
          background: var(--card);
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(0, 73, 172, 0.1);
        }
        textarea.form-control {
          resize: vertical;
          min-height: 80px;
        }
      `}} />
    </div>
  );
};

export default SubscriptionPackageConfig;
