import api from './api';

const rideService = {
  // Admin: UC-122 List scheduled rides
  getScheduledRides: async (params = {}) => {
    const response = await api.get('/v1/admin/rides/scheduled', { params });
    return response.data;
  },

  createRideBooking: async (data) => {
    const response = await api.post('/v1/admin/rides/scheduled', data);
    return response.data;
  },

  // Admin: UC-122 Show ride detail
  getScheduledRideDetail: async (id) => {
    const response = await api.get(`/v1/admin/rides/scheduled/${id}`);
    return response.data;
  },

  updateRideBooking: async (rideId, data) => {
    const response = await api.put(`/v1/admin/rides/scheduled/${rideId}`, data);
    return response.data;
  },

  cancelRideBooking: async (rideId, reason = null) => {
    const response = await api.delete(`/v1/admin/rides/scheduled/${rideId}`, {
      data: reason ? { reason } : {}
    });
    return response.data;
  },

  // Admin: UC-122 Assign to internal driver
  assignDriver: async (rideId, driverId) => {
    const response = await api.post('/v1/admin/rides/scheduled/assign', {
      ride_id: rideId,
      driver_id: driverId
    });
    return response.data;
  },

  // Admin: UC-122 Push to external pool
  pushToPool: async (rideIds) => {
    const response = await api.post('/v1/admin/rides/scheduled/push-to-pool', {
      ride_ids: rideIds
    });
    return response.data;
  },

  getInternalDrivers: async (keyword = '') => {
    const response = await api.get('/v1/admin/drivers', { 
      params: { 
        driver_group_type: 1, // 1 = Xe nhà
        kyc_status: 2,        // 2 = Đã duyệt KYC
        keyword: keyword,
        per_page: 50          // Giới hạn 50 tài xế phù hợp nhất mỗi trang để tối ưu
      } 
    });
    return response.data;
  }
};

export default rideService;
