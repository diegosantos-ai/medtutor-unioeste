import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/apiClient';
import { authApi, User, LoginCredentials, RegisterData } from '../api/authApi';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = apiClient.getToken();
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const userData = await authApi.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
      apiClient.setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(credentials);
      apiClient.setToken(response.access_token);
      setUser(response.user);
      
      // Salvar sessão no localStorage para compatibilidade
      localStorage.setItem('medtutor_session', JSON.stringify({
        matricula: `MT-${response.user.id.toString().padStart(4, '0')}`,
        userId: response.user.id,
        email: response.user.email,
        name: response.user.name,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(data);
      apiClient.setToken(response.access_token);
      setUser(response.user);
      
      localStorage.setItem('medtutor_session', JSON.stringify({
        matricula: `MT-${response.user.id.toString().padStart(4, '0')}`,
        userId: response.user.id,
        email: response.user.email,
        name: response.user.name,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    
    const updated = await authApi.updateMe(data);
    setUser(updated);
    
    // Atualizar sessão no localStorage
    const session = JSON.parse(localStorage.getItem('medtutor_session') || '{}');
    session.name = updated.name;
    localStorage.setItem('medtutor_session', JSON.stringify(session));
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
