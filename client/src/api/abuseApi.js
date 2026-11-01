import { axiosInstance } from './axiosInstance';

export const abuseApi = {
  fileReport: async ({ reportedUserId, reason, details, bookingId, shareRequestId, isBlock }) => {
    const res = await axiosInstance.post('/abuse/report', {
      reportedUserId, reason, details, bookingId, shareRequestId, isBlock,
    });
    return res.data;
  },
  getMyBlocks: async () => {
    const res = await axiosInstance.get('/abuse/blocks');
    return res.data;
  },
  unblockUser: async (userId) => {
    const res = await axiosInstance.delete(`/abuse/blocks/${userId}`);
    return res.data;
  },
};

export const callsApi = {
  logCall: async ({ calleeId, bookingId, shareRequestId, outcome, durationSeconds, notes }) => {
    const res = await axiosInstance.post('/calls', {
      calleeId, bookingId, shareRequestId, outcome, durationSeconds, notes,
    });
    return res.data;
  },
  getHistory: async ({ bookingId, shareRequestId }) => {
    const res = await axiosInstance.get('/calls', { params: { bookingId, shareRequestId } });
    return res.data;
  },
  updateCall: async (id, updates) => {
    const res = await axiosInstance.put(`/calls/${id}`, updates);
    return res.data;
  },
};
