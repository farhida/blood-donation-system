import axios from 'axios';

const adminApi = axios.create();

adminApi.interceptors.request.use((config) => {
  // Prefer explicit admin tokens, but fall back to the regular user access token
  // so an admin who logged in using the normal login flow can still access admin APIs.
  const access = localStorage.getItem('admin_access') || localStorage.getItem('access');
  if (access) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${access}`;
  }
  // eslint-disable-next-line no-console
  console.log('[adminApi] request', config.method, config.url, config.headers && !!config.headers.Authorization ? 'AUTH' : 'NOAUTH');
  return config;
});

let isRefreshing = false;
let pending = [];

function onRefreshed(newAccess) {
  pending.forEach((cb) => cb(newAccess));
  pending = [];
}

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
  // eslint-disable-next-line no-console
  console.warn('[adminApi] response error', error.config?.method, error.config?.url, error.response?.status);
    const originalRequest = error.config || {};
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
  // Try admin-specific refresh token first, then fall back to regular refresh token
  const refresh = localStorage.getItem('admin_refresh') || localStorage.getItem('refresh');
  if (!refresh) return Promise.reject(error);
      if (isRefreshing) {
        return new Promise((resolve) => {
          pending.push((newAccess) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            resolve(adminApi(originalRequest));
          });
        });
      }
      try {
        isRefreshing = true;
        const res = await axios.post('/api/token/refresh/', { refresh });
        const newAccess = res.data?.access;
        if (newAccess) {
          localStorage.setItem('admin_access', newAccess);
          onRefreshed(newAccess);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return adminApi(originalRequest);
        }
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default adminApi;
