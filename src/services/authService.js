import api from './api';

const authService = {
  login: async (phone, password, remember = false) => {
    try {
      const response = await api.post('/v1/auth/login', {
        phone,
        password,
        device_id: 'browser',
        device_type: 'web',
        device_token: 'web'
      });

      
      const { user, token } = response.data.data;
      
      // Store token based on remember me
      if (remember) {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('admin_token', token);
        sessionStorage.setItem('admin_user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout: async () => {
    try {
      await api.post('/v1/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('admin_user');
    }
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('admin_user') || sessionStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  },

  getToken: () => {
    return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
  },

  isAuthenticated: () => {
    return !!authService.getToken();
  }
};

export default authService;
