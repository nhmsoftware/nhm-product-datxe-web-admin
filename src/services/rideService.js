import api from './api';

const rideService = {
  // Admin: UC-122 List scheduled rides
  getScheduledRides: async (params = {}) => {
    const response = await api.get('/v1/admin/rides/scheduled', { params });
    return response.data;
  },

  // Admin: UC-122 Show ride detail
  getScheduledRideDetail: async (id) => {
    const response = await api.get(`/v1/admin/rides/scheduled/${id}`);
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

  // Admin: Get available internal drivers
  getInternalDrivers: async () => {
    const response = await api.get('/v1/admin/drivers', { 
      params: { type: 'internal', status: 'verified' } 
    });
    return response.data;
  }
};

export default rideService;
