import api from './api';

const BASE_URL = '/v1/admin/marketing';

const marketingService = {
  // --- BANNERS ---
  getBanners: async (params) => {
    const response = await api.get(`${BASE_URL}/banners`, { params });
    return response.data;
  },

  getBanner: async (id) => {
    const response = await api.get(`${BASE_URL}/banners/${id}`);
    return response.data;
  },

  createBanner: async (formData) => {
    // Note: formData should be FormData if uploading image, else JSON
    const response = await api.post(`${BASE_URL}/banners`, formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  updateBanner: async (id, formData) => {
    const response = await api.post(`${BASE_URL}/banners/${id}`, formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  deleteBanner: async (id) => {
    const response = await api.delete(`${BASE_URL}/banners/${id}`);
    return response.data;
  },

  // --- NEWS ---
  getNews: async (params) => {
    const response = await api.get(`${BASE_URL}/news`, { params });
    return response.data;
  },

  getNewsById: async (id) => {
    const response = await api.get(`${BASE_URL}/news/${id}`);
    return response.data;
  },

  createNews: async (formData) => {
    const response = await api.post(`${BASE_URL}/news`, formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  updateNews: async (id, formData) => {
    const response = await api.post(`${BASE_URL}/news/${id}`, formData, {
      headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },

  deleteNews: async (id) => {
    const response = await api.delete(`${BASE_URL}/news/${id}`);
    return response.data;
  },
};

export default marketingService;
