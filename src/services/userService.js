import apiService from './api.js';

class UserService {
    // Get user profile by ID
    async getUserProfile(userId) {
        try {
            if (!userId || userId === 'undefined') {
                throw new Error('Invalid user ID provided');
            }
            return await apiService.get(`/users/${userId}`);
        } catch (error) {
            console.error('Get user profile error:', error);
            throw new Error(error.message || 'Failed to get user profile');
        }
    }

    // Update current user profile - FIXED to use correct endpoint
    async updateUserProfile(profileData) {
        try {
            // Debug logs
            console.log('UserService.updateUserProfile called with:');
            console.log('profileData:', profileData);
            console.log('profileData type:', typeof profileData);
            console.log('profileData keys:', profileData ? Object.keys(profileData) : 'null/undefined');

            if (!profileData || typeof profileData !== 'object' || Object.keys(profileData).length === 0) {
                console.error('Invalid profile data:', profileData);
                throw new Error('Profile data is required');
            }

            // Remove any undefined or null values from profileData
            const cleanedData = {};
            Object.keys(profileData).forEach(key => {
                if (profileData[key] !== undefined && profileData[key] !== null && profileData[key] !== '') {
                    cleanedData[key] = profileData[key];
                }
            });

            console.log('Cleaned profile data:', cleanedData);

            if (Object.keys(cleanedData).length === 0) {
                throw new Error('No valid profile data provided');
            }

            // FIXED: Using correct endpoint from UserController
            return await apiService.put('/users/profile', cleanedData);
        } catch (error) {
            console.error('Update profile error:', error);
            throw new Error(error.message || 'Failed to update profile');
        }
    }

    // Search users - FIXED parameter names to match UserController
    async searchUsers(searchParams) {
        try {
            const queryParams = new URLSearchParams();

            // FIXED: Use 'name' instead of 'search' to match UserController
            if (searchParams.search) queryParams.append('name', searchParams.search);
            if (searchParams.name) queryParams.append('name', searchParams.name);

            // These match the UserController parameters
            if (searchParams.skills) {
                if (Array.isArray(searchParams.skills)) {
                    searchParams.skills.forEach(skill => queryParams.append('skills', skill));
                } else {
                    queryParams.append('skills', searchParams.skills);
                }
            }
            if (searchParams.branch) queryParams.append('branch', searchParams.branch);
            if (searchParams.graduationYear) queryParams.append('graduationYear', searchParams.graduationYear);

            // FIXED: Use 'availabilityStatus' to match UserController
            if (searchParams.availability) queryParams.append('availabilityStatus', searchParams.availability);
            if (searchParams.availabilityStatus) queryParams.append('availabilityStatus', searchParams.availabilityStatus);

            if (searchParams.page) queryParams.append('page', searchParams.page);
            if (searchParams.size) queryParams.append('size', searchParams.size);
            if (searchParams.sortBy) queryParams.append('sortBy', searchParams.sortBy);
            if (searchParams.sortDir) queryParams.append('sortDir', searchParams.sortDir);

            const queryString = queryParams.toString();
            const endpoint = queryString ? `/users/search?${queryString}` : '/users/search';
            return await apiService.get(endpoint);
        } catch (error) {
            throw new Error(error.message || 'Failed to search users');
        }
    }

    // Discover users - FIXED parameter names to match UserController
    async discoverUsers(filters = {}) {
        try {
            const queryParams = new URLSearchParams();

            // Match UserController parameters exactly
            if (filters.skills) {
                if (Array.isArray(filters.skills)) {
                    filters.skills.forEach(skill => queryParams.append('skills', skill));
                } else {
                    queryParams.append('skills', filters.skills);
                }
            }
            if (filters.branch) queryParams.append('branch', filters.branch);
            if (filters.graduationYear) queryParams.append('graduationYear', filters.graduationYear);
            if (filters.availabilityStatus) queryParams.append('availabilityStatus', filters.availabilityStatus);
            if (filters.page) queryParams.append('page', filters.page);
            if (filters.size) queryParams.append('size', filters.size);

            const queryString = queryParams.toString();
            const endpoint = queryString ? `/users/discover?${queryString}` : '/users/discover';
            return await apiService.get(endpoint);
        } catch (error) {
            throw new Error(error.message || 'Failed to discover users');
        }
    }

    // Get all users - matches UserController endpoint
    async getAllUsers(page = 0, size = 10, sortBy = 'firstName', sortDir = 'asc') {
        try {
            const params = { page, size, sortBy, sortDir };
            return await apiService.get('/users', params);
        } catch (error) {
            throw new Error(error.message || 'Failed to get users');
        }
    }

    // Upload profile photo (PUT /api/users/profile-photo)
    async uploadProfilePicture(file) {
        try {
            if (!file) {
                throw new Error('File is required');
            }

            const formData = new FormData();
            formData.append('profilePhoto', file);

            // Use custom headers to avoid setting Content-Type so browser sets multipart boundary
            const token = apiService.getToken();
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            return await apiService.request('/users/profile-photo', {
                method: 'POST',
                body: formData,
                headers
            });
        } catch (error) {
            console.error('Upload profile photo error:', error);
            throw new Error(error.message || 'Failed to upload profile photo');
        }
    }

    // Delete profile photo (DELETE /api/users/profile-photo)
    async deleteProfilePhoto() {
        try {
            return await apiService.delete('/users/profile-photo');
        } catch (error) {
            console.error('Delete profile photo error:', error);
            throw new Error(error.message || 'Failed to delete profile photo');
        }
    }

    // Update availability status - FIXED to use correct endpoint and method
    async updateAvailabilityStatus(status) {
        try {
            if (!status) {
                throw new Error('Status is required');
            }
            // FIXED: Use query parameter as expected by UserController
            return await apiService.put('/users/availability', null, { status });
        } catch (error) {
            throw new Error(error.message || 'Failed to update availability');
        }
    }
}

export const userService = new UserService();
export default userService;