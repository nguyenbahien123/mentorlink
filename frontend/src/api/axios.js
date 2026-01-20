import axios from "axios";

const URL = "http://localhost:8080"; // BE url

// Danh sách các endpoint public không cần token
const PUBLIC_ENDPOINTS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh-token',
  '/api/customer-policies/active',
  '/api/mentor-policies/active',
  '/api/public/mentor-ads/active',
];

// Hàm kiểm tra endpoint có phải public không
const isPublicEndpoint = (url) => {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint));
};

// Hàm lấy access token
const getAccessToken = () => localStorage.getItem("accessToken");

// Hàm lấy refresh token
const getRefreshToken = () => localStorage.getItem("refreshToken");

// authInstance cho các API không cần token (đăng nhập, đăng ký...)
const authInstance = axios.create({
  baseURL: URL,
  // ❌ KHÔNG set Content-Type mặc định để axios tự động detect (JSON hoặc FormData)
});

// instance cho các API yêu cầu xác thực (có token)
const instance = axios.create({
  baseURL: URL,
  // ❌ KHÔNG set Content-Type mặc định để axios tự động detect (JSON hoặc FormData)
});

// Request interceptor cho instance chính
instance.interceptors.request.use((config) => {
  const url = config.url || '';

  const token = getAccessToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

// Response interceptor để handle token expiration
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
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await authInstance.post('/api/auth/refresh-token', {}, {
      headers: {
        'Authorization': `Bearer ${refreshToken}`
      }
    });

    // authInstance's response interceptor returns response.data, but handle both shapes
    const resData = response?.data || response;
    if (resData && resData.accessToken && resData.refreshToken) {
      localStorage.setItem('accessToken', resData.accessToken);
      localStorage.setItem('refreshToken', resData.refreshToken);
      return resData.accessToken;
    } else {
      throw new Error('Invalid refresh response');
    }
  } catch (error) {
    // Nếu refresh thất bại, clear tokens và redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authState');

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

    // Kiểm tra nếu lỗi là token expired (respCode: "08")
    const status = error.response?.status;
    const respCode = error.response?.data?.respCode;

    // Trigger refresh on custom respCode or HTTP 401, but avoid retry loops
    if ((respCode === "08" || status === 401)) {
      //  && !originalRequest._retry && !originalRequest.url.includes('/api/auth/refresh-token')
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
      localStorage.clear();
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
