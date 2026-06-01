import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import marketingService from '../../services/marketingService';
import { X, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import './Marketing.css';

const BannerList = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBannerId, setCurrentBannerId] = useState(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    label: '',
    tag: '',
    action_url: '',
    status: 1,
    order: 0,
    image_file: null,
  });

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const params = { page, per_page: 20 };
      if (statusFilter) params.status = statusFilter;
      
      const res = await marketingService.getBanners(params);
      if (res.success) {
        setBanners(res.data.data || []);
        setLastPage(res.data.meta?.last_page || res.data.last_page || 1);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [page, statusFilter]);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setIsEditing(true);
      setCurrentBannerId(banner.id);
      setFormData({
        title: banner.title,
        description: banner.description || '',
        label: banner.label || '',
        tag: banner.tag || '',
        action_url: banner.action_url || '',
        status: banner.status || 1,
        order: banner.order || 0,
        image_file: null, // Don't set the file, it's string URL from API
        image_url: banner.image_url, // for preview
        image_preview: null
      });
    } else {
      setIsEditing(false);
      setCurrentBannerId(null);
      setFormData({
        title: '',
        description: '',
        label: '',
        tag: '',
        action_url: '',
        status: 1,
        order: 0,
        image_file: null,
        image_preview: null,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ 
        ...formData, 
        image_file: file,
        image_preview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      if (formData.description) data.append('description', formData.description);
      if (formData.label) data.append('label', formData.label);
      if (formData.tag) data.append('tag', formData.tag);
      if (formData.action_url) data.append('action_url', formData.action_url);
      data.append('status', formData.status);
      data.append('order', formData.order !== '' ? formData.order : 0);
      if (formData.image_file) {
        data.append('image', formData.image_file);
      }
      
      if (isEditing) {
        data.append('_method', 'PUT'); // For Laravel multipart/form-data PUT
        const res = await marketingService.updateBanner(currentBannerId, data);
        if (res.success) toast.success('Cập nhật Banner thành công');
      } else {
        const res = await marketingService.createBanner(data);
        if (res.success) toast.success('Tạo Banner thành công');
      }
      setShowModal(false);
      fetchBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu Banner');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa Banner?',
      text: "Hành động này không thể hoàn tác!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy',
      background: 'var(--bg)',
      color: 'var(--text)',
    });

    if (result.isConfirmed) {
      try {
        const res = await marketingService.deleteBanner(id);
        if (res.success) {
          toast.success('Đã xóa Banner');
          fetchBanners();
        }
      } catch (error) {
        toast.error('Lỗi khi xóa Banner');
      }
    }
  };

  return (
    <div className="marketing-page">
      <div className="marketing-header">
        <div>
          <h1 className="marketing-title">Quản lý Banners</h1>
          <p className="marketing-subtitle">Quản lý các banner quảng cáo trên ứng dụng di động</p>
        </div>
        <div className="marketing-actions">
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Thêm Banner
          </button>
        </div>
      </div>

      <div className="marketing-filters glass">
        <select 
          className="status-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="1">Đang hoạt động</option>
          <option value="2">Đã tắt</option>
        </select>
      </div>

      <div className="table-container glass">
        {loading ? (
          <div className="p-8 text-center text-muted animate-pulse">Đang tải dữ liệu...</div>
        ) : banners.length === 0 ? (
          <div className="empty-state">Không tìm thấy Banner nào.</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hình ảnh</th>
                  <th>Loại banner</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner) => (
                  <tr key={banner.id} className="glass-hover">
                    <td><span className="text-muted text-sm">{banner.id.substring(0, 8)}...</span></td>
                    <td>
                      <img src={banner.image_url} alt={banner.title} className="thumbnail-preview" />
                    </td>
                    <td className="font-semibold">{banner.title}</td>
                    <td>
                      <span className={`badge ${banner.status === 1 ? 'badge-success' : 'badge-error'}`}>
                        {banner.status === 1 ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-action btn-action-edit" onClick={() => handleOpenModal(banner)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-action btn-action-danger" onClick={() => handleDelete(banner.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination */}
            {lastPage > 1 && (
              <div className="pagination-wrapper">
                <span className="text-sm text-muted">Trang {page} / {lastPage}</span>
                <div className="pagination-actions">
                  <button 
                    className="btn-page" 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    className="btn-page" 
                    disabled={page === lastPage}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ color: '#000' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold" style={{ color: '#000' }}>{isEditing ? 'Sửa Banner' : 'Thêm Banner Mới'}</h2>
              <button className="btn-icon" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                
                {(formData.image_preview || (isEditing && formData.image_url)) && (
                  <div className="mb-4">
                    <label className="form-label" style={{ color: '#000' }}>
                      {formData.image_preview ? 'Hình ảnh xem trước' : 'Hình ảnh hiện tại'}
                    </label>
                    <img src={formData.image_preview || formData.image_url} alt="Preview" className="thumbnail-large" />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" style={{ color: '#000' }}>Loại banner *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#000' }}>Mô tả</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>



                <div className="form-group">
                  <label className="form-label" style={{ color: '#000' }}>Upload Hình ảnh banner {isEditing ? '(Tùy chọn nếu muốn đổi)' : '*'}</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    required={!isEditing}
                    onChange={handleFileChange}
                  />
                </div>



                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-glass" onClick={handleCloseModal}>Hủy</button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={18} style={{ marginRight: '0.5rem' }} /> Lưu Banner
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerList;
