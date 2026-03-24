import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, Brain, AlertTriangle, Calendar, Award, Loader2 } from 'lucide-react';
import { apiClient } from '../components/api/apiClient';

interface ProgressData {
  user_id: string;
  current_day: number;
  total_days: number;
  progress_percent: number;
  days_completed: number;
  days_remaining: number;
  accuracy: number;
  streak: number;
  total_flashcards: number;
  flashcards_reviewed_today: number;
  total_questions: number;
  correct_answers: number;
  study_sessions_today: number;
  hours_studied_today: number;
}

interface SubjectProgress {
  name: string;
  progress: number;
  questions: number;
  accuracy: number;
  color: string;
}

export const ProgressPage: React.FC = () => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const [progData, trailsData] = await Promise.all([
        apiClient.get<ProgressData>('/progress'),
        apiClient.get<{subjects: any[]}>('/trails').catch(() => ({ subjects: [] }))
      ]);
      setProgress(progData);
      
      const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
      const mappedSubjects = (trailsData.subjects || []).map((s: any, idx: number) => ({
        name: s.name,
        progress: s.progress,
        questions: s.total_questions,
        accuracy: s.accuracy,
        color: colors[idx % colors.length]
      }));
      setSubjects(mappedSubjects);
    } catch (err: any) {
      console.error('Failed to fetch progress:', err);
      setError('Erro ao carregar progresso');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-zinc-500">Carregando progresso...</span>
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error || 'Erro ao carregar progresso'}
        </div>
      </div>
    );
  }

  const totalQuestions = progress.total_questions || 0;
  const averageAccuracy = progress.accuracy || 0;

  const totalSubjects = subjects.reduce((acc, s) => acc + s.questions, 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Progresso</h1>
        <p className="text-zinc-500 mt-1">
          Acompanhe sua evolução no vestibular
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-zinc-100 shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-3">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{averageAccuracy}%</p>
          <p className="text-sm text-zinc-500">Taxa de Acerto</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-100 shadow-sm">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">
            <Brain className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{totalQuestions}</p>
          <p className="text-sm text-zinc-500">Questões</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-100 shadow-sm">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{progress.flashcards_reviewed_today}</p>
          <p className="text-sm text-zinc-500">Revisões Hoje</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-100 shadow-sm">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">{progress.streak}</p>
          <p className="text-sm text-zinc-500">Dias Seguidos</p>
        </div>
      </div>

      {/* Plan Progress */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-emerald-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-emerald-100 text-sm font-medium">Progresso do Plano</p>
              <p className="text-2xl font-bold">{Math.round((progress.current_day / progress.total_days) * 100)}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-sm">Dia {progress.current_day} de {progress.total_days}</p>
            <p className="text-xl font-bold">{progress.days_remaining} restantes</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${(progress.current_day / progress.total_days) * 100}%` }}
          />
        </div>
      </div>

      {/* Subject Progress */}
      {totalSubjects > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-zinc-900 mb-6">Domínio por Disciplina</h2>

          <div className="space-y-5">
            {subjects.map((subject) => (
              <div key={subject.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                    <span className="font-medium text-zinc-900">{subject.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-zinc-500">{subject.questions} questões</span>
                    <span className="font-semibold text-emerald-600">{subject.accuracy}% acerto</span>
                  </div>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-3">
                  <div
                    className={`${subject.color} rounded-full h-3 transition-all duration-500`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalQuestions === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-zinc-100 shadow-sm mb-8 text-center">
          <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-2">Comece a estudar!</h3>
          <p className="text-zinc-500">Resolva questões para ver seu progresso aqui.</p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">Resumo de Estudos</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-zinc-50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-600">{progress.study_sessions_today}</p>
            <p className="text-sm text-zinc-500">Sessões Hoje</p>
          </div>
          <div className="text-center p-4 bg-zinc-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">{progress.hours_studied_today}h</p>
            <p className="text-sm text-zinc-500">Horas Estudadas</p>
          </div>
          <div className="text-center p-4 bg-zinc-50 rounded-xl">
            <p className="text-2xl font-bold text-amber-600">{progress.total_flashcards}</p>
            <p className="text-sm text-zinc-500">Flashcards</p>
          </div>
          <div className="text-center p-4 bg-zinc-50 rounded-xl">
            <p className="text-2xl font-bold text-purple-600">{progress.correct_answers}</p>
            <p className="text-sm text-zinc-500">Acertos</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
