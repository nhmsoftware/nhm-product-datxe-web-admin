import api from './api';

const merchantService = {
  getMerchants: (params) => {
    return api.get('/v1/admin/merchant', { params });
  },

  getMerchantDetail: (id) => {
    return api.get(`/v1/admin/merchant/${id}`);
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
  }
};

export default merchantService;
