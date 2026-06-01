import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import marketingService from '../../services/marketingService';
import { X, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Save } from 'lucide-react';
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
    tag: 'all',
    status: 1,
    order: 0,
    image_file: null,
  });

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = { page, per_page: 20 };
      if (statusFilter) params.status = statusFilter;
      
      const res = await marketingService.getNews(params);
      if (res.success) {
        setNewsList(res.data.data || []);
        setLastPage(res.data.meta?.last_page || res.data.last_page || 1);
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
        tag: news.tag || 'all',
        status: news.status || 1,
        order: news.order || 0,
        image_file: null,
        image_url: news.image_url,
        image_preview: null
      });
    } else {
      setIsEditing(false);
      setCurrentNewsId(null);
      setFormData({
        title: '',
        content: '',
        tag: 'all',
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
      data.append('content', formData.content);
      data.append('tag', formData.tag);
      data.append('status', formData.status);
      data.append('order', formData.order !== '' ? formData.order : 0);
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
          <h1 className="marketing-title">Quản lý Tin tức</h1>
          <p className="marketing-subtitle">Quản lý các thông báo, bài viết dành cho người dùng / tài xế</p>
        </div>
        <div className="marketing-actions">
          <button className="btn btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={18} style={{ marginRight: '0.5rem' }} /> Thêm Tin tức
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
                  <th>Phân loại</th>
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
                        {item.tag === 'promotion' ? 'KHUYẾN MÃI' : item.tag === 'update' ? 'CẬP NHẬT' : 'TẤT CẢ'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        item.status === 1 ? 'badge-success' : 'badge-error'
                      }`}>
                        {item.status === 1 ? 'HOẠT ĐỘNG' : 'TẠM DỪNG'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn-action btn-action-edit" onClick={() => handleOpenModal(item)}>
                          <Edit size={16} />
                        </button>
                        <button className="btn-action btn-action-danger" onClick={() => handleDelete(item.id)}>
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
              <h2 className="text-xl font-bold" style={{ color: '#000' }}>{isEditing ? 'Sửa Tin tức' : 'Thêm Tin tức Mới'}</h2>
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
                  <label className="form-label" style={{ color: '#000' }}>Tiêu đề bài viết *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#000' }}>Nội dung chi tiết *</label>
                  <textarea 
                    className="form-control" 
                    required 
                    rows="5"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#000' }}>Upload Hình ảnh đại diện {isEditing ? '(Tùy chọn)' : '*'}</label>
                  <input 
                    type="file" 
                    className="form-control" 
                    required={!isEditing}
                    onChange={handleFileChange}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ color: '#000' }}>Phân loại (Tag)</label>
                    <select 
                      className="form-control"
                      value={formData.tag}
                      onChange={(e) => setFormData({...formData, tag: e.target.value})}
                    >
                      <option value="all">Tất cả</option>
                      <option value="promotion">Khuyến mãi</option>
                      <option value="update">Cập nhật</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#000' }}>Thứ tự hiển thị</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      required 
                      min="0"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: e.target.value === '' ? '' : parseInt(e.target.value)})}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#000' }}>Trạng thái</label>
                    <select 
                      className="form-control"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: parseInt(e.target.value)})}
                    >
                      <option value={1}>Hoạt động</option>
                      <option value={2}>Tạm dừng</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                  <button type="button" className="btn btn-glass" onClick={handleCloseModal}>Hủy</button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={18} style={{ marginRight: '0.5rem' }} /> Lưu bài viết
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
