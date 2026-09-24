import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true, // Crucial for sending httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// In-memory access token storage (XSS protection - never in localStorage)
let inMemoryAccessToken = null;
let onTokenRefreshedCallback = null;
let onAuthFailedCallback = null;
let isRefreshing = false;
let failedQueue = [];

export const setInMemoryAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getInMemoryAccessToken = () => {
  return inMemoryAccessToken;
};

export const setupAuthCallbacks = ({ onRefreshed, onFailed }) => {
  onTokenRefreshedCallback = onRefreshed;
  onAuthFailedCallback = onFailed;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach in-memory access token
axiosInstance.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 401 handling with silent refresh and retry queue
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not attempt refresh on auth endpoints themselves (e.g. login, register, refresh)
    const isAuthEndpoint =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !isAuthEndpoint
    ) {
      if (isRefreshing) {
        // Queue parallel requests while refresh is ongoing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Direct call to refresh endpoint
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = response.data?.accessToken;
        const user = response.data?.user;

        setInMemoryAccessToken(newAccessToken);

        if (onTokenRefreshedCallback) {
          onTokenRefreshedCallback({ user, accessToken: newAccessToken });
        }

        processQueue(null, newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setInMemoryAccessToken(null);

        if (onAuthFailedCallback) {
          onAuthFailedCallback();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
