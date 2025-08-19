import axios from 'axios';

const adminApi = axios.create();

adminApi.interceptors.request.use((config) => {
  const access = localStorage.getItem('admin_access');
  if (access) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${access}`;
  }
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
    const originalRequest = error.config || {};
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('admin_refresh');
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
