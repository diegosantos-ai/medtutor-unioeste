import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, Line
} from 'recharts';
import { TrendingUp, Target, Brain, Award, Loader2, AlertCircle } from 'lucide-react';
import { TourTip } from './TourTip';
import { useStats } from './hooks/useStats';

interface DashboardProps {
  showTour?: boolean;
  currentDay?: number;
  totalDays?: number;
}

export const PerformanceDashboard: React.FC<DashboardProps> = ({
  showTour = false,
  currentDay = 1,
  totalDays = 30,
}) => {
  const { stats, isLoading, error } = useStats();

  const progressPercent = Math.round((currentDay / totalDays) * 100);
  const daysRemaining = totalDays - currentDay;

  // Dados mockados para evolução semanal (serão substituídos por dados reais futuramente)
  const weeklyData = [
    { name: 'Sem 1', acertos: 45, meta: 70 },
    { name: 'Sem 2', acertos: 55, meta: 70 },
    { name: 'Sem 3', acertos: 62, meta: 70 },
    { name: 'Sem 4', acertos: stats?.accuracy || 0, meta: 70 },
  ].filter(d => d.acertos > 0);

  // Dados de desempenho por tipo de atividade
  const activityData = [
    { subject: 'Questões', score: Math.min(100, stats?.accuracy || 0) },
    { subject: 'Flashcards', score: Math.min(100, (stats?.flashcards_reviewed_today || 0) * 10) },
    { subject: 'Streak', score: Math.min(100, (stats?.streak || 0) * 10) },
    { subject: 'Geral', score: Math.min(100, progressPercent) },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-zinc-500">Carregando estatísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-zinc-100 p-8">
        <AlertCircle className="w-8 h-8 text-red-500 mb-4" />
        <p className="text-zinc-700 mb-2">Erro ao carregar estatísticas</p>
        <p className="text-zinc-500 text-sm">{error}</p>
      </div>
    );
  }

  const accuracy = stats?.accuracy || 0;
  const totalQuestions = stats?.total_questions || 0;
  const correctAnswers = stats?.correct_answers || 0;
  const streak = stats?.streak || 0;

  return (
    <div className="space-y-6">
      <TourTip
        show={showTour}
        title="Dashboard de Desempenho"
        description="Acompanhe sua evolução com dados reais do seu progresso."
      />

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <p className="font-bold text-zinc-500 text-sm">Precisão</p>
          </div>
          <h3 className="text-3xl font-black text-zinc-900">{accuracy}%</h3>
          <p className="text-xs text-emerald-500 font-medium mt-1">
            {correctAnswers}/{totalQuestions} acertos
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <Target className="w-5 h-5" />
            </div>
            <p className="font-bold text-zinc-500 text-sm">Total de Questões</p>
          </div>
          <h3 className="text-3xl font-black text-zinc-900">{totalQuestions}</h3>
          <p className="text-xs text-blue-500 font-medium mt-1">
            {stats?.study_days || 0} dias de estudo
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <p className="font-bold text-zinc-500 text-sm">Streak</p>
          </div>
          <h3 className="text-3xl font-black text-zinc-900">{streak}</h3>
          <p className="text-xs text-amber-500 font-medium mt-1">
            dias seguidos
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center text-rose-600">
              <Brain className="w-5 h-5" />
            </div>
            <p className="font-bold text-zinc-500 text-sm">Dias Restantes</p>
          </div>
          <h3 className="text-3xl font-black text-zinc-900">{daysRemaining}</h3>
          <p className="text-xs text-rose-500 font-medium mt-1">
            {progressPercent}% concluído
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <h4 className="font-bold text-zinc-800 mb-6 text-lg">Evolução de Acertos</h4>
          <div className="h-64">
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a'}} domain={[0, 100]} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="acertos" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} name="Acertos (%)" />
                  <Line type="step" dataKey="meta" stroke="#f43f5e" strokeWidth={2} dot={false} name="Meta (%)" strokeDasharray="5 5" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-400">
                <p>Complete questões para ver o gráfico</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
          <h4 className="font-bold text-zinc-800 mb-6 text-lg">Desempenho por Atividade</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#71717a'}} />
                <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{fill: '#3f3f46', fontWeight: 500}} width={80} />
                <Tooltip cursor={{fill: '#f4f4f5'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                <Bar dataKey="score" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={25} name="Progresso (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
