import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import marketingService from '../../services/marketingService';
import './Marketing.css';

const NewsList = () => {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentNewsId, setCurrentNewsId] = useState(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all',
    status: 'published',
    image_file: null,
  });

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = { page, per_page: 20 };
      if (statusFilter) params.status = statusFilter;
      
      const res = await marketingService.getNews(params);
      if (res.success) {
        setNewsList(res.data.data);
        setLastPage(res.data.last_page);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách Tin tức');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [page, statusFilter]);

  const handleOpenModal = (news = null) => {
    if (news) {
      setIsEditing(true);
      setCurrentNewsId(news.id);
      setFormData({
        title: news.title,
        content: news.content,
        target_audience: news.target_audience,
        status: news.status,
        image_file: null,
        image_url: news.image_url
      });
    } else {
      setIsEditing(false);
      setCurrentNewsId(null);
      setFormData({
        title: '',
        content: '',
        target_audience: 'all',
        status: 'published',
        image_file: null,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image_file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('target_audience', formData.target_audience);
      data.append('status', formData.status);
      if (formData.image_file) {
        data.append('image', formData.image_file);
      }
      
      if (isEditing) {
        data.append('_method', 'PUT');
        const res = await marketingService.updateNews(currentNewsId, data);
        if (res.success) toast.success('Cập nhật Tin tức thành công');
      } else {
        const res = await marketingService.createNews(data);
        if (res.success) toast.success('Tạo Tin tức thành công');
      }
      setShowModal(false);
      fetchNews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi lưu Tin tức');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xóa Tin tức?',
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
        const res = await marketingService.deleteNews(id);
        if (res.success) {
          toast.success('Đã xóa Tin tức');
          fetchNews();
        }
      } catch (error) {
        toast.error('Lỗi khi xóa Tin tức');
      }
    }
  };

  return (
    <div className="marketing-page">
      <div className="marketing-header">
        <div>
          <h1 className="marketing-title">Quản lý Tin tức (News)</h1>
          <p className="marketing-subtitle">Quản lý các thông báo, bài viết dành cho người dùng / tài xế</p>
        </div>
        <div className="marketing-actions">
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <i className="fa-solid fa-plus mr-2"></i> Thêm Tin tức
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
          <option value="draft">Bản nháp (Draft)</option>
          <option value="published">Đã xuất bản (Published)</option>
          <option value="archived">Lưu trữ (Archived)</option>
        </select>
        <button className="btn btn-glass" onClick={() => fetchNews()}>
          <i className="fa-solid fa-rotate-right"></i>
        </button>
      </div>

      <div className="table-container glass">
        {loading ? (
          <div className="p-8 text-center text-muted animate-pulse">Đang tải dữ liệu...</div>
        ) : newsList.length === 0 ? (
          <div className="empty-state">Không tìm thấy bài viết nào.</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hình ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Đối tượng</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {newsList.map((item) => (
                  <tr key={item.id} className="glass-hover">
                    <td><span className="text-muted text-sm">{item.id.substring(0, 8)}...</span></td>
                    <td>
                      <img src={item.image_url} alt={item.title} className="thumbnail-preview" />
                    </td>
                    <td className="font-semibold">{item.title}</td>
                    <td>
                      <span className="badge badge-warning">
                        {item.target_audience.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        item.status === 'published' ? 'badge-success' : 
                        item.status === 'draft' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-action btn-action-edit" onClick={() => handleOpenModal(item)}>
                          <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="btn-action btn-action-danger" onClick={() => handleDelete(item.id)}>
                          <i className="fa-solid fa-trash"></i>
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
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  <button 
                    className="btn-page" 
                    disabled={page === lastPage}
                    onClick={() => setPage(page + 1)}
                  >
                    <i className="fa-solid fa-chevron-right"></i>
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
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-xl font-bold">{isEditing ? 'Sửa Tin tức' : 'Thêm Tin tức Mới'}</h2>
              <button className="btn-icon" onClick={handleCloseModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                
                {isEditing && formData.image_url && (
                  <div className="mb-4">
                    <label className="form-label">Hình ảnh hiện tại</label>
                    <img src={formData.image_url} alt="Current" className="thumbnail-large" />
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Tiêu đề bài viết *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nội dung chi tiết *</label>
                  <textarea 
                    className="form-control" 
                    required 
                    rows="5"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Upload Hình ảnh đại diện {isEditing ? '(Tùy chọn)' : '*'}</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    accept="image/*"
                    required={!isEditing}
                    onChange={handleFileChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Đối tượng hiển thị</label>
                    <select 
                      className="form-control"
                      value={formData.target_audience}
                      onChange={(e) => setFormData({...formData, target_audience: e.target.value})}
                    >
                      <option value="all">Tất cả (All)</option>
                      <option value="driver">Tài xế (Driver)</option>
                      <option value="customer">Khách hàng (Customer)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Trạng thái</label>
                    <select 
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="draft">Bản nháp (Draft)</option>
                      <option value="published">Đã xuất bản (Published)</option>
                      <option value="archived">Lưu trữ (Archived)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button type="button" className="btn btn-glass" onClick={handleCloseModal}>Hủy</button>
                  <button type="submit" className="btn btn-primary">
                    <i className="fa-solid fa-floppy-disk mr-2"></i> Lưu bài viết
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

export default NewsList;
