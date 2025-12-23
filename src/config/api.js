// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// LinkedIn OAuth Configuration
export const LINKEDIN_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
  REDIRECT_URI: import.meta.env.VITE_LINKEDIN_REDIRECT_URI || `${window.location.origin}/auth/linkedin/callback`,
  SCOPE: 'r_liteprofile r_emailaddress',
};

// Application Configuration
export const APP_CONFIG = {
  NAME: 'PeerConnect',
  VERSION: '1.0.0',
  DESCRIPTION: 'College Student Networking Platform',
};

// Enhanced API Service Class
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = localStorage.getItem('token');
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('token');
  }

  // Get headers with authentication
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.getToken()) {
      headers['Authorization'] = `Bearer ${this.getToken()}`;
    }

    return headers;
  }

  // Sleep function for retry delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic request method with enhanced error handling and retry logic
  async request(endpoint, options = {}, attempt = 1) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      timeout: this.timeout,
      ...options,
    };

    try {
      console.log(`Making ${config.method || 'GET'} request to:`, url, `(attempt ${attempt})`);

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else if (response.status === 204) {
        // No content response
        data = null;
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        console.error(`API Error ${response.status}:`, data);

        // Handle authentication errors
        if (response.status === 401) {
          console.log('Authentication failed, clearing token and redirecting to login');
          this.setToken(null);

          // Only redirect if we're not already on login page
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
          throw new Error('Authentication failed. Please login again.');
        }

        // Handle permission errors
        if (response.status === 403) {
          throw new Error('You do not have permission to perform this action.');
        }

        // Handle not found errors
        if (response.status === 404) {
          throw new Error('Resource not found.');
        }

        // Handle server errors with retry
        if (response.status >= 500 && attempt < this.retryAttempts) {
          console.log(`Server error, retrying in ${this.retryDelay}ms...`);
          await this.sleep(this.retryDelay * attempt);
          return this.request(endpoint, options, attempt + 1);
        }

        // Handle other HTTP errors
        const errorMessage = data?.message || data?.error || data || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('Request failed:', error);

      // Handle network errors with retry
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        if (attempt < this.retryAttempts) {
          console.log(`Network error, retrying in ${this.retryDelay}ms...`);
          await this.sleep(this.retryDelay * attempt);
          return this.request(endpoint, options, attempt + 1);
        }
        throw new Error('Network error. Please check your connection and try again.');
      }

      // Handle timeout errors with retry
      if (error.name === 'AbortError') {
        if (attempt < this.retryAttempts) {
          console.log(`Request timeout, retrying in ${this.retryDelay}ms...`);
          await this.sleep(this.retryDelay * attempt);
          return this.request(endpoint, options, attempt + 1);
        }
        throw new Error('Request timeout. Please try again.');
      }

      throw error;
    }
  }

  // HTTP methods
  async get(endpoint, params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return this.request(url, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload file method
  async upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it
        'Authorization': `Bearer ${this.getToken()}`
      },
      includeAuth: false // We're manually setting auth header above
    });
  }

  // Health check method
  async healthCheck() {
    try {
      await this.request('/health', {
        method: 'GET',
        includeAuth: false
      });
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Get API info
  getApiInfo() {
    return {
      baseURL: this.baseURL,
      timeout: this.timeout,
      retryAttempts: this.retryAttempts,
      retryDelay: this.retryDelay,
      hasToken: !!this.getToken()
    };
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;

// Also export the class for testing purposes
export { ApiService };