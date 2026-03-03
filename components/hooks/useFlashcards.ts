import { useState, useEffect, useCallback } from 'react';
import { flashcardsApi, Flashcard, FlashcardReviewData } from '../api/flashcardsApi';

interface UseFlashcardsReturn {
  flashcards: Flashcard[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  reviewCard: (cardId: number, quality: number) => Promise<void>;
  dueCount: number;
}

export function useFlashcards(dueOnly: boolean = true): UseFlashcardsReturn {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await flashcardsApi.getFlashcards(dueOnly);
      setFlashcards(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar flashcards');
    } finally {
      setIsLoading(false);
    }
  }, [dueOnly]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const reviewCard = async (cardId: number, quality: number) => {
    try {
      await flashcardsApi.reviewFlashcard(cardId, { quality });
      // Atualizar lista após revisão
      await fetchFlashcards();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao revisar flashcard');
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
