import React, { useState, useEffect } from 'react';
import { FileQuestion, CheckCircle2, X, Loader2 } from 'lucide-react';
import { apiClient } from '../components/api/apiClient';

interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  status?: 'correct' | 'incorrect' | null;
  enunciado: string;
}

export const QuestionsPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [filter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status_filter: filter } : {};
      const data = await apiClient.get<{
        questions: Question[];
        total: number;
        by_status: Record<string, number>;
      }>('/questions', params);
      setQuestions(data.questions);
    } catch (err: any) {
      console.error('Failed to fetch questions:', err);
      setError('Erro ao carregar questões');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil':
      case 'Fácil ':
        return 'bg-emerald-100 text-emerald-700';
      case 'Médio':
      case 'Média':
        return 'bg-amber-100 text-amber-700';
      case 'Difícil':
        return 'bg-rose-100 text-rose-700';
      default:
        return 'bg-zinc-100 text-zinc-700';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    const d = difficulty.trim();
    if (d === 'Fácil' || d === 'Facil') return 'Fácil';
    if (d === 'Médio' || d === 'Média') return 'Médio';
    if (d === 'Difícil') return 'Difícil';
    return d;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Questões</h1>
        <p className="text-zinc-500 mt-1">
          Pratique com questões do vestibular UNIOESTE
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-zinc-900 text-white'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          Todas
        </button>
        <button
          onClick={() => setFilter('not_started')}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
            filter === 'not_started'
              ? 'bg-zinc-900 text-white'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          Não Iniciadas
        </button>
        <button
          onClick={() => setFilter('incorrect')}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
            filter === 'incorrect'
              ? 'bg-zinc-900 text-white'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          Erradas
        </button>
        <button
          onClick={() => setFilter('correct')}
          className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
            filter === 'correct'
              ? 'bg-zinc-900 text-white'
              : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
          }`}
        >
          Acertadas
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          <span className="ml-3 text-zinc-500">Carregando questões...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error}
        </div>
      ) : (
        <>
          {/* Questions List */}
          <div className="space-y-3">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-xl p-5 border border-zinc-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {question.status === 'correct' && (
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  {question.status === 'incorrect' && (
                    <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
                      <X className="w-5 h-5" />
                    </div>
                  )}
                  {question.status === null && (
                    <div className="w-10 h-10 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center shrink-0">
                      <FileQuestion className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-zinc-900">{question.topic}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(question.difficulty)}`}>
                        {getDifficultyLabel(question.difficulty)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-500">{question.subject}</p>
                    <p className="text-xs text-zinc-400 mt-1 truncate">{question.enunciado}</p>
                  </div>

                  <button className="px-4 py-2 bg-zinc-900 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors">
                    Responder
                  </button>
                </div>
              </div>
            ))}
          </div>

          {questions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileQuestion className="w-8 h-8" />
              </div>
              <p className="text-zinc-500">Nenhuma questão encontrada</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionsPage;
