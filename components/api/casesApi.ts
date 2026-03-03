import { apiClient } from './apiClient';

export interface ClinicalCase {
  id: string;
  titulo: string;
  descricao: string;
  dificuldade: string;
  etapas: Array<{
    id: number;
    tipo: string;
    pergunta: string;
    alternativas: Record<string, string>;
    resposta_correta: string;
  }>;
}

export interface CaseAnswerData {
  etapa_id: number;
  resposta: string;
}

export interface CaseAnswerResponse {
  correto: boolean;
  resposta_correta: string;
  explicacao: string;
  proxima_etapa: null | number;
}

export const casesApi = {
  getCases: (dificuldade?: string): Promise<ClinicalCase[]> => {
    const params = dificuldade ? `?dificuldade=${encodeURIComponent(dificuldade)}` : '';
    return apiClient.get(`/api/cases${params}`);
  },

  getCaseDetail: (caseId: string): Promise<ClinicalCase> =>
    apiClient.get(`/api/cases/${caseId}`),

  submitAnswer: (caseId: string, data: CaseAnswerData): Promise<CaseAnswerResponse> =>
    apiClient.post(`/api/cases/${caseId}/answer`, data),
};
