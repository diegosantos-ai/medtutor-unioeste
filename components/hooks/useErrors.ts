import { useState, useEffect, useCallback } from 'react';
import { MOCK_ERROR_QUESTIONS, MockQuestion } from '../api/mockData';

interface UseErrorsReturn {
  errors: MockQuestion[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useErrors(): UseErrorsReturn {
  const [errors, setErrors] = useState<MockQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchErrors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 600));
    
    try {
      // Usa dados mockados
      setErrors(MOCK_ERROR_QUESTIONS);
    } catch (err) {
      setError('Erro ao carregar erros');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchErrors();
  }, [fetchErrors]);

  return {
    errors,
    isLoading,
    error,
    refetch: fetchErrors,
  };
}
