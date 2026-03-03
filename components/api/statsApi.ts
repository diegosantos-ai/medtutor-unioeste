import { apiClient } from './apiClient';

export interface UserStats {
  total_questions: number;
  correct_answers: number;
  accuracy: number;
  flashcards_reviewed_today: number;
  total_flashcards: number;
  streak: number;
  study_days: number;
}

export const statsApi = {
  getStats: (): Promise<UserStats> =>
    apiClient.get('/api/stats'),
};
