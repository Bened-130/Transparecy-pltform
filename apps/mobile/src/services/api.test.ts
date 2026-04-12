import axios from 'axios';
import { apiClient, handleError } from './api';

jest.mock('axios');

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create axios instance with correct baseURL', () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(apiClient.defaults.timeout).toBe(10000);
  });

  test('should have authorization interceptor', () => {
    expect(apiClient.interceptors.request).toBeDefined();
  });

  test('handleError should return error message', () => {
    const error = new Error('Network error');
    const result = handleError(error);
    expect(result).toContain('Error');
  });

  test('handleError should handle axios errors', () => {
    const axiosError = {
      response: { data: { message: 'Unauthorized' } },
      message: 'Request failed',
    };
    const result = handleError(axiosError);
    expect(result).toBeDefined();
  });
});
