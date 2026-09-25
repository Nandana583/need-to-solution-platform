import { axiosInstance } from './axiosInstance';

export const notificationsApi = {
  getAll: async () => {
    const response = await axiosInstance.get('/notifications');
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/unread-count');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await axiosInstance.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await axiosInstance.put('/notifications/read-all');
    return response.data;
  },
};
