import { axiosInstance } from './axiosInstance';

export const bookingsApi = {
  create: async (data) => {
    const response = await axiosInstance.post('/bookings', data);
    return response.data;
  },
  getMyRequests: async () => {
    const response = await axiosInstance.get('/bookings/my-requests');
    return response.data;
  },
  getIncomingProvider: async () => {
    const response = await axiosInstance.get('/bookings/incoming-provider');
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response.data;
  },
  accept: async (id) => {
    const response = await axiosInstance.put(`/bookings/${id}/accept`);
    return response.data;
  },
  reject: async (id, reason) => {
    const response = await axiosInstance.put(`/bookings/${id}/reject`, { reason });
    return response.data;
  },
  complete: async (id) => {
    const response = await axiosInstance.put(`/bookings/${id}/complete`);
    return response.data;
  },
  cancel: async (id, reason) => {
    const response = await axiosInstance.put(`/bookings/${id}/cancel`, { reason });
    return response.data;
  },
};
