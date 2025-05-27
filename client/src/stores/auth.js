import { defineStore } from 'pinia';
import { api, setAuthToken } from '../services/api.service';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: !!localStorage.getItem('token'),
  }),
  actions: {
    async login(email, password) {
      try {
        const response = await api.post('/auth/login', { email, password });
        const { token } = response.data;
        localStorage.setItem('token', token);
        setAuthToken(token);
        this.isAuthenticated = true;
        console.log('Login successful:', response.data);

      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    logout() {
      localStorage.removeItem('token');
      setAuthToken(null);
      this.isAuthenticated = false;
    }
  },
});