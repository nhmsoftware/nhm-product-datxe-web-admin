import React, { useState, useEffect } from 'react';
import { voucherService } from '../../services/voucherService';
import { adminService } from '../../services/adminService';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  UserPlus, 
  Power,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { VOUCHER_SERVICE_LABEL_MAP, VOUCHER_SERVICE_OPTIONS } from '../../constants/serviceCatalog';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN');
};

const VoucherList = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 20 });
  const [filters, setFilters] = useState({ keyword: '', status: '' });
  
  // Modal states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    service_type: 5,
    discount_type: 2,
    discount_value: '',
    min_order_amount: 0,
    max_discount_amount: '',
    valid_from: '',
    valid_until: '',
    total_usage_limit: '',
    is_active: true,
    description: ''
  });

  // Assign states
  const [searchUserKeyword, setSearchUserKeyword] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, [pagination.current_page, filters.status]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await voucherService.getVouchers({
        page: pagination.current_page,
        code: filters.keyword,
        is_active: filters.status === 'active' ? true : (filters.status === 'inactive' ? false : undefined),
        per_page: 20
      });
      setVouchers(res.data.items || []);
      setPagination({
        current_page: res.data.pagination.current_page,
        last_page: res.data.pagination.last_page,
        total: res.data.pagination.total
      });
    } catch (error) {
      toast.error('Không thể tải danh sách voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, current_page: 1 });
    fetchVouchers();
  };

  const handleCreate = () => {
    setCurrentVoucher(null);
    setFormData({
      code: '',
      name: '',
      service_type: 5,
      discount_type: 2,
      discount_value: '',
      min_order_amount: 0,
      max_discount_amount: '',
      valid_from: '',
      valid_until: '',
      total_usage_limit: '',
      is_active: true,
      description: ''
    });
    setShowFormModal(true);
  };

  const handleEdit = (voucher) => {
    setCurrentVoucher(voucher);
    setFormData({
      code: voucher.code,
      name: voucher.name || '',
      service_type: voucher.service_type,
      discount_type: voucher.discount_type,
      discount_value: voucher.discount_value,
      min_order_amount: voucher.min_order_amount,
      max_discount_amount: voucher.max_discount_amount || '',
      valid_from: voucher.valid_from.split(' ')[0] + 'T' + voucher.valid_from.split(' ')[1].substring(0, 5),
      valid_until: voucher.valid_until.split(' ')[0] + 'T' + voucher.valid_until.split(' ')[1].substring(0, 5),
      total_usage_limit: voucher.total_usage_limit || '',
      is_active: voucher.is_active,
      description: voucher.description || ''
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Custom Frontend Validation
    if (!formData.code) return toast.error('Vui lòng nhập mã voucher');
    if (!formData.name) return toast.error('Vui lòng nhập tên voucher');
    if (!formData.discount_value) return toast.error('Vui lòng nhập giá trị giảm');
    if (Number(formData.discount_value) < 0) return toast.error('Giá trị giảm không được là số âm');
    if (Number(formData.min_order_amount) < 0) return toast.error('Đơn tối thiểu không được là số âm');
    if (formData.total_usage_limit && Number(formData.total_usage_limit) < 0) return toast.error('Giới hạn sử dụng không được là số âm');
    if (!formData.valid_from) return toast.error('Vui lòng chọn ngày bắt đầu');
    if (!formData.valid_until) return toast.error('Vui lòng chọn ngày kết thúc');
    
    const payload = { ...formData };
    if (payload.discount_type === 2 && Number(payload.discount_value) > 100) {
      toast.error('Phần trăm giảm giá không được lớn hơn 100%');
      return;
    }

    try {
      if (!payload.max_discount_amount) delete payload.max_discount_amount;
      if (!payload.total_usage_limit) delete payload.total_usage_limit;

      if (currentVoucher) {
        await voucherService.updateVoucher(currentVoucher.id, payload);
        toast.success('Cập nhật voucher thành công');
      } else {
        await voucherService.createVoucher(payload);
        toast.success('Tạo voucher thành công');
      }
      setShowFormModal(false);
      fetchVouchers();
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        const firstError = Object.values(errorData.errors)[0][0];
        toast.error(firstError);
      } else {
        toast.error(errorData?.message || 'Có lỗi xảy ra');
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa Voucher?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#004da0', // var(--primary)
      confirmButtonText: 'Xóa ngay!',
      cancelButtonText: 'Hủy',
      background: 'var(--card)',
      color: 'var(--text)',
      borderRadius: '20px'
    });

    if (result.isConfirmed) {
      try {
        await voucherService.deleteVoucher(id);
        toast.success('Xóa voucher thành công');
        fetchVouchers();
      } catch (error) {
        toast.error('Không thể xóa voucher');
      }
    }
  };

  const handleDeactivate = async (id) => {
    const result = await Swal.fire({
      title: 'Vô hiệu hóa Voucher?',
      text: "Voucher này sẽ không thể sử dụng cho các đơn hàng mới!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--primary)',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Đồng ý!',
      cancelButtonText: 'Hủy',
      background: 'var(--card)',
      color: 'var(--text)',
      borderRadius: '20px'
    });

    if (result.isConfirmed) {
      try {
        await voucherService.deactivateVoucher(id);
        toast.success('Đã vô hiệu hóa voucher');
        fetchVouchers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Không thể vô hiệu hóa');
      }
    }
  };

  const openAssignModal = (voucher) => {
    setCurrentVoucher(voucher);
    setSearchUserKeyword('');
    setFoundUsers([]);
    setSelectedUserIds([]);
    setHasSearched(false);
    setShowAssignModal(true);
  };

  const searchUsers = async () => {
    if (!searchUserKeyword) return;
    try {
      setSearchingUsers(true);
      setHasSearched(true);
      const res = await adminService.getCustomers({ keyword: searchUserKeyword });
      setFoundUsers(res.data.data || []);
    } catch (error) {
      toast.error('Lỗi khi tìm kiếm người dùng');
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleAssign = async () => {
    if (selectedUserIds.length === 0) {
      toast.error('Vui lòng chọn ít nhất một người dùng');
      return;
    }
    try {
      const res = await voucherService.assignVoucher({
        voucher_id: currentVoucher.id,
        user_ids: selectedUserIds
      });

      if (res.success === false) {
        Swal.fire({
          icon: 'error',
          title: 'Gán voucher thất bại',
          text: res.message || 'Người dùng đã có voucher này hoặc lỗi không xác định',
          confirmButtonColor: '#ef4444',
        });
        return;
      }
      
      const match = res.message?.match(/\(([^)]+)\)/);
      const resultText = match ? match[0] : res.message;
      
      setShowAssignModal(false);
      setSelectedUserIds([]);
      setFoundUsers([]);
      setSearchUserKeyword('');
      setHasSearched(false);

      Swal.fire({
        icon: 'success',
        title: 'Gán voucher thành công',
        text: `${resultText}`,
        confirmButtonColor: 'var(--primary)',
        timer: 4000
      });
    } catch (error) {
      console.error('Assign voucher error:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi gán voucher';
      Swal.fire({
        icon: 'error',
        title: 'Lỗi hệ thống',
        text: errorMessage,
        confirmButtonColor: '#ef4444',
      });
    }
  };

  const toggleUserSelection = (userId) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter(id => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  return (
    <div className="vouchers-page">
      <div className="page-header-container">
        <div>
          <h1 className="page-title">Quản lý Voucher</h1>
          <p className="text-muted">Tạo và quản lý các chương trình giảm giá </p>
        </div>
        <button className="btn btn-premium" onClick={handleCreate}>
          <Plus size={20} />
          Tạo Voucher Mới
        </button>
      </div>

      <div className="filter-section">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', width: '100%' }}>
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Tìm theo mã hoặc tên voucher..." 
              className="input"
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
          </div>
          <select 
            className="select-input"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
          </select>
          <button type="submit" className="btn btn-primary" style={{ minWidth: '140px' }}>
            Tìm kiếm
          </button>
        </form>
      </div>

      <div className="table-container glass shadow-xl">
        <table>
          <thead>
            <tr>
              <th>Thông tin Voucher</th>
              <th>Loại dịch vụ</th>
              <th>Giá trị giảm</th>
              <th>Thời hạn</th>
              <th>Sử dụng</th>
              <th>Trạng thái</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan="7"><div className="skeleton h-12 w-full"></div></td>
                </tr>
              ))
            ) : vouchers.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">Không tìm thấy voucher nào</td>
              </tr>
            ) : (
              vouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-bg-soft/50 transition-all">
                  <td>
                    <div className="voucher-info">
                      <div className="voucher-icon-box">
                        <Ticket size={22} />
                      </div>
                      <div>
                        <div className="font-bold text-lg">{voucher.code}</div>
                        <div className="text-xs text-muted truncate max-w-[200px]">{voucher.name || voucher.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-glass">
                      {VOUCHER_SERVICE_LABEL_MAP[voucher.service_type] || 'Không xác định'}
                    </span>
                  </td>
                  <td>
                    <div className="font-semibold text-primary">
                      {voucher.discount_type === 2 
                        ? `${voucher.discount_value}%` 
                        : `${Number(voucher.discount_value).toLocaleString()}đ`}
                    </div>
                    <div className="text-[10px] text-muted">Tối thiểu: {Number(voucher.min_order_amount).toLocaleString()}đ</div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-muted" />
                        <span>{formatDate(voucher.valid_from)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ArrowRight size={12} className="text-muted" />
                        <span className={new Date(voucher.valid_until) < new Date() ? 'text-error' : ''}>
                          {formatDate(voucher.valid_until)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="usage-progress-container">
                      <div className="text-sm">
                        <span className="font-bold">{voucher.used_count}</span>
                        <span className="text-muted"> / {voucher.total_usage_limit || '∞'}</span>
                      </div>
                      <div className="progress-bar-bg">
                        <div 
                          className="progress-bar-fill" 
                          style={{ width: `${voucher.total_usage_limit ? Math.min((voucher.used_count / voucher.total_usage_limit) * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${voucher.is_active ? 'badge-success' : 'badge-error'}`}>
                      {voucher.is_active ? 'Đang chạy' : 'Đã dừng'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons justify-end">
                      <button className="btn-icon" onClick={() => openAssignModal(voucher)} title="Gán cho User">
                        <UserPlus size={16} />
                      </button>
                      <button className="btn-icon" onClick={() => handleEdit(voucher)} title="Chỉnh sửa">
                        <Edit2 size={16} />
                      </button>
                      {voucher.is_active && (
                        <button className="btn-icon error" onClick={() => handleDeactivate(voucher.id)} title="Vô hiệu hóa">
                          <Power size={16} />
                        </button>
                      )}
                      <button className="btn-icon error" onClick={() => handleDelete(voucher.id)} title="Xóa">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-wrapper" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '1.5rem', 
        padding: '1rem 1.5rem', 
        background: 'var(--bg-soft)', 
        border: '1px solid var(--border)',
        borderRadius: '16px'
      }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Hiển thị <b>{(pagination.current_page - 1) * 20 + 1} - {Math.min(pagination.current_page * 20, pagination.total)}</b> trên tổng số <b>{pagination.total}</b> voucher
        </div>
        <div className="pagination-actions" style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn-page" 
            disabled={pagination.current_page === 1}
            onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page - 1 }))}
          >
            <ChevronLeft size={16} />
          </button>
          
          {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
            let pageNum;
            if (pagination.last_page <= 5) pageNum = i + 1;
            else if (pagination.current_page <= 3) pageNum = i + 1;
            else if (pagination.current_page >= pagination.last_page - 2) pageNum = pagination.last_page - 4 + i;
            else pageNum = pagination.current_page - 2 + i;

            return (
              <button 
                key={pageNum}
                className={`btn-page ${pagination.current_page === pageNum ? 'active' : ''}`}
                onClick={() => setPagination(prev => ({ ...prev, current_page: pageNum }))}
              >
                {pageNum}
              </button>
            );
          })}

          <button 
            className="btn-page"
            disabled={pagination.current_page === pagination.last_page}
            onClick={() => setPagination(prev => ({ ...prev, current_page: prev.current_page + 1 }))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Form Modal (Create/Edit) */}
      {showFormModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">{currentVoucher ? 'Chỉnh sửa Voucher' : 'Tạo Voucher Mới'}</h2>
              <button className="btn-icon" onClick={() => setShowFormModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body form-grid">
                <div className="col-span-1">
                  <label className="label">Mã Voucher</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="VD: WELCOME50"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    style={{ paddingLeft: '1rem' }}
                    disabled={currentVoucher && currentVoucher.used_count > 0}
                  />
                  <p className="helper-text">Mã viết hoa, không dấu, không khoảng trắng.</p>
                </div>
                <div className="col-span-1">
                  <label className="label">Tên Voucher</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="VD: Giảm giá cho thành viên mới"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    style={{ paddingLeft: '1rem' }}
                  />
                  <p className="helper-text">Tên hiển thị cho người dùng.</p>
                </div>
                <div className="col-span-1">
                  <label className="label">Loại dịch vụ</label>
                  <select 
                    className="select-input w-full"
                    value={formData.service_type}
                    onChange={(e) => setFormData({...formData, service_type: parseInt(e.target.value)})}
                    style={{ width: '100%' }}
                  >
                    {VOUCHER_SERVICE_OPTIONS.map((service) => (
                      <option key={service.id} value={service.id}>{service.label}</option>
                    ))}
                  </select>
                  <p className="helper-text">Dịch vụ được phép áp dụng.</p>
                </div>
                <div className="col-span-1">
                  <label className="label">Loại giảm giá</label>
                  <select 
                    className="select-input w-full"
                    value={formData.discount_type}
                    onChange={(e) => setFormData({...formData, discount_type: parseInt(e.target.value)})}
                    disabled={currentVoucher && currentVoucher.used_count > 0}
                    style={{ width: '100%' }}
                  >
                    <option value="2">Phần trăm (%)</option>
                    <option value="1">Số tiền cố định (đ)</option>
                  </select>
                  <p className="helper-text">Hình thức giảm giá.</p>
                </div>
                <div className="col-span-1">
                  <label className="label">Giá trị giảm</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={formData.discount_value}
                    onChange={(e) => setFormData({...formData, discount_value: e.target.value})}
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    style={{ paddingLeft: '1rem' }}
                    disabled={currentVoucher && currentVoucher.used_count > 0}
                    max={formData.discount_type === 2 ? 100 : undefined}
                    min="0"
                  />
                  <p className="helper-text">{formData.discount_type === 2 ? 'Tối đa 100%.' : 'Nhập số tiền VNĐ.'}</p>
                </div>
                <div className="col-span-1">
                  <label className="label">Đơn tối thiểu</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})}
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    style={{ paddingLeft: '1rem' }}
                    min="0"
                  />
                  <p className="helper-text">Đơn hàng tối thiểu để được áp dụng.</p>
                </div>
                <div className="col-span-1">
                  <label className="label">Bắt đầu</label>
                  <input 
                    type="datetime-local" 
                    className="input" 
                    value={formData.valid_from}
                    onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                    style={{ paddingLeft: '1rem' }}
                  />
                  <p className="helper-text">Thời điểm bắt đầu có hiệu lực.</p>
                </div>
                <div className="col-span-1">
                  <label className="label">Kết thúc</label>
                  <input 
                    type="datetime-local" 
                    className="input" 
                    value={formData.valid_until}
                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                    style={{ paddingLeft: '1rem' }}
                  />
                  <p className="helper-text">Thời điểm hết hạn voucher.</p>
                </div>
                <div className="col-span-1">
                  <label className="label">Giới hạn sử dụng</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={formData.total_usage_limit}
                    onChange={(e) => setFormData({...formData, total_usage_limit: e.target.value})}
                    onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                    style={{ paddingLeft: '1rem' }}
                    min="0"
                  />
                  <p className="helper-text">Để trống nếu không giới hạn.</p>
                </div>
                <div className="col-span-1 flex items-center gap-2 pt-8" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '2.5rem' }}>
                  <input 
                    type="checkbox" 
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="is_active" className="font-semibold">Kích hoạt Voucher</label>
                </div>
                <div className="full-width">
                  <label className="label">Mô tả</label>
                  <textarea 
                    className="input" 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    style={{ height: '80px', paddingLeft: '1rem' }}
                  ></textarea>
                  <p className="helper-text">Ghi chú thêm về điều kiện sử dụng.</p>
                </div>
              </div>
              <div className="modal-footer" style={{ 
                padding: '1.5rem', 
                borderTop: '1px solid var(--border)', 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: '0.75rem', 
                background: 'var(--card)',
                borderBottomLeftRadius: '24px',
                borderBottomRightRadius: '24px'
              }}>
                <button type="button" className="btn btn-glass" onClick={() => setShowFormModal(false)} style={{ minWidth: '100px' }}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0 2.5rem' }}>Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">Gán Voucher cho Người dùng</h2>
              <button className="btn-icon" onClick={() => setShowAssignModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                marginBottom: '1.5rem', 
                padding: '1.25rem', 
                background: 'var(--bg-soft)', 
                borderRadius: '16px',
                border: '1px solid var(--border)'
              }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: 'white', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                }}>
                  <Ticket className="text-primary" size={24} />
                </div>
                <div>
                  <div className="font-bold" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{currentVoucher?.code}</div>
                  <div className="text-sm text-muted">{currentVoucher?.name}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="label">Tìm kiếm khách hàng</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div className="search-wrapper">
                    <Search className="search-icon" size={18} />
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="SĐT, Email hoặc ID..."
                      value={searchUserKeyword}
                      onChange={(e) => {
                        setSearchUserKeyword(e.target.value);
                        setHasSearched(false);
                      }}
                      onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                    />
                  </div>
                  <button className="btn btn-primary" onClick={searchUsers} disabled={searchingUsers} style={{ padding: '0 1.5rem' }}>
                    {searchingUsers ? '...' : 'Tìm'}
                  </button>
                </div>
              </div>

                <div className="search-results-container" style={{ 
                  maxHeight: '320px', 
                  overflowY: 'auto', 
                  overflowX: 'hidden', 
                  marginBottom: '1.5rem',
                  paddingRight: '4px'
                }}>
                  {foundUsers.length > 0 ? (
                    foundUsers.map(user => (
                      <div 
                        key={user.id} 
                        className={`user-item ${selectedUserIds.includes(user.id) ? 'selected' : ''}`}
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <div style={{ flex: 1 }}>
                          <div className="font-bold" style={{ fontSize: '1rem' }}>{user.full_name || 'Khách hàng'}</div>
                          <div className="text-xs text-muted" style={{ marginTop: '4px', fontSize: '0.8rem' }}>
                            {user.phone} • {user.email || 'N/A'}
                          </div>
                        </div>
                        <div className="check-circle">
                          {selectedUserIds.includes(user.id) && <CheckCircle2 size={16} />}
                        </div>
                      </div>
                    ))
                  ) : hasSearched && !searchingUsers ? (
                    <div className="text-center text-muted py-8" style={{ background: 'var(--bg-soft)', borderRadius: '12px' }}>
                      Không tìm thấy kết quả
                    </div>
                  ) : (
                    <div className="text-center text-muted py-8" style={{ border: '2px dashed var(--border)', borderRadius: '12px' }}>
                      Nhập thông tin (SĐT, Email...) để tìm khách hàng
                    </div>
                  )}
                </div>

              {selectedUserIds.length > 0 && (
                <div className="p-3 bg-success/10 text-success rounded-xl text-sm mb-6 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Đã chọn {selectedUserIds.length} người dùng
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-glass" onClick={() => setShowAssignModal(false)} style={{ flex: 1 }}>Hủy</button>
                <button className="btn btn-primary" onClick={handleAssign} disabled={selectedUserIds.length === 0} style={{ flex: 1 }}>Xác nhận gán</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .vouchers-page {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          border-radius: 14px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          gap: 0.6rem;
          border: none;
          font-size: 0.9rem;
          font-family: inherit;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 15px rgba(67, 97, 238, 0.25);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.35);
          filter: brightness(1.1);
        }

        .btn-premium {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 15px rgba(67, 97, 238, 0.25);
        }

        .btn-premium:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(245, 158, 11, 0.35);
          filter: brightness(1.1);
        }

        .btn-glass {
          background: var(--bg-soft);
          color: var(--text);
          border: 1px solid var(--border);
        }

        .btn-glass:hover {
          background: var(--border);
          transform: translateY(-2px);
        }

        .btn-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: var(--bg-soft);
          color: var(--text-muted);
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        
        .btn-page {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--text-muted);
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-page:hover:not(:disabled) {
          border-color: var(--primary);
          color: var(--primary);
        }
        .btn-page.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }
        .btn-page:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-icon:hover {
          background: white;
          color: var(--primary);
          border-color: var(--primary);
          transform: scale(1.1);
        }

        .btn-icon.error:hover {
          background: #fef2f2;
          color: #ef4444;
          border-color: #fecaca;
        }

        .page-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .filter-section {
          display: flex;
          gap: 1rem;
          align-items: center;
          background: var(--card);
          padding: 1.5rem;
          border-radius: 20px;
          margin-bottom: 2rem;
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }

        .search-wrapper {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          padding-left: 3rem;
          background: var(--bg-soft);
          border: 1px solid var(--border);
          border-radius: 12px;
          outline: none;
          transition: var(--transition);
          font-size: 0.95rem;
          color: var(--text);
          font-family: inherit;
          line-height: 1.5;
        }

        .input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          background: var(--card);
        }

        .select-input {
          padding: 0.75rem 2.5rem 0.75rem 1.25rem;
          background: var(--bg-soft);
          border: 1px solid var(--border);
          border-radius: 12px;
          outline: none;
          min-width: 180px;
          color: var(--text);
          font-family: inherit;
          line-height: 1.5;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.2rem;
          transition: var(--transition);
        }

        .select-input:hover {
          border-color: var(--primary);
          background-color: var(--card);
        }

        .select-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .voucher-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .voucher-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(99, 102, 241, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          flex-shrink: 0;
        }

        .usage-progress-container {
          width: 120px;
        }

        .progress-bar-bg {
          width: 100%;
          height: 6px;
          background: var(--bg-soft);
          border-radius: 10px;
          margin-top: 0.5rem;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 10px;
          transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text);
          line-height: 1.6;
          overflow: visible;
          padding: 2px 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .full-width {
          grid-column: span 2;
        }

        .user-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: var(--bg-soft);
          border: 1px solid var(--border);
          border-radius: 14px;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          box-sizing: border-box;
        }

        .user-item:hover {
          background: white;
          border-color: var(--primary);
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08);
        }

        .user-item.selected {
          background: rgba(99, 102, 241, 0.08);
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
        }

        .check-circle {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
        }

        .selected .check-circle {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .helper-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.35rem;
          margin-left: 0.25rem;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default VoucherList;
