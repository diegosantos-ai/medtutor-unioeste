import { apiClient } from './apiClient';

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  topic: string;
  next_review: string;
  box: number;
}

export interface FlashcardCreateData {
  front: string;
  back: string;
  topic: string;
}

export interface FlashcardReviewData {
  quality: number; // 0=Errei, 1=Difícil, 2=Bom, 3=Fácil
}

export const flashcardsApi = {
  getFlashcards: (dueOnly: boolean = true): Promise<Flashcard[]> =>
    apiClient.get(`/api/flashcards?due_only=${dueOnly}`),

  createFlashcard: (data: FlashcardCreateData): Promise<Flashcard> =>
    apiClient.post('/api/flashcards', data),

  reviewFlashcard: (cardId: number, data: FlashcardReviewData): Promise<Flashcard> =>
    apiClient.post(`/api/flashcards/${cardId}/review`, data),
};
