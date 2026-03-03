import { useState, useEffect, useCallback } from 'react';
import { MOCK_CLINICAL_CASES, MockClinicalCase } from '../api/mockData';

interface UseCasesReturn {
  cases: MockClinicalCase[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCases(): UseCasesReturn {
  const [cases, setCases] = useState<MockClinicalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 700));
    
    try {
      // Usa dados mockados
      setCases(MOCK_CLINICAL_CASES);
    } catch (err) {
      setError('Erro ao carregar casos');
    } finally {
      setIsLoading(false);
    }
  }, []);

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
