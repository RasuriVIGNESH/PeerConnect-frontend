import apiService from './api.js';

class DataService {
  // Get available branches - matches StaticDataController endpoint
  async getBranches() {
    try {
      console.log('DataService: Getting branches...');
      const response = await apiService.get('/static-data/branches');
      console.log('DataService: Branches response:', response);
      return response;
    } catch (error) {
      console.error('DataService: Error getting branches:', error);
      throw new Error(error.message || 'Failed to get branches data');
    }
  }

  // Get graduation years - matches StaticDataController endpoint
  async getGraduationYears() {
    try {
      console.log('DataService: Getting graduation years...');
      const response = await apiService.get('/static-data/graduation-years');
      console.log('DataService: Graduation years response:', response);
      return response;
    } catch (error) {
      console.error('DataService: Error getting graduation years:', error);
      throw new Error(error.message || 'Failed to get graduation years');
    }
  }

  // Get colleges - matches the /api/colleges endpoint
  async getColleges() {
    try {
      console.log('DataService: Getting colleges...');
      const response = await apiService.get('/collages');
      console.log('DataService: Colleges response:', response);

      // Handle different response formats
      if (response && Array.isArray(response)) {
        return { data: response };
      } else if (response && Array.isArray(response.data)) {
        return response;
      } else {
        console.warn('DataService: Unexpected colleges response format:', response);
        return { data: [] }; // Return empty array as fallback
      }
    } catch (error) {
      console.error('DataService: Error getting colleges:', error);
      // Return empty array instead of throwing to prevent registration form from breaking
      return { data: [] };
    }
  }

  // Get project categories - matches StaticDataController endpoint
  async getProjectCategories() {
    try {
      console.log('DataService: Getting project categories...');
      const response = await apiService.get('/static-data/project-categories');
      console.log('DataService: Project categories response:', response);
      return response;
    } catch (error) {
      console.error('DataService: Error getting project categories:', error);
      throw new Error(error.message || 'Failed to get project categories');
    }
  }

  // REMOVED METHODS: The following methods don't have corresponding backend endpoints
  // If you need these functionalities, implement them in the backend first:

  // async getSkillsData() - No backend endpoint
  // async getProjectTemplates() - No backend endpoint  
  // async getAchievements() - No backend endpoint

  // Utility method to get all static data at once
  async getAllStaticData() {
    try {
      console.log('DataService: Getting all static data...');

      const [branches, graduationYears, projectCategories] = await Promise.all([
        this.getBranches(),
        this.getGraduationYears(),
        this.getProjectCategories()
      ]);

      const staticData = {
        branches: branches?.data || branches,
        graduationYears: graduationYears?.data || graduationYears,
        projectCategories: projectCategories?.data || projectCategories
      };

      console.log('DataService: All static data retrieved:', staticData);
      return {
        success: true,
        data: staticData,
        message: 'All static data retrieved successfully'
      };
    } catch (error) {
      console.error('DataService: Error getting all static data:', error);
      throw new Error(error.message || 'Failed to get static data');
    }
  }
}

export const dataService = new DataService();
export default dataService;