import axios from "axios";
import { tokenManager } from "./tokenManager";

// Get API URL from environment variable
// Empty string for production (nginx proxy), localhost for development
// Determine base API URL:
// - If `VITE_API_URL` is provided (overrides), use it.
// - In dev mode default to localhost for local backend.
// - In production (no VITE_API_URL) use empty string so requests are relative
//   and go through the nginx reverse proxy at the same origin (HTTPS).
const URL = import.meta.env.VITE_API_URL !== undefined
  ? import.meta.env.VITE_API_URL
  : (import.meta.env.DEV ? "http://localhost:8080" : "");

// Danh sách các endpoint public không cần token
const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh-token',
  '/api/auth/access-token',
  '/api/auth/signup',
  '/api/auth/signup-with-otp',
  '/api/auth/mentor-signup',
  '/api/auth/mentor-signup-with-otp',
  '/api/customer-policies/active',
  '/api/mentor-policies/active',
  '/api/public/mentor-ads/active',
  '/api/auth/otp/send',
  '/api/auth/otp/verify',
];

// Hàm kiểm tra endpoint có phải public không
const isPublicEndpoint = (url) => {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// authInstance cho các API không cần token (đăng nhập, đăng ký...)
const authInstance = axios.create({
  baseURL: URL,
  withCredentials: true, // Enable cookies for all requests
});

// instance cho các API yêu cầu xác thực (có token)
const instance = axios.create({
  baseURL: URL,
  withCredentials: true, // Enable cookies
});

// Request interceptor cho instance chính - thêm accessToken từ memory
instance.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor để handle token expiration với queueing
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const handleTokenRefresh = async () => {
  try {
    const response = await authInstance.post('/api/auth/refresh-token', {}, {
      withCredentials: true // Send refreshToken cookie
    });

    // Response interceptor của authInstance sẽ return response.data
    const resData = response?.data || response;
    if (resData && resData.accessToken) {
      tokenManager.setAccessToken(resData.accessToken);
      return resData.accessToken;
    } else {
      throw new Error('Invalid refresh response');
    }
  } catch (error) {
    // Nếu refresh thất bại, clear tokens và redirect to login
    tokenManager.clearAccessToken();
    
    // Redirect to login page
    window.location.href = '/login';
    throw error;
  }
};

// Response interceptor cho instance chính
instance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Kiểm tra nếu lỗi là token expired (respCode: "08" hoặc status 401)
    const status = error.response?.status;
    const respCode = error.response?.data?.respCode;

    // Trigger refresh on custom respCode or HTTP 401, but avoid retry loops
    if ((respCode === "08" || status === 401) && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang trong quá trình refresh, đợi kết quả
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return instance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await handleTokenRefresh();
        processQueue(null, newToken);

        // Retry original request với token mới
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    if (error.response && error.response.data && error.response.data.code === 1006) {
      console.error("Unauthorized! Redirecting to login...");
      tokenManager.clearAccessToken();
      window.location.href = '/login';
    }

    return Promise.reject(error.response?.data || error);
  }
);

// Response interceptor cho authInstance
authInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject(error.response?.data || error);
  }
);

export { instance, authInstance };
