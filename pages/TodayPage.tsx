import React from 'react';
import { Home, Calendar, RefreshCw, Clock, Target, Zap } from 'lucide-react';

interface TodayPageProps {
  userName?: string;
  currentDay?: number;
  totalDays?: number;
  onStartSession?: () => void;
}

export const TodayPage: React.FC<TodayPageProps> = ({
  userName = 'Aluno',
  currentDay = 1,
  totalDays = 30,
  onStartSession
}) => {
  const progress = Math.round((currentDay / totalDays) * 100);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">
          Bom dia, {userName}!
        </h1>
        <p className="text-zinc-500 mt-1">
          Dia {currentDay} de {totalDays} do seu plano de estudos
        </p>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white mb-6 shadow-lg shadow-emerald-500/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-emerald-100 text-sm font-medium">Progresso do Plano</p>
              <p className="text-2xl font-bold">{progress}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-sm">Dias restantes</p>
            <p className="text-xl font-bold">{totalDays - currentDay}</p>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Action */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">Sessão de Hoje</h2>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-zinc-900">Biologia - Sistema Respiratório</p>
            <p className="text-sm text-zinc-500">Duração estimada: 45 minutos</p>
          </div>
        </div>

        <button
          onClick={onStartSession}
          className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          Iniciar Sessão de Estudo
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center mb-3">
            <RefreshCw className="w-5 h-5" />
          </div>
          <p className="font-semibold text-zinc-900">Revisar Erradas</p>
          <p className="text-sm text-zinc-500">3 questões pendentes</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <p className="font-semibold text-zinc-900">Flashcards</p>
          <p className="text-sm text-zinc-500">12 cartões para revisar</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm">
        <h3 className="font-bold text-zinc-900 mb-4">Resumo da Semana</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-600">5</p>
            <p className="text-sm text-zinc-500">Sessões</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">78%</p>
            <p className="text-sm text-zinc-500">Taxa de Acerto</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">3.2h</p>
            <p className="text-sm text-zinc-500">Estudadas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayPage;
