import React, { useState, useEffect } from 'react';
import { WeeklyPlan, UserProfile, StudyTask } from '../types';
import { CheckCircle2, Circle, Play, Pause, RotateCcw, Flame } from 'lucide-react';

interface DashboardProps {
  plan: WeeklyPlan | null;
  profile: UserProfile;
  onUpdatePlan: (plan: WeeklyPlan) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ plan, profile, onUpdatePlan }) => {
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [activeTask, setActiveTask] = useState<string | null>(null);

  // Simple Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
      // Play sound or notify
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const toggleTimer = () => setTimerActive(!timerActive);
  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTaskCompletion = (dayIndex: number, taskId: string) => {
    if (!plan) return;
    const newPlan = { ...plan };
    const task = newPlan.schedule[dayIndex].tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      onUpdatePlan(newPlan);
    }
  };

  // Get today's tasks (Mocking "Day 1" for MVP simplicity, in real app match date)
  const todayTasks = plan?.schedule[0]?.tasks || [];
  const completedCount = todayTasks.filter(t => t.completed).length;
  const progress = todayTasks.length > 0 ? (completedCount / todayTasks.length) * 100 : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-20">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between item-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-surface-900">Olá, {profile.name}</h1>
          <p className="text-surface-500">Foco total na sua aprovação hoje.</p>
        </div>

        {/* Stats / Streak */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-surface-100">
          <div className="flex items-center text-orange-500 font-bold">
            <Flame size={20} className="mr-1 fill-current" />
            {profile.streak} dias
          </div>
          <div className="w-px h-4 bg-surface-200"></div>
          <div className="text-sm text-surface-600">
            {completedCount}/{todayTasks.length} Missões
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Column: Daily Missions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-surface-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-surface-800">Missões de Hoje</h2>
              <span className="text-sm font-medium text-brand-600 bg-brand-50 px-3 py-1 rounded-full">Dia 1</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-surface-100 rounded-full h-2 mb-6">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="space-y-3">
              {todayTasks.length === 0 ? (
                <p className="text-surface-500 text-center py-8">Sem tarefas para hoje. Aproveite o descanso!</p>
              ) : (
                todayTasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className={`group flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${task.completed
                        ? 'bg-surface-50 border-transparent opacity-75'
                        : activeTask === task.id
                          ? 'bg-white border-brand-500 ring-1 ring-brand-500 shadow-sm'
                          : 'bg-white border-surface-200 hover:border-brand-300'
                      }`}
                    onClick={() => !task.completed && setActiveTask(task.id)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskCompletion(0, task.id);
                      }}
                      className={`mt-1 transition-colors ${task.completed ? 'text-brand-500' : 'text-surface-300 hover:text-brand-500'}`}
                    >
                      {task.completed ? <CheckCircle2 size={24} className="fill-brand-100" /> : <Circle size={24} />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${task.subject.includes('Biologia') ? 'bg-green-100 text-green-700' :
                            task.subject.includes('Química') ? 'bg-purple-100 text-purple-700' :
                              task.subject.includes('Física') ? 'bg-blue-100 text-blue-700' :
                                'bg-surface-100 text-surface-600'
                          }`}>
                          {task.subject}
                        </span>
                        <span className="text-xs text-surface-400 font-medium flex items-center gap-1">
                          <Play size={10} className="fill-current" /> {task.duration}
                        </span>
                      </div>
                      <h3 className={`font-medium ${task.completed ? 'text-surface-400 line-through' : 'text-surface-800'}`}>
                        {task.topic}
                      </h3>
                      <p className="text-sm text-surface-500 mt-1">{task.objective}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Column: Pomodoro */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-surface-100 sticky top-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-surface-700 mb-1">Foco Absoluto</h3>
              <p className="text-sm text-surface-500">Técnica Pomodoro</p>
            </div>

            <div className="flex justify-center mb-8">
              <div className={`relative flex items-center justify-center w-48 h-48 rounded-full border-4 ${timerActive ? 'border-brand-500' : 'border-surface-200'} transition-colors duration-300`}>
                <div className="text-5xl font-mono font-bold text-surface-800 tracking-tighter">
                  {formatTime(timeLeft)}
                </div>
                {timerActive && (
                  <span className="absolute -top-2 right-10 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={toggleTimer}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white transition-colors ${timerActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-brand-600 hover:bg-brand-700'
                  }`}
              >
                {timerActive ? <Pause size={20} /> : <Play size={20} />}
                {timerActive ? 'Pausar' : 'Focar'}
              </button>
              <button
                onClick={resetTimer}
                className="p-3 rounded-lg border border-surface-200 text-surface-500 hover:bg-surface-50 hover:text-surface-700 transition-colors"
                title="Reiniciar"
              >
                <RotateCcw size={20} />
              </button>
            </div>

            {activeTask && (
              <div className="mt-6 p-3 bg-brand-50 rounded-lg text-sm text-brand-800 text-center border border-brand-100">
                Focando em:<br /><strong>{todayTasks.find(t => t.id === activeTask)?.topic}</strong>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
