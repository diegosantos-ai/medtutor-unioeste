
import React from 'react';
import { UserProfile } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Trophy, Target, Zap, Clock } from 'lucide-react';

const ProgressTracker: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  const studyData = [
    { day: 'Seg', hours: 0 },
    { day: 'Ter', hours: 0 },
    { day: 'Qua', hours: 0 },
    { day: 'Qui', hours: 0 },
    { day: 'Sex', hours: 0 },
    { day: 'Sáb', hours: 0 },
    { day: 'Dom', hours: 0 },
  ];

  const masteryData = [
    { subject: 'Biologia', level: 0 },
    { subject: 'Química', level: 0 },
    { subject: 'Física', level: 0 },
    { subject: 'Matemática', level: 0 },
    { subject: 'Redação', level: 0 },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Análise de Desempenho</h1>
        <p className="text-slate-500 mt-1">Seu progresso é monitorado em tempo real pela IA.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Estudado', val: '0h', icon: Clock, color: 'blue' },
          { label: 'Média Acertos', val: '0%', icon: Target, color: 'emerald' },
          { label: 'Sequência Atual', val: `${profile.streak || 0} dias`, icon: Zap, color: 'amber' },
          { label: 'Posição Simulados', val: '-', icon: Trophy, color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Frequência Semanal (Horas)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#fff', color: '#000'}} />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Domínio por Disciplina (%)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masteryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={80} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#fff', color: '#000'}} />
                <Bar dataKey="level" radius={[0, 10, 10, 0]} barSize={24}>
                  {masteryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
