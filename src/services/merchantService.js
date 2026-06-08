import api from './api';

const merchantService = {
  createMerchant: (formData) => {
    return api.post('/v1/admin/merchant', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getMerchants: (params) => {
    return api.get('/v1/admin/merchant', { params });
  },

  getMerchantDetail: (id) => {
    return api.get(`/v1/admin/merchant/${id}`);
  },

  updateMerchant: (id, formData) => {
    return api.post(`/v1/admin/merchant/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteMerchant: (id) => {
    return api.delete(`/v1/admin/merchant/${id}`);
  },

  approveMerchant: (id) => {
    return api.post(`/v1/admin/merchant/${id}/approve`);
  },

  rejectMerchant: (id, reason) => {
    return api.post(`/v1/admin/merchant/${id}/reject`, { reason });
  },

  toggleLock: (id, lock, reason = null, lockedDays = null) => {
    return api.post(`/v1/admin/merchant/${id}/toggle-lock`, { 
      lock, 
      reason, 
      locked_days: lockedDays 
    });
  },

  getMerchantMenu: (merchantId) => {
    return api.get(`/v1/admin/merchant/${merchantId}/menu`);
  },

  createMenuItem: (merchantId, data) => {
    return api.post(`/v1/admin/merchant/${merchantId}/menu/items`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  updateMenuItem: (merchantId, itemId, data) => {
    // If it contains a file, Laravel works best when we use POST and pass _method: 'PUT'
    if (data instanceof FormData && !data.has('_method')) {
      data.append('_method', 'PUT');
    }
    return api.post(`/v1/admin/merchant/${merchantId}/menu/items/${itemId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteMenuItem: (merchantId, itemId) => {
    return api.delete(`/v1/admin/merchant/${merchantId}/menu/items/${itemId}`);
  },

  updateMenuItemStatus: (merchantId, itemId, isAvailable) => {
    return api.patch(`/v1/admin/merchant/${merchantId}/menu/items/${itemId}/status`, {
      is_available: isAvailable
    });
  },

  getMenuLogs: (merchantId) => {
    return api.get(`/v1/admin/merchant/${merchantId}/menu/logs`);
  },

  importMenu: (merchantId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/v1/admin/merchant/${merchantId}/menu/import`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  getExportTemplateUrl: () => {
    const baseUrl = api.defaults.baseURL.replace(/\/$/, '');
    return `${baseUrl}/v1/admin/merchant/menu/export-template`;
  }
};

export default merchantService;
