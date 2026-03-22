import { useState, useEffect, useCallback } from 'react';
import { MOCK_CLINICAL_CASES, MockClinicalCase } from '../api/mockData';
import { useLogger } from '../../utils/logger';

interface UseCasesReturn {
  cases: MockClinicalCase[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCases(): UseCasesReturn {
  const logger = useLogger('useCases');
  const [cases, setCases] = useState<MockClinicalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    const startTime = performance.now();
    setIsLoading(true);
    setError(null);

    logger.info('Iniciando carregamento de casos clínicos');

    try {
      // Simula delay de API
      await new Promise(resolve => setTimeout(resolve, 700));

      // Usa dados mockados
      const data = MOCK_CLINICAL_CASES;
      setCases(data);

      const duration = Math.round(performance.now() - startTime);
      logger.logPerformance('carregar casos', duration, { count: data.length });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar casos';
      setError(errorMsg);
      logger.error('Falha ao carregar casos', err instanceof Error ? err : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [logger]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  return {
    cases,
    isLoading,
    error,
    refetch: fetchCases,
  };
}
