import api from './api';

export const operationSupportService = {
  // --- Complaints (Khiếu nại) ---
  getComplaints: async (params) => {
    const response = await api.get('/v1/admin/complaints', { params });
    return response.data;
  },

  getComplaintDetail: async (id) => {
    const response = await api.get(`/v1/admin/complaints/${id}`);
    return response.data;
  },

  handleComplaint: async (id, data) => {
    const response = await api.post(`/v1/admin/complaints/${id}/handle`, data);
    return response.data;
  },

  // --- Refunds (Hoàn tiền) ---
  getRefundRequests: async (params) => {
    const response = await api.get('/v1/admin/finance/refunds', { params });
    return response.data;
  },

  getRefundDetail: async (id) => {
    const response = await api.get(`/v1/admin/finance/refunds/${id}`);
    return response.data;
  },

  processRefund: async (id, data) => {
    const response = await api.post(`/v1/admin/finance/refunds/${id}/process`, data);
    return response.data;
  },

  // --- Violations (Vi phạm) ---
  getViolations: async (params) => {
    // Note: We need a general list API for violations in backend
    const response = await api.get('/v1/admin/risk/violations', { params });
    return response.data;
  },

  warnUser: async (userId, data) => {
    const response = await api.post(`/v1/admin/risk/violations/${userId}/warn`, data);
    return response.data;
  },

  warnCustomer: async (userId, data) => {
    const response = await api.post(`/v1/admin/risk/violations/customer/${userId}/warn`, data);
    return response.data;
  }
};
