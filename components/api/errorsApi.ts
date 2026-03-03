import { apiClient } from './apiClient';

export interface ErrorNotebookItem {
  question_id: string;
  enunciado: string;
  materia: string;
  assunto: string;
  resposta_correta: string;
  sua_resposta: string;
  explicacao: string;
  data_erro: string;
}

export interface ErrorStats {
  erros_por_materia: Record<string, number>;
}

export const errorsApi = {
  getErrors: (materia?: string): Promise<ErrorNotebookItem[]> => {
    const params = materia ? `?materia=${encodeURIComponent(materia)}` : '';
    return apiClient.get(`/api/errors${params}`);
  },

  getErrorStats: (): Promise<ErrorStats> =>
    apiClient.get('/api/errors/stats'),
};
