import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("401");
      localStorage.removeItem("token")
      window.location.href = '/login';
    }
    if (error.response?.status === 403) {
      console.log("403");
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

setAuthToken(localStorage.getItem('token'));

export default api