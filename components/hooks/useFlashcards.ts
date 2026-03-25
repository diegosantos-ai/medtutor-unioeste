import { useState, useEffect, useCallback } from 'react';
import { flashcardsApi, Flashcard } from '../api/flashcardsApi';
import { useLogger } from '../../utils/logger';

interface UseFlashcardsReturn {
  flashcards: Flashcard[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  reviewCard: (cardId: number, quality: number) => Promise<void>;
  dueCount: number;
}

export function useFlashcards(dueOnly: boolean = true): UseFlashcardsReturn {
  const logger = useLogger('useFlashcards');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    const startTime = performance.now();
    setIsLoading(true);
    setError(null);

    logger.info('Iniciando carregamento de flashcards', { dueOnly });

    try {
      const data = await flashcardsApi.getFlashcards(dueOnly);
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
      await flashcardsApi.reviewFlashcard(cardId, { quality });

      // Update local state by removing the reviewed card
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
