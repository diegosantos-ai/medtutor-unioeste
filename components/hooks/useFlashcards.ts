import { useState, useEffect, useCallback } from 'react';
import { MOCK_FLASHCARDS, MockFlashcard } from '../api/mockData';
import { useLogger } from '../../utils/logger';

interface UseFlashcardsReturn {
  flashcards: MockFlashcard[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  reviewCard: (cardId: number, quality: number) => Promise<void>;
  dueCount: number;
}

export function useFlashcards(dueOnly: boolean = true): UseFlashcardsReturn {
  const logger = useLogger('useFlashcards');
  const [flashcards, setFlashcards] = useState<MockFlashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    const startTime = performance.now();
    setIsLoading(true);
    setError(null);
    
    logger.info('Iniciando carregamento de flashcards', { dueOnly });
    
    try {
      // Simula delay de API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Usa dados mockados
      const data = MOCK_FLASHCARDS;
      setFlashcards(data);
      
      const duration = Math.round(performance.now() - startTime);
      logger.logPerformance('carregar flashcards', duration, { 
        count: data.length,
        dueOnly 
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar flashcards';
      setError(errorMsg);
      logger.error('Falha ao carregar flashcards', err instanceof Error ? err : undefined);
    } finally {
      setIsLoading(false);
    }
  }, [dueOnly, logger]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const reviewCard = async (cardId: number, quality: number) => {
    logger.info('Revisando flashcard', { cardId, quality });
    
    try {
      // Simula atualização local
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Remove o card revisado da lista (simula sistema SRS)
      setFlashcards(prev => {
        const newList = prev.filter(card => card.id !== cardId);
        logger.info('Flashcard revisado e removido da fila', { 
          cardId, 
          quality, 
          remaining: newList.length 
        });
        return newList;
      });
    } catch (err) {
      logger.error('Erro ao revisar flashcard', err instanceof Error ? err : undefined, { cardId });
    }
  };

  return {
    flashcards,
    isLoading,
    error,
    refetch: fetchFlashcards,
    reviewCard,
    dueCount: flashcards.length,
  };
}
