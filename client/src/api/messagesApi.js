import { axiosInstance } from './axiosInstance';

export const messagesApi = {
  getMessages: async (params) => {
    const res = await axiosInstance.get('/messages', { params });
    return res.data;
  },

  sendMessage: async ({ bookingId, shareRequestId, content, messageType = 'TEXT' }) => {
    const res = await axiosInstance.post('/messages', {
      bookingId,
      shareRequestId,
      content,
      messageType,
    });
    return res.data;
  },
};
