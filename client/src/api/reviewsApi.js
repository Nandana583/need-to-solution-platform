import { axiosInstance } from './axiosInstance';

export const reviewsApi = {
  create: async (data) => {
    const response = await axiosInstance.post('/reviews', data);
    return response.data;
  },
  getUserReviews: async (userId) => {
    const response = await axiosInstance.get(`/reviews/user/${userId}`);
    return response.data;
  },
};
