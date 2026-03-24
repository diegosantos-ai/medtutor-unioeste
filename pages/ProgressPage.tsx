import React from 'react';
import { TrendingUp, Target, Brain, AlertTriangle, Calendar, Award } from 'lucide-react';

interface SubjectProgress {
  name: string;
  progress: number;
  questions: number;
  accuracy: number;
  color: string;
}

const subjects: SubjectProgress[] = [
  { name: 'Biologia', progress: 65, questions: 45, accuracy: 78, color: 'bg-emerald-500' },
  { name: 'Química', progress: 45, questions: 32, accuracy: 72, color: 'bg-blue-500' },
  { name: 'Física', progress: 30, questions: 28, accuracy: 65, color: 'bg-amber-500' },
  { name: 'Português', progress: 80, questions: 50, accuracy: 85, color: 'bg-rose-500' },
  { name: 'Matemática', progress: 25, questions: 20, accuracy: 60, color: 'bg-purple-500' },
];

export const ProgressPage: React.FC = () => {
  const totalQuestions = subjects.reduce((acc, s) => acc + s.questions, 0);
  const averageAccuracy = Math.round(
    subjects.reduce((acc, s) => acc + (s.accuracy * s.questions), 0) / totalQuestions
  );

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
          <p className="text-2xl font-bold text-zinc-900">12</p>
          <p className="text-sm text-zinc-500">Revisões</p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-zinc-100 shadow-sm">
          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-3">
            <Award className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-zinc-900">7</p>
          <p className="text-sm text-zinc-500">Conquistas</p>
        </div>
      </div>

      {/* Subject Progress */}
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

      {/* Weak Points */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Pontos a Melhorar
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-rose-50 rounded-lg">
            <div>
              <p className="font-medium text-zinc-900">Genética - Meiose</p>
              <p className="text-sm text-zinc-500">3 erros recentes</p>
            </div>
            <button className="px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors">
              Revisar
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <div>
              <p className="font-medium text-zinc-900">Física - Cinemática</p>
              <p className="text-sm text-zinc-500">2 erros recentes</p>
            </div>
            <button className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors">
              Revisar
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <div>
              <p className="font-medium text-zinc-900">Química - Estequiometria</p>
              <p className="text-sm text-zinc-500">1 erro recente</p>
            </div>
            <button className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors">
              Revisar
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Reviews */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">Próximas Revisões</h2>

        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-zinc-50 rounded-lg">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-zinc-900">Flashcards - Sistema Nervoso</p>
              <p className="text-sm text-zinc-500">Amanhã às 14:00</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-zinc-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-zinc-900">Revisão Espaçada - Biologia Celular</p>
              <p className="text-sm text-zinc-500">Em 3 dias</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
