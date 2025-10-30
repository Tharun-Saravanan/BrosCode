// API Client for backend endpoints
import { AuthService } from './authService';

// API Base URL from environment or deployment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://wb16fax93g.execute-api.us-east-2.amazonaws.com/dev';

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

export interface ApiError {
  message: string;
  error?: string;
}

export class ApiClient {
  private static baseUrl = API_BASE_URL;

  /**
   * Get authentication headers
   */
  private static async getAuthHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add auth token if user is authenticated
    try {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser?.accessToken) {
        headers['Authorization'] = `Bearer ${currentUser.accessToken}`;
      }
    } catch (error) {
      console.warn('No auth token available');
    }

    return headers;
  }

  /**
   * Make a GET request
   */
  static async get<T>(endpoint: string): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('🌐 API GET:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      console.log('✅ API GET success:', endpoint);
      return result.data as T;
    } catch (error: any) {
      console.error('❌ API GET error:', endpoint, error);
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  /**
   * Make a POST request
   */
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('🌐 API POST:', url, data);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      console.log('✅ API POST success:', endpoint);
      return result.data as T;
    } catch (error: any) {
      console.error('❌ API POST error:', endpoint, error);
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  /**
   * Make a PUT request
   */
  static async put<T>(endpoint: string, data: any): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('🌐 API PUT:', url, data);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      console.log('✅ API PUT success:', endpoint);
      return result.data as T;
    } catch (error: any) {
      console.error('❌ API PUT error:', endpoint, error);
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  /**
   * Make a DELETE request
   */
  static async delete<T>(endpoint: string): Promise<T> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('🌐 API DELETE:', url);

      const headers = await this.getAuthHeaders();
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      console.log('✅ API DELETE success:', endpoint);
      return result.data as T;
    } catch (error: any) {
      console.error('❌ API DELETE error:', endpoint, error);
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  /**
   * Set custom base URL
   */
  static setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get current base URL
   */
  static getBaseUrl(): string {
    return this.baseUrl;
  }
}
