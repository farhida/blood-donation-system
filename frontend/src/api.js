import axios from 'axios';

const api = axios.create();

api.interceptors.request.use((config) => {
  const access = localStorage.getItem('access');
  if (access) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let isRefreshing = false;
let pendingRequests = [];

function onRefreshed(newAccess) {
  pendingRequests.forEach((cb) => cb(newAccess));
  pendingRequests = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh');
      if (!refresh) {
        return Promise.reject(error);
      }
      if (isRefreshing) {
        return new Promise((resolve) => {
          pendingRequests.push((newAccess) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            resolve(api(originalRequest));
          });
        });
      }
      try {
        isRefreshing = true;
        const res = await axios.post('/api/token/refresh/', { refresh });
        const newAccess = res.data?.access;
        if (newAccess) {
          localStorage.setItem('access', newAccess);
          onRefreshed(newAccess);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        }
      } catch (_) {
        // fall through
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
