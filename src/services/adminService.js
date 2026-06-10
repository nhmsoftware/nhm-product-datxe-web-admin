import api from './api';

export const adminService = {
  // UC-76: View Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/v1/admin/dashboard');
    return response.data;
  },

  getRevenueReport: async (params) => {
    const response = await api.get('/v1/admin/dashboard/revenue', { params });
    return response.data;
  },

  getAreaReport: async (params) => {
    const response = await api.get('/v1/admin/dashboard/area', { params });
    return response.data;
  },

  getCommissionReport: async (params) => {
    const response = await api.get('/v1/admin/dashboard/commission', { params });
    return response.data;
  },

  getOrderReport: async (params) => {
    const response = await api.get('/v1/admin/dashboard/orders', { params });
    return response.data;
  },

  getDetailedReport: async (params) => {
    const response = await api.get('/v1/admin/dashboard/detailed', { params });
    return response.data;
  },

  getTopDriversReport: async (params) => {
    const response = await api.get('/v1/admin/dashboard/top-drivers', { params });
    return response.data;
  },

  // UC-91: Configure Pricing
  getPricingConfigs: async () => {
    const response = await api.get('/v1/admin/pricing/configs');
    return response.data;
  },

  updatePricingConfig: async (data) => {
    const response = await api.post('/v1/admin/pricing/configs', data);
    return response.data;
  },

  archivePricingConfig: async (vehicleTypeId) => {
    const response = await api.post(`/v1/admin/pricing/configs/${vehicleTypeId}/archive`);
    return response.data;
  },

  resetPricingConfig: async (vehicleType) => {
    const response = await api.delete(`/v1/admin/pricing/configs/${vehicleType}/reset`);
    return response.data;
  },

  toggleFreeMode: async (isFreeMode) => {
    const response = await api.post('/v1/admin/pricing/toggle-free-mode', { is_free_mode: isFreeMode });
    return response.data;
  },

  // UC-96: Set Surge Pricing
  getSurgeRules: async () => {
    const response = await api.get('/v1/admin/pricing/surge-rules');
    return response.data;
  },

  getVehicleTypes: async () => {
    const response = await api.get('/v1/meta/vehicle-types');
    return response.data;
  },

  getAdminVehicleTypes: async () => {
    const response = await api.get('/v1/admin/meta/vehicle-types');
    return response.data;
  },

  createVehicleType: async (data) => {
    const response = await api.post('/v1/admin/meta/vehicle-types', data);
    return response.data;
  },

  updateVehicleType: async (id, data) => {
    const response = await api.put(`/v1/admin/meta/vehicle-types/${id}`, data);
    return response.data;
  },

  deleteVehicleType: async (id) => {
    const response = await api.delete(`/v1/admin/meta/vehicle-types/${id}`);
    return response.data;
  },

  saveSurgeRule: async (data) => {
    const response = await api.post('/v1/admin/pricing/surge-rules', data);
    return response.data;
  },

  deleteSurgeRule: async (ruleId) => {
    const response = await api.delete(`/v1/admin/pricing/surge-rules/${ruleId}`);
    return response.data;
  },

  // UC-118/121: Scheduled Ride Pricing
  getScheduledPricing: async () => {
    const response = await api.get('/v1/admin/pricing/scheduled');
    return response.data;
  },

  updateScheduledPricing: async (data) => {
    const response = await api.post('/v1/admin/pricing/scheduled', data);
    return response.data;
  },

  toggleScheduledDispatchMode: async (mode) => {
    const response = await api.post('/v1/admin/pricing/scheduled/toggle-dispatch', { mode });
    return response.data;
  },

  toggleInternalAutoPush: async (isAutoPush) => {
    const response = await api.post('/v1/admin/pricing/scheduled/toggle-internal-auto-push', { is_auto_push: isAutoPush });
    return response.data;
  },

  // UC-120: Cancellation Configs
  getCancellationConfigs: async () => {
    const response = await api.get('/v1/admin/risk/cancellation-configs');
    return response.data;
  },

  updateCancellationConfig: async (id, data) => {
    const response = await api.put(`/v1/admin/risk/cancellation-configs/${id}`, data);
    return response.data;
  },

  // UC-77: Customer Management
  getCustomers: async (params) => {
    const response = await api.get('/v1/admin/users/customers', { params });
    return response.data;
  },

  createCustomer: async (data) => {
    const response = await api.post('/v1/admin/users/customers', data);
    return response.data;
  },

  updateCustomer: async (userId, data) => {
    const response = await api.put(`/v1/admin/users/${userId}`, data);
    return response.data;
  },

  deleteCustomer: async (userId) => {
    const response = await api.delete(`/v1/admin/users/${userId}`);
    return response.data;
  },

  updateCustomerStatus: async (userId, data) => {
    const response = await api.put(`/v1/admin/users/${userId}/status`, data);
    return response.data;
  },

  getCustomerDetail: async (userId) => {
    const response = await api.get(`/v1/admin/users/${userId}`);
    return response.data;
  },

  // UC-80: Driver Management
  getDrivers: async (params) => {
    const response = await api.get('/v1/admin/drivers', { params });
    return response.data;
  },

  createDriver: async (data) => {
    const response = await api.post('/v1/admin/drivers', data);
    return response.data;
  },

  getDriverDetail: async (userId) => {
    const response = await api.get(`/v1/admin/drivers/${userId}`);
    return response.data;
  },

  updateDriver: async (userId, data) => {
    const response = await api.put(`/v1/admin/drivers/${userId}`, data);
    return response.data;
  },

  deleteDriver: async (userId) => {
    const response = await api.delete(`/v1/admin/drivers/${userId}`);
    return response.data;
  },

  uploadDriverKyc: async (userId, formData) => {
    const response = await api.post(`/v1/admin/driver/users/${userId}/register-submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },


  updateDriverStatus: async (userId, data) => {
    const response = await api.put(`/v1/admin/drivers/${userId}/status`, data);
    return response.data;
  },

  approveDriver: async (userId, note) => {
    const response = await api.post(`/v1/admin/drivers/${userId}/approve`, { note });
    return response.data;
  },

  rejectDriver: async (userId, reason) => {
    const response = await api.post(`/v1/admin/drivers/${userId}/reject`, { reason });
    return response.data;
  },

  assignDriverGroup: async (userId, groupType) => {
    const response = await api.post(`/v1/admin/drivers/${userId}/assign-group`, { group_type: groupType });
    return response.data;
  },

  exportDrivers: async (params) => {
    const response = await api.get('/v1/admin/drivers/export', { 
      params,
      responseType: 'blob'
    });
    return response;
  },

  // UC-97: Configure Commission
  getCommissionRules: async () => {
    const response = await api.get('/v1/admin/finance/commissions');
    return response.data;
  },

  saveCommissionRule: async (data) => {
    const response = await api.post('/v1/admin/finance/commissions', data);
    return response.data;
  },

  deleteCommissionRule: async (id) => {
    const response = await api.delete(`/v1/admin/finance/commissions/${id}`);
    return response.data;
  },

  // Service Order Management
  getServiceOrders: async (params = {}) => {
    const response = await api.get('/v1/admin/services/orders', { params });
    return response.data;
  },

  createFoodOrder: async (data) => {
    const response = await api.post('/v1/admin/services/orders', data);
    return response.data;
  },

  updateFoodOrder: async (orderId, data) => {
    const response = await api.put(`/v1/admin/services/orders/${orderId}`, data);
    return response.data;
  },

  cancelFoodOrder: async (orderId, reason = null) => {
    const response = await api.delete(`/v1/admin/services/orders/${orderId}`, {
      data: reason ? { reason } : {}
    });
    return response.data;
  },

  createDeliveryOrder: async (data) => {
    const response = await api.post('/v1/admin/services', data);
    return response.data;
  },

  updateDeliveryOrder: async (orderId, data) => {
    const response = await api.put(`/v1/admin/services/${orderId}`, data);
    return response.data;
  },

  cancelDeliveryOrder: async (orderId, reason = null) => {
    const response = await api.delete(`/v1/admin/services/${orderId}`, {
      data: reason ? { reason } : {}
    });
    return response.data;
  },

  assignServiceDriver: async (orderId, driverId) => {
    const response = await api.post('/v1/admin/services/orders/assign', {
      order_id: orderId,
      driver_id: driverId
    });
    return response.data;
  },

  pushServiceToPool: async (orderIds) => {
    const response = await api.post('/v1/admin/services/orders/push-to-pool', {
      order_ids: orderIds
    });
    return response.data;
  }
};
