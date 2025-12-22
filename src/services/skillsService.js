import apiService from './api.js';

class SkillsService {

    // ===== NEW METHOD FOR STATIC DATA =====
    // Get static predefined skills list - Matches /api/static-data/predefined-skills
    async getStaticPredefinedSkills() {
        try {
            // Note: Assuming apiService handles the base /api url or it's relative
            // If apiService.get adds '/api', this becomes '/api/static-data...'
            // Adjusting based on standard pattern
            const response = await apiService.get('/static-data/predefined-skills');
            return response;
        } catch (error) {
            console.error('SkillsService: Error getting static predefined skills:', error);
            // Return empty array on failure so components don't crash
            return [];
        }
    }

    // Alias for getStaticPredefinedSkills to maintain compatibility
    async getPredefinedSkills() {
        return this.getStaticPredefinedSkills();
    }

    // Get all skills with pagination - matches SkillController endpoint
    async getAllSkills(page = 0, size = 10, sortBy = 'name', sortDir = 'asc') {
        try {
            console.log('SkillsService: Getting all skills...');
            const params = { page, size, sortBy, sortDir };
            const response = await apiService.get('/skills', params);
            console.log('SkillsService: All skills response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error getting all skills:', error);
            throw new Error(error.message || 'Failed to get all skills');
        }
    }

    // Get skill categories - FIXED method name to reflect what it actually does
    async getSkillCategories() {
        try {
            console.log('SkillsService: Getting skill categories...');
            const response = await apiService.get('/skills/categories');
            console.log('SkillsService: Skill categories response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error getting skill categories:', error);
            throw new Error(error.message || 'Failed to get skill categories');
        }
    }

    // Get skills by category - matches SkillController endpoint
    async getSkillsByCategory(category, page = 0, size = 10) {
        try {
            console.log('SkillsService: Getting skills by category:', category);
            const params = { page, size };
            const response = await apiService.get(`/skills/category/${category}`, params);
            console.log('SkillsService: Skills by category response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error getting skills by category:', error);
            throw new Error(error.message || 'Failed to get skills by category');
        }
    }

    // Get popular skills - matches SkillController endpoint
    async getPopularSkills(page = 0, size = 10) {
        try {
            console.log('SkillsService: Getting popular skills...');
            const params = { page, size };
            const response = await apiService.get('/skills/popular', params);
            console.log('SkillsService: Popular skills response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error getting popular skills:', error);
            throw new Error(error.message || 'Failed to get popular skills');
        }
    }

    // Get skill by ID - matches SkillController endpoint
    async getSkillById(skillId) {
        try {
            console.log('SkillsService: Getting skill by ID:', skillId);
            if (!skillId) {
                throw new Error('Skill ID is required');
            }
            const response = await apiService.get(`/skills/${skillId}`);
            console.log('SkillsService: Skill by ID response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error getting skill by ID:', error);
            throw new Error(error.message || 'Failed to get skill');
        }
    }

    // Search skills - FIXED parameter name to match SkillController
    async searchSkills(searchTerm, page = 0, size = 10) {
        try {
            console.log('SkillsService: Searching skills with term:', searchTerm);
            if (!searchTerm || searchTerm.trim().length === 0) {
                return { data: { content: [] } };
            }

            // FIXED: Use 'query' parameter instead of 'q' to match SkillController
            const params = { query: searchTerm.trim(), page, size };
            const response = await apiService.get('/skills/search', params);
            console.log('SkillsService: Search skills response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error searching skills:', error);
            throw new Error(error.message || 'Failed to search skills');
        }
    }

    // Create new skill - matches SkillController endpoint
    async createSkill(skillData) {
        try {
            console.log('SkillsService: Creating new skill with data:', skillData);
            if (!skillData.name || !skillData.category) {
                throw new Error('Skill name and category are required');
            }

            const response = await apiService.post('/skills', skillData);
            console.log('SkillsService: Create skill response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error creating skill:', error);
            throw new Error(error.message || 'Failed to create skill');
        }
    }

    // Update skill - matches SkillController endpoint
    async updateSkill(skillId, skillData) {
        try {
            console.log('SkillsService: Updating skill:', skillId, 'with data:', skillData);
            if (!skillId) {
                throw new Error('Skill ID is required for update');
            }
            if (!skillData.name || !skillData.category) {
                throw new Error('Skill name and category are required');
            }

            const response = await apiService.put(`/skills/${skillId}`, skillData);
            console.log('SkillsService: Update skill response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error updating skill:', error);
            throw new Error(error.message || 'Failed to update skill');
        }
    }

    // Delete skill - matches SkillController endpoint
    async deleteSkill(skillId) {
        try {
            console.log('SkillsService: Deleting skill:', skillId);
            if (!skillId) {
                throw new Error('Skill ID is required for deletion');
            }

            const response = await apiService.delete(`/skills/${skillId}`);
            console.log('SkillsService: Delete skill response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error deleting skill:', error);
            throw new Error(error.message || 'Failed to delete skill');
        }
    }

    // ===== USER SKILLS MANAGEMENT (from UserController) =====

    // Get user skills - matches UserController endpoint
    async getUserSkills() {
        try {
            console.log('SkillsService: Getting user skills...');
            const response = await apiService.get('/users/skills');
            console.log('SkillsService: User skills response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error getting user skills:', error);
            throw new Error(error.message || 'Failed to get user skills');
        }
    }

    // Get skills for a specific user (via user profile)
    async getUserSkillsByUserId(userId) {
        try {
            console.log('SkillsService: Getting user skills for specific userId:', userId);
            if (!userId) {
                throw new Error('User ID is required');
            }

            const response = await apiService.get(`/users/${userId}`);
            console.log('SkillsService: User profile response:', response);

            // Extract skills from user profile response
            const userSkills = response?.data?.skills || response?.skills || [];
            return { data: userSkills, success: true };
        } catch (error) {
            console.error('SkillsService: Error getting user skills by ID:', error);
            throw new Error(error.message || 'Failed to get user skills');
        }
    }

    // Add user skill - matches UserController endpoint and request format
    async addUserSkill(skillData) {
        try {
            console.log('SkillsService: Adding user skill with data:', skillData);

            // Validate required fields
            if (!skillData.skillName) {
                throw new Error('Skill name is required');
            }

            // Map frontend data to backend AddUserSkillRequest format
            const requestData = {
                skillName: skillData.skillName,
                level: skillData.level || 'BEGINNER',
                experience: skillData.experience || skillData.notes || ''
            };

            console.log('SkillsService: Sending request data:', requestData);
            const response = await apiService.post('/users/skills', requestData);
            console.log('SkillsService: Add skill response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error adding skill:', error);
            throw new Error(error.message || 'Failed to add skill');
        }
    }

    // Update user skill - matches UserController endpoint and request format
    async updateUserSkill(skillId, skillData) {
        try {
            console.log('SkillsService: Updating user skill:', skillId, 'with data:', skillData);
            if (!skillId) {
                throw new Error('Skill ID is required for update');
            }

            // Map frontend data to backend UpdateUserSkillRequest format
            const requestData = {
                level: skillData.level || 'BEGINNER',
                experience: skillData.experience || skillData.notes || ''
            };

            console.log('SkillsService: Sending update request data:', requestData);
            const response = await apiService.put(`/users/skills/${skillId}`, requestData);
            console.log('SkillsService: Update user skill response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error updating user skill:', error);
            throw new Error(error.message || 'Failed to update user skill');
        }
    }

    // Delete user skill - matches UserController endpoint
    async deleteUserSkill(skillId) {
        try {
            console.log('SkillsService: Deleting user skill:', skillId);
            if (!skillId) {
                throw new Error('Skill ID is required for deletion');
            }

            const response = await apiService.delete(`/users/skills/${skillId}`);
            console.log('SkillsService: Delete user skill response:', response);
            return response;
        } catch (error) {
            console.error('SkillsService: Error deleting user skill:', error);
            throw new Error(error.message || 'Failed to delete user skill');
        }
    }
}

export const skillsService = new SkillsService();
export default skillsService;