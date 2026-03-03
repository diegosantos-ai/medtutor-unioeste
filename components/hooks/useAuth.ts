import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function useAuthGuard(requireAuth: boolean = true) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      // Redirecionar para login se necessário
      window.location.href = '/login';
    }

    if (!requireAuth && isAuthenticated) {
      // Redirecionar para app se já estiver logado
      window.location.href = '/';
    }
  }, [isAuthenticated, isLoading, requireAuth]);

  return { isAuthenticated, isLoading };
}
