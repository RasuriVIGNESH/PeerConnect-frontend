import apiService from './api.js';

class AnalyticsService {
  // Get skills analytics
  async getSkillsAnalytics() {
    try {
      return await apiService.get('/analytics/skills');
    } catch (error) {
      throw new Error(error.message || 'Failed to get skills analytics');
    }
  }

  // Get skills demand analytics
  async getSkillsDemand() {
    try {
      return await apiService.get('/analytics/skills/demand');
    } catch (error) {
      throw new Error(error.message || 'Failed to get skills demand analytics');
    }
  }

  // Get skills supply analytics
  async getSkillsSupply() {
    try {
      return await apiService.get('/analytics/skills/supply');
    } catch (error) {
      throw new Error(error.message || 'Failed to get skills supply analytics');
    }
  }

  // Get trending skills
  async getTrendingSkills() {
    try {
      return await apiService.get('/analytics/skills/trending');
    } catch (error) {
      throw new Error(error.message || 'Failed to get trending skills');
    }
  }

  // Get project statistics
  async getProjectStats() {
    try {
      return await apiService.get('/analytics/projects/stats');
    } catch (error) {
      throw new Error(error.message || 'Failed to get project statistics');
    }
  }

  // Get user statistics
  async getUserStats() {
    try {
      return await apiService.get('/analytics/users/stats');
    } catch (error) {
      throw new Error(error.message || 'Failed to get user statistics');
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
