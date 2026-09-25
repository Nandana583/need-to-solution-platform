import { axiosInstance } from './axiosInstance';

export const categoriesApi = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/categories', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await axiosInstance.get(`/categories/${id}`);
    return response.data;
  },
};
