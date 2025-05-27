import apiService from './api.service';

export const feedbacksService = {

  async submitFeedback(body) {
    try {
      const response = await apiService.post('/feedback', body);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || 'אירעה שגיאה בשליחת המשוב');
    }
  },

  async fetchStats() {
    try {
      const response = await apiService.get('/feedback/stats');
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || 'שגיאה בקבלת הסטיסטיקות');
    }
  },

  async fetchFeedbacks(options = {}) {
    try {
      const { page = 1, limit = 10, search = '', rating = null, filter = 'all', sortBy = 'date' } = options;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy
      });

      if (search) params.append('search', search);
      if (rating) params.append('rating', rating.toString());
      if (filter !== 'all') params.append('filter', filter);

      const response = await apiService.get(`/feedback/feedbacks?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || 'שגיאה בקבלת המשובים');
    }
  },

  
  async fetchFeedback(feedbackId) {
    try {

      const response = await apiService.get(`/feedback/feedback?id=${feedbackId.toString()}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || 'שגיאה בקבלת המשוב');
    }
  },

  async deleteFeedback(id) {
    try {
      const response = await apiService.delete(`/feedback/${id}`);
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error(error.response?.data?.message || 'שגיאה במחיקת המשוב');
    }
  },

};