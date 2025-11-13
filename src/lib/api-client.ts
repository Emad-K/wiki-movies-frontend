/**
 * Axios client for backend API calls
 * Includes API key authentication and global timeout
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { BACKEND_BASE_URL, BACKEND_API_KEY } from './env';

// Global timeout constant (10 seconds)
export const API_TIMEOUT = 10000;

/**
 * Create and configure axios instance for backend API calls
 */
export const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: BACKEND_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Set Authorization header separately to ensure it's properly set
  client.defaults.headers.common['Authorization'] = `Bearer ${BACKEND_API_KEY}`;

  // Request interceptor for logging (optional)
  client.interceptors.request.use(
    (config) => {
      // You can add request logging here if needed
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Handle timeout errors
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout:', error.message);
      }
      
      // Handle network errors
      if (!error.response) {
        console.error('Network error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

// Export a singleton instance
export const apiClient = createApiClient();

