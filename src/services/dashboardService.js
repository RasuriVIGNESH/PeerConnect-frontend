import api from './api';

export const dashboardService = {
  getDashboardCounts: async () => {
    try {
      const response = await api.get('/dashboard/counts');
      return response;
    } catch (error) {
      console.error('Error fetching dashboard counts:', error);
      throw error;
    }
  },
};
