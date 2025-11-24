import apiService from './api.js';
import { LINKEDIN_CONFIG } from '../config/api.js';


class AuthService {
    // Register new user
    async register(userData) {
        try {
            const response = await apiService.post('/auth/register', userData, {
                includeAuth: false
            });

            // Extract from the wrapped response structure
            if (response.data && response.data.accessToken) {
                apiService.setToken(response.data.accessToken);
                return {
                    token: response.data.accessToken,
                    accessToken: response.data.accessToken,
                    user: response.data.user,
                    ...response.data
                };
            }

            return response;
        } catch (error) {
            throw new Error(error.message || 'Registration failed');
        }
    }

    // Login user
    async login(email, password) {
        try {
            const response = await apiService.post('/auth/login', {
                email,
                password
            }, {
                includeAuth: false
            });

            // Extract from the wrapped response structure  
            if (response.data && response.data.accessToken) {
                apiService.setToken(response.data.accessToken);
                return {
                    token: response.data.accessToken,
                    accessToken: response.data.accessToken,
                    user: response.data.user,
                    ...response.data
                };
            }

            return response;
        } catch (error) {
            throw new Error(error.message || 'Login failed');
        }
    }

    // LinkedIn OAuth login
    async loginWithLinkedIn() {
        try {
            // Redirect directly to Spring Boot's OAuth2 authorization endpoint
            const linkedInAuthUrl = `http://localhost:8080/oauth2/authorize/linkedin`;
            window.location.href = linkedInAuthUrl;
        } catch (error) {
            throw new Error('LinkedIn authentication failed');
        }
    }

    async loginWithGitHub() {
        try {
            // Redirect to backend OAuth2 authorization endpoint (backend initiates the provider flow)
            const githubAuthUrl = `http://localhost:8080/oauth2/authorization/github`;
            window.location.href = githubAuthUrl;
        } catch (error) {
            throw new Error('GitHub authentication failed');
        }
    }



    // Logout user
    async logout() {
        try {
            await apiService.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            apiService.setToken(null);
        }
    }

    // Get current user profile
    async getCurrentUser() {
        try {
            const response = await apiService.get('/auth/me');
            // Handle wrapped response for getCurrentUser too
            return response.data ? response.data : response;
        } catch (error) {
            throw new Error(error.message || 'Failed to get user profile');
        }
    }

    // Forgot password
    async forgotPassword(email) {
        try {
            return await apiService.post('/auth/forgot-password', { email }, {
                includeAuth: false
            });
        } catch (error) {
            throw new Error(error.message || 'Failed to send reset email');
        }
    }

    // Reset password
    async resetPassword(token, newPassword) {
        try {
            return await apiService.post('/auth/reset-password', {
                token,
                password: newPassword
            }, {
                includeAuth: false
            });
        } catch (error) {
            throw new Error(error.message || 'Failed to reset password');
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return !!apiService.getToken();
    }

    // Get stored token
    getToken() {
        return apiService.getToken();
    }
}

export const authService = new AuthService();
export default authService;
