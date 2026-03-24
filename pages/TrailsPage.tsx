import React from 'react';
import { ChevronRight, BookOpen, Brain, FileQuestion, Target } from 'lucide-react';

interface TrailItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  progress: number;
  topics: number;
  completedTopics: number;
}

const trails: TrailItem[] = [
  {
    id: 'biologia',
    title: 'Biologia',
    subtitle: '12 temas • 156 questões',
    icon: <Brain className="w-6 h-6" />,
    progress: 35,
    topics: 12,
    completedTopics: 4,
  },
  {
    id: 'quimica',
    title: 'Química',
    subtitle: '10 temas • 130 questões',
    icon: <BookOpen className="w-6 h-6" />,
    progress: 20,
    topics: 10,
    completedTopics: 2,
  },
  {
    id: 'fisica',
    title: 'Física',
    subtitle: '11 temas • 143 questões',
    icon: <Target className="w-6 h-6" />,
    progress: 15,
    topics: 11,
    completedTopics: 2,
  },
  {
    id: 'portugues',
    title: 'Português',
    subtitle: '8 temas • 104 questões',
    icon: <FileQuestion className="w-6 h-6" />,
    progress: 50,
    topics: 8,
    completedTopics: 4,
  },
];

export const TrailsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">Trilhas de Estudo</h1>
        <p className="text-zinc-500 mt-1">
          Escolha uma disciplina para continuar seus estudos
        </p>
      </div>

      <div className="space-y-4">
        {trails.map((trail) => (
          <div
            key={trail.id}
            className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                {trail.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-bold text-zinc-900">{trail.title}</h3>
                  <span className="text-sm font-semibold text-emerald-600">{trail.progress}%</span>
                </div>
                <p className="text-sm text-zinc-500 mb-2">{trail.subtitle}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>{trail.completedTopics}/{trail.topics} temas concluídos</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2 mt-2">
                  <div
                    className="bg-emerald-500 rounded-full h-2 transition-all"
                    style={{ width: `${trail.progress}%` }}
                  />
                </div>
              </div>

              <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900">Foco Atual</h4>
            <p className="text-sm text-amber-700 mt-1">
              Concentre seus esforços em Biologia para melhorar sua média no simulado.
              Complete os 3 próximos temas para avançar 15%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrailsPage;
