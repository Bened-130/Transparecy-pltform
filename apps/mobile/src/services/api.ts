import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Add auth interceptor
api.interceptors.request.use(
  (config) => {
    // Token will be added by caller if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, handle logout
      console.error('Unauthorized - token expired');
    }
    return Promise.reject(error);
  }
);
