import { apiClient } from './apiClient';

export interface User {
  id: number;
  email: string;
  name: string;
  daily_hours: number;
  difficulties: string[];
  learning_style: string;
  has_onboarded: boolean;
  streak: number;
  last_study_date?: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserUpdateData {
  name?: string;
  daily_hours?: number;
  difficulties?: string[];
  learning_style?: string;
  academic_history?: string;
  has_onboarded?: boolean;
}

export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    apiClient.post('/api/auth/login', credentials),

  register: (data: RegisterData): Promise<AuthResponse> =>
    apiClient.post('/api/auth/register', data),

  getMe: (): Promise<User> =>
    apiClient.get('/api/auth/me'),

  updateMe: (data: UserUpdateData): Promise<User> =>
    apiClient.put('/api/auth/me', data),

  logout: (): void => {
    apiClient.setToken(null);
    localStorage.removeItem('medtutor_session');
  },
};
