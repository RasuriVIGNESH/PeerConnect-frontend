// src/services/api.js

import { API_CONFIG } from '../config/api.js';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Set authentication token
  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Get authentication token
  getToken() {
    return localStorage.getItem('token');
  }

  // Get headers with authentication
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (includeAuth && token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    let url = `${this.baseURL}${endpoint}`;

    // Append query params if they exist
    if (options.params) {
      const query = new URLSearchParams(options.params).toString();
      if (query) {
        url += `?${query}`;
      }
    }

    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };
    // Don't pass custom `params` option to fetch
    delete config.params;

    try {
      const response = await fetch(url, config);
      
      if (response.status === 204 || !response.headers.get('content-type')?.includes('application/json')) {
        if (response.ok) return response.text();
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.setToken(null);
          // Redirect to login, but avoid breaking server-side rendering
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', url, error);
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint, params = {}, options = {}) {
    return this.request(endpoint, { method: 'GET', params, ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options,
    });
  }

  async put(endpoint, data, params = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      params,
      ...options,
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

export const apiService = new ApiService();
export default apiService;