import { useState, useEffect, useCallback } from 'react';
import { MOCK_ERROR_QUESTIONS, MockQuestion } from '../api/mockData';
import { useLogger } from '../../utils/logger';

interface UseErrorsReturn {
  errors: MockQuestion[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useErrors(): UseErrorsReturn {
  const logger = useLogger('useErrors');
  const [errors, setErrors] = useState<MockQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchErrors = useCallback(async () => {
    const startTime = performance.now();
    setIsLoading(true);
    setError(null);
    
    logger.info('Iniciando carregamento de erros');
    
    try {
      // Simula delay de API
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Usa dados mockados
      const data = MOCK_ERROR_QUESTIONS;
      setErrors(data);
      
      const duration = Math.round(performance.now() - startTime);
      logger.logPerformance('carregar erros', duration, { count: data.length });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar erros';
      setError(errorMsg);
      logger.error('Falha ao carregar erros', err instanceof Error ? err : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [logger]);

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
