const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiError extends Error {
  status?: number;
  data?: any;
  validationErrors?: ValidationError[];
}

interface ValidationError {
  field: string;
  message: string;
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('medtutor_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('medtutor_token', token);
    } else {
      localStorage.removeItem('medtutor_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private parseValidationError(detail: any): { message: string; validationErrors?: ValidationError[] } {
    if (Array.isArray(detail)) {
      const errors: ValidationError[] = detail.map((err: any) => ({
        field: err.loc?.join('.') || 'unknown',
        message: err.msg || 'Erro de validação'
      }));
      const message = errors.map(e => `${e.field}: ${e.message}`).join('; ');
      return { message, validationErrors: errors };
    }
    return { message: String(detail) };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        this.setToken(null);
        localStorage.removeItem('medtutor_token');
        sessionStorage.clear();
        window.location.reload();
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      if (response.status === 422) {
        const errorData = await response.json().catch(() => ({}));
        const { message, validationErrors } = this.parseValidationError(errorData.detail);
        const error: ApiError = new Error(message);
        error.status = 422;
        error.data = errorData;
        error.validationErrors = validationErrors;
        throw error;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.detail || errorData.message || `Erro ${response.status}: ${response.statusText}`;
        
        if (typeof errorMessage === 'object') {
          errorMessage = JSON.stringify(errorMessage);
        }
        
        const error: ApiError = new Error(errorMessage);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro de conexão com o servidor');
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export type { ApiError, ValidationError };
