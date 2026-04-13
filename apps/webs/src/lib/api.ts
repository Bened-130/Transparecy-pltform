import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

/**
 * Dashboard data types
 */
export interface Dashboard {
  totalUploads: number;
  verifiedUploads: number;
  pendingUploads: number;
  processedUploads: number;
  totalVotes: number;
  lastUpdated: string;
}

export interface Upload {
  id: string;
  pollingStationId: string;
  status: 'pending' | 'processing' | 'verified' | 'failed' | 'rejected';
  imageCount: number;
  createdAt: string;
  updatedAt: string;
  uploaderPhone: string;
}

export interface Candidate {
  id: string;
  name: string;
  party: string;
  color: string;
  votes: number;
  percentage?: number;
}

export interface VoteTally {
  candidates: Candidate[];
  totalVotes: number;
  lastUpdated: string;
}

/**
 * API Client initialization
 */
class ApiClient {
  private instance: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - clear token if exists
          localStorage.removeItem('authToken');
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authorization token
   */
  setToken(token: string) {
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authorization token
   */
  clearToken() {
    delete this.instance.defaults.headers.common['Authorization'];
  }

  /**
   * Dashboard endpoints
   */
  async getDashboard(): Promise<Dashboard> {
    const response = await this.instance.get<ApiResponse<Dashboard>>('/dashboard');
    return response.data.data || response.data as any;
  }

  /**
   * Vote tally endpoints
   */
  async getVoteTally(): Promise<VoteTally> {
    const response = await this.instance.get<ApiResponse<VoteTally>>('/tally');
    return response.data.data || response.data as any;
  }

  async getVoteTallyByStation(stationId: string): Promise<VoteTally> {
    const response = await this.instance.get<ApiResponse<VoteTally>>(`/tally/station/${stationId}`);
    return response.data.data || response.data as any;
  }

  /**
   * Upload endpoints
   */
  async getUploads(limit: number = 10, offset: number = 0): Promise<Upload[]> {
    const response = await this.instance.get<ApiResponse<Upload[]>>('/uploads', {
      params: { limit, offset },
    });
    return response.data.data || [];
  }

  async getUpload(uploadId: string): Promise<Upload> {
    const response = await this.instance.get<ApiResponse<Upload>>(`/uploads/${uploadId}`);
    return response.data.data || response.data as any;
  }

  async getUploadsByStation(stationId: string): Promise<Upload[]> {
    const response = await this.instance.get<ApiResponse<Upload[]>>(`/uploads/station/${stationId}`);
    return response.data.data || [];
  }

  async searchUploads(query: string): Promise<Upload[]> {
    const response = await this.instance.get<ApiResponse<Upload[]>>('/uploads/search', {
      params: { q: query },
    });
    return response.data.data || [];
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.instance.get('/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

/**
 * Utility functions
 */
export const formatVotes = (votes: number): string => {
  if (votes >= 1000000) {
    return (votes / 1000000).toFixed(1) + 'M';
  } else if (votes >= 1000) {
    return (votes / 1000).toFixed(1) + 'K';
  }
  return votes.toString();
};

export const getVotePercentage = (votes: number, totalVotes: number): number => {
  if (totalVotes === 0) return 0;
  return (votes / totalVotes) * 100;
};

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+254${cleaned.substring(1)}`;
  }
  return phone;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    verified: '#34C759',
    pending: '#FFCC00',
    processing: '#007AFF',
    failed: '#FF3B30',
    rejected: '#FF3B30',
  };
  return colors[status] || '#6B7280';
};

export const getStatusBadge = (status: string): string => {
  const badges: Record<string, string> = {
    verified: 'badge-success',
    pending: 'badge-warning',
    processing: 'badge-primary',
    failed: 'badge-danger',
    rejected: 'badge-danger',
  };
  return badges[status] || 'badge-primary';
};
