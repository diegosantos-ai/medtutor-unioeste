import { useState, useEffect, useCallback } from 'react';
import { MOCK_STATS } from '../api/mockData';

interface UserStats {
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  flashcards_reviewed_today: number;
  total_flashcards: number;
  streak: number;
  study_days: number;
}

interface UseStatsReturn {
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 400));

    try {
      // Usa dados mockados
      setStats(MOCK_STATS);
    } catch (err) {
      setError('Erro ao carregar estatísticas');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
