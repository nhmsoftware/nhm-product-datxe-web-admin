import api from './api';

export const voucherService = {
  // UC-99: Manage Voucher (List & Search)
  getVouchers: async (params) => {
    const response = await api.get('/v1/admin/finance/vouchers', { params });
    return response.data;
  },

  // UC-99: Voucher Detail
  getVoucherDetail: async (id) => {
    const response = await api.get(`/v1/admin/finance/vouchers/${id}`);
    return response.data;
  },

  // UC-100: Create Voucher
  createVoucher: async (data) => {
    const response = await api.post('/v1/admin/finance/vouchers', data);
    return response.data;
  },

  // UC-101: Update Voucher
  updateVoucher: async (id, data) => {
    const response = await api.put(`/v1/admin/finance/vouchers/${id}`, data);
    return response.data;
  },

  // UC-99: Delete Voucher (Standard CRUD)
  deleteVoucher: async (id) => {
    const response = await api.delete(`/v1/admin/finance/vouchers/${id}`);
    return response.data;
  },

  // UC-102: Deactivate Voucher
  deactivateVoucher: async (id) => {
    const response = await api.patch(`/v1/admin/finance/vouchers/${id}/deactivate`);
    return response.data;
  },

  // UC-103: Assign Voucher
  assignVoucher: async (data) => {
    const response = await api.post('/v1/admin/finance/vouchers/assign', data);
    return response.data;
  }
};
