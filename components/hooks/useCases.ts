import { useState, useEffect, useCallback } from 'react';
import { casesApi, ClinicalCase, CaseAnswerData, CaseAnswerResponse } from '../api/casesApi';
import { useLogger } from '../../utils/logger';

interface UseCasesReturn {
  cases: ClinicalCase[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  submitAnswer: (caseId: string, data: CaseAnswerData) => Promise<CaseAnswerResponse>;
}

export function useCases(): UseCasesReturn {
  const logger = useLogger('useCases');
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    const startTime = performance.now();
    setIsLoading(true);
    setError(null);

    logger.info('Iniciando carregamento de casos clínicos');

    try {
      const data = await casesApi.getCases();
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

  const submitAnswer = async (caseId: string, data: CaseAnswerData) => {
    logger.info('Enviando resposta de caso clínico', { caseId, etapa_id: data.etapa_id });
    try {
      return await casesApi.submitAnswer(caseId, data);
    } catch (err) {
      logger.error('Erro ao enviar resposta do caso', err instanceof Error ? err : undefined, { caseId });
      throw err;
    }
  };

  return {
    cases,
    isLoading,
    error,
    refetch: fetchCases,
    submitAnswer,
  };
}
