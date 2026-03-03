import { useState, useEffect, useCallback } from 'react';
import { MOCK_FLASHCARDS, MockFlashcard } from '../api/mockData';

interface UseFlashcardsReturn {
  flashcards: MockFlashcard[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  reviewCard: (cardId: number, quality: number) => Promise<void>;
  dueCount: number;
}

export function useFlashcards(dueOnly: boolean = true): UseFlashcardsReturn {
  const [flashcards, setFlashcards] = useState<MockFlashcard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      // Usa dados mockados
      const data = MOCK_FLASHCARDS;
      setFlashcards(data);
    } catch (err) {
      setError('Erro ao carregar flashcards');
    } finally {
      setIsLoading(false);
    }
  }, [dueOnly]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const reviewCard = async (cardId: number, quality: number) => {
    // Simula atualização local
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Remove o card revisado da lista (simula sistema SRS)
    setFlashcards(prev => prev.filter(card => card.id !== cardId));
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
