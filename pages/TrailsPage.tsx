import React, { useState, useEffect } from 'react';
import { ChevronRight, BookOpen, Brain, FileQuestion, Target, Loader2 } from 'lucide-react';
import { apiClient } from '../components/api/apiClient';

interface SubjectProgress {
  id: string;
  name: string;
  icon: string;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  accuracy: number;
  progress: number;
}

const iconMap: Record<string, React.ReactNode> = {
  brain: <Brain className="w-6 h-6" />,
  book: <BookOpen className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  file: <FileQuestion className="w-6 h-6" />,
  calculator: <span className="text-xl font-bold">∑</span>,
  clock: <span className="text-xl font-bold">🕐</span>,
  globe: <span className="text-xl font-bold">🌍</span>,
};

export const TrailsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectProgress[]>([]);
  const [focusSubject, setFocusSubject] = useState<string | null>(null);
  const [focusTip, setFocusTip] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTrails();
  }, []);

  const fetchTrails = async () => {
    try {
      const data = await apiClient.get<{
        subjects: SubjectProgress[];
        focus_subject: string | null;
        focus_tip: string | null;
      }>('/trails');
      setSubjects(data.subjects);
      setFocusSubject(data.focus_subject);
      setFocusTip(data.focus_tip);
    } catch (err: any) {
      console.error('Failed to fetch trails:', err);
      setError('Erro ao carregar trilhas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-zinc-500">Carregando trilhas...</span>
      </div>
    );
  }

  if (error || subjects.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm text-center">
          <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 mb-2">Comece a estudar!</h3>
          <p className="text-zinc-500">Responda questões para ver seu progresso nas disciplinas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Trilhas de Estudo</h1>
        <p className="text-zinc-500 mt-1">
          Escolha uma disciplina para continuar seus estudos
        </p>
      </div>

      <div className="space-y-4">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                {iconMap[subject.icon] || <BookOpen className="w-6 h-6" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-zinc-900">{subject.name}</h3>
                  <span className="text-sm font-semibold text-emerald-600">
                    {subject.answered_questions}/{subject.total_questions} questões
                  </span>
                </div>
                <p className="text-sm text-zinc-500 mb-2">
                  {subject.correct_answers} acertos • {subject.accuracy}% precisão
                </p>
                <div className="w-full bg-zinc-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-emerald-500 rounded-full h-2 transition-all"
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {focusTip && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-amber-900">Foco Atual</h4>
              <p className="text-sm text-amber-700 mt-1">{focusTip}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrailsPage;
