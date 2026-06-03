import React, { useState, useEffect } from 'react';
import { Search, Filter, Car, User, MapPin, Clock, Info, Phone, Package, Send, Loader2, MoreVertical, Download, SearchX } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ChauffeurRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    keyword: '',
    status: '',
    page: 1,
    per_page: 15
  });
  const [pagination, setPagination] = useState({
    total: 0,
    current_page: 1,
    last_page: 1
  });

  useEffect(() => {
    fetchRides();
  }, [filters.status, filters.page]);

  const fetchRides = async () => {
    setLoading(true);
    try {
      const response = await api.get('/v1/admin/chauffeur/rides', { params: filters });
      setRides(response.data.data.data || []);
      setPagination({
        total: response.data.data.total,
        current_page: response.data.data.current_page,
        last_page: response.data.data.last_page
      });
    } catch (error) {
      toast.error('Không thể tải danh sách chuyến xe Lái hộ.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (rides.length === 0) {
      toast.error('Không có dữ liệu để xuất!');
      return;
    }
    
    toast.success('Đang chuẩn bị dữ liệu xuất Excel...');
    
    // Simple CSV export logic
    const headers = ['ID', 'Khách hàng', 'SĐT Khách', 'Biển số', 'Hãng xe', 'Điểm đón', 'Điểm đến', 'Giá cước', 'Trạng thái', 'Ngày tạo'];
    const data = rides.map(r => [
      r.id,
      r.customer_name,
      r.customer_phone,
      r.chauffeur_license_plate,
      r.chauffeur_brand,
      r.pickup_address.replace(/,/g, ' '),
      r.destination_address.replace(/,/g, ' '),
      r.final_fare,
      r.status,
      new Date(r.created_at).toLocaleString('vi-VN')
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers, ...data].map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `danh_sach_lai_ho_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'waiting': return <span className="badge badge-warning">Chờ tài xế</span>;
      case 'assigned': return <span className="badge badge-success" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Đang thực hiện</span>;
      case 'completed': return <span className="badge badge-success">Hoàn thành</span>;
      case 'canceled': return <span className="badge badge-error">Đã hủy</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="dispatch-page animate-fade-in">
      <div className="dispatch-header">
        <div>
          <h1 className="page-title">Quản lý Lái hộ</h1>
          <p className="page-subtitle">Theo dõi và điều phối các yêu cầu tài xế lái hộ (Chauffeur)</p>
        </div>
        
        <div className="header-actions">
           <button 
            onClick={handleExport}
            className="btn btn-primary px-6 flex items-center gap-2"
          >
            <Download size={18} />
            Xuất Excel
          </button>
        </div>
      </div>

      {/* Filters Board - Style from Services.jsx */}
      <div className="glass filter-board mb-6">
        <div className="filter-wrapper">
          <div className="tabs-container" style={{ margin: 0 }}>
            <button 
              className={`tab-item ${filters.status === '' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, status: '', page: 1})}
            >
              Tất cả
            </button>
            <button 
              className={`tab-item ${filters.status === 'waiting' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, status: 'waiting', page: 1})}
            >
              Chờ tài xế
            </button>
            <button 
              className={`tab-item ${filters.status === 'assigned' ? 'active' : ''}`}
              onClick={() => setFilters({...filters, status: 'assigned', page: 1})}
            >
              Đang thực hiện
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
             <div className="search-box">
                <Search className="search-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Tìm theo ID, địa chỉ, SĐT..." 
                  className="search-input"
                  value={filters.keyword}
                  onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                  onKeyPress={(e) => e.key === 'Enter' && fetchRides()}
                />
              </div>
          </div>
        </div>
      </div>

      {/* Table Container - Style from Services.jsx */}
      <div className="table-container glass overflow-hidden">
        <table className="custom-table w-full">
          <thead>
            <tr>
              <th className="px-6 py-4">Mã chuyến</th>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Thông tin Xe Khách</th>
              <th className="px-6 py-4">Lộ trình (Lấy &rarr; Giao)</th>
              <th className="px-6 py-4">Giá cước</th>
              <th className="px-6 py-4 text-center">Trạng thái</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan="7" className="px-6 py-4 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div></td></tr>
              ))
            ) : rides.length > 0 ? (
              rides.map((ride) => (
                <tr key={ride.id} className="hover-row">
                  <td className="px-6 py-4">
                    <div className="info-title">#{ride.id}</div>
                    <div className="info-subtitle" style={{ fontSize: '0.7rem' }}>{new Date(ride.created_at).toLocaleTimeString('vi-VN')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="customer-info">
                      <div className="customer-avatar" style={{ background: '#6366f1' }}>
                        <User size={20} />
                      </div>
                      <div>
                        <div className="info-title">{ride.customer_name}</div>
                        <div className="info-subtitle flex items-center gap-1">
                          <Phone size={12} /> {ride.customer_phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-sm">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit mb-1 border border-blue-100">
                        {ride.chauffeur_license_plate}
                      </span>
                      <span className="text-xs text-gray-600">
                        {ride.chauffeur_brand} - {ride.chauffeur_color}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="route-info">
                      <div className="route-item">
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', marginRight: '8px', flexShrink: 0 }}></div>
                        <span className="route-text" title={ride.pickup_address}>{ride.pickup_address}</span>
                      </div>
                      <div className="route-item" style={{ marginTop: '4px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', marginRight: '8px', flexShrink: 0 }}></div>
                        <span className="route-text" title={ride.destination_address}>{ride.destination_address}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="price-info">
                      <div className="fare-amount" style={{ color: 'var(--text)', fontWeight: 800 }}>
                        {ride.final_fare.toLocaleString()}đ
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(ride.status)}
                    {ride.driver_name && (
                       <div style={{ fontSize: '0.7rem', marginTop: '4px', color: '#2563eb', fontWeight: 600 }}>
                          <Car size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {ride.driver_name}
                       </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ padding: '80px 0', textAlign: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '12px'
                  }}>
                    <SearchX size={60} strokeWidth={1.5} style={{ opacity: 0.2, color: '#6366f1' }} />
                    <span style={{ 
                      fontSize: '15px', 
                      color: '#94a3b8', 
                      fontWeight: 500,
                      fontStyle: 'italic'
                    }}>
                      Không tìm thấy chuyến xe nào phù hợp
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Phân trang */}
        {pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Hiển thị {rides.length} / {pagination.total} chuyến
            </span>
            <div className="flex gap-2 items-center">
              <button
                disabled={pagination.current_page === 1}
                onClick={() => setFilters({ ...filters, page: pagination.current_page - 1 })}
                className="px-4 py-2 border rounded-lg bg-white text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Trước
              </button>
              <span className="text-sm font-medium px-2 text-gray-600">
                Trang {pagination.current_page} / {pagination.last_page}
              </span>
              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => setFilters({ ...filters, page: pagination.current_page + 1 })}
                className="px-4 py-2 border rounded-lg bg-white text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChauffeurRides;
