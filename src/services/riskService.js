import api from './api';

export const riskService = {
  // UC-104: Anti-Fraud System
  getOverview: async () => {
    const response = await api.get('/v1/admin/risk/anti-fraud/overview');
    return response.data;
  },

  listAlerts: async (params) => {
    const response = await api.get('/v1/admin/risk/anti-fraud/alerts', { params });
    return response.data;
  },

  getAlertDetail: async (id) => {
    const response = await api.get(`/v1/admin/risk/anti-fraud/alerts/${id}`);
    return response.data;
  },

  // UC-105: Configure Penalty Rules
  listPenaltyRules: async (params) => {
    const response = await api.get('/v1/admin/risk/penalty-rules', { params });
    return response.data;
  },

  createPenaltyRule: async (data) => {
    const response = await api.post('/v1/admin/risk/penalty-rules', data);
    return response.data;
  },

  updatePenaltyRule: async (id, data) => {
    const response = await api.put(`/v1/admin/risk/penalty-rules/${id}`, data);
    return response.data;
  },

  deletePenaltyRule: async (id) => {
    const response = await api.delete(`/v1/admin/risk/penalty-rules/${id}`);
    return response.data;
  },

  togglePenaltyRuleStatus: async (id, isActive) => {
    const response = await api.patch(`/v1/admin/risk/penalty-rules/${id}/toggle-status`, { is_active: isActive });
    return response.data;
  },

  // UC-110: Violation Logs
  listViolations: async (params) => {
    const response = await api.get('/v1/admin/risk/violations', { params });
    return response.data;
  }
};
