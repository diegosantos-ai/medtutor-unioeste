import React, { useState } from 'react';
import { PlayCircle, Code2, BookOpen as BookOpenIcon, CheckCircle2, Circle } from 'lucide-react';

interface Task {
  id: string;
  subject: string;
  topic: string;
  duration: string;
  objective: string;
  type: 'teoria' | 'video' | 'quiz' | 'resumo';
  video_url?: string;
  video_title?: string;
  video_channel?: string;
  quiz?: { question: string; options: string[]; answer: string }[];
  completed: boolean;
}

interface StudyDayProps {
  day: number;
  tasks: Task[];
  summary?: string;
  mindmap_url?: string;
  onTaskComplete?: (taskId: string) => void;
}

export const StudyDay: React.FC<StudyDayProps> = ({ day, tasks, summary, mindmap_url, onTaskComplete }) => {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [quizAnswers, setQuizAnswers] = useState<{ [taskId: string]: { [qIdx: number]: number } }>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Set<string>>(new Set());

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      onTaskComplete?.(taskId);
      return next;
    });
  };

  const handleQuizAnswer = (taskId: string, qIdx: number, optIdx: number) => {
    if (quizSubmitted.has(taskId)) return;
    setQuizAnswers(prev => ({
      ...prev,
      [taskId]: { ...(prev[taskId] || {}), [qIdx]: optIdx }
    }));
  };

  const submitQuiz = (taskId: string) => {
    setQuizSubmitted(prev => new Set(prev).add(taskId));
    setCompletedTasks(prev => new Set(prev).add(taskId));
    onTaskComplete?.(taskId);
  };

  return (
    <div className="space-y-4">
      {tasks.map(task => {
        const isCompleted = completedTasks.has(task.id) || task.completed;
        
        return (
          <div key={task.id} className={`bg-white rounded-2xl p-6 shadow-sm border transition-all ${isCompleted ? 'border-emerald-200 bg-emerald-50/30' : 'border-zinc-100 hover:shadow-md'}`}>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                {task.type === 'video' && <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center"><PlayCircle className="w-6 h-6" /></div>}
                {task.type === 'quiz' && <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><Code2 className="w-6 h-6" /></div>}
                {(task.type === 'teoria' || task.type === 'resumo') && <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><BookOpenIcon className="w-6 h-6" /></div>}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{task.subject}</span>
                  <span className="text-xs font-medium text-zinc-400 flex items-center gap-1">{'<'}{task.duration}</span>
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-1 leading-tight">{task.topic}</h3>
                <p className="text-sm text-zinc-500 mb-4">{task.objective}</p>

                {task.type === 'video' && task.video_url && (
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-zinc-800">{task.video_title || "Aula em Video"}</p>
                      <p className="text-xs text-zinc-500">{task.video_channel || "YouTube"}</p>
                    </div>
                    <a href={task.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium px-4 py-2 rounded-lg text-sm transition-colors">
                      <PlayCircle className="w-4 h-4" /> Assistir
                    </a>
                  </div>
                )}

                {task.type === 'quiz' && task.quiz && (
                  <div className="mt-4 space-y-4 bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    {task.quiz.map((q, qIdx) => {
                      const taskAnswers = quizAnswers[task.id] || {};
                      const selectedOpt = taskAnswers[qIdx];
                      const isSubmitted = quizSubmitted.has(task.id);
                      const correctIdx = q.options.indexOf(q.answer);

                      return (
                        <div key={qIdx}>
                          <p className="font-semibold text-zinc-800 text-sm mb-3">Questao {qIdx + 1}: {q.question}</p>
                          <div className="grid grid-cols-1 gap-2">
                            {q.options.map((opt, oIdx) => {
                              let btnClass = "border-zinc-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 text-zinc-700";
                              
                              if (isSubmitted) {
                                if (oIdx === correctIdx) {
                                  btnClass = "border-emerald-500 bg-emerald-50 text-emerald-800";
                                } else if (oIdx === selectedOpt && oIdx !== correctIdx) {
                                  btnClass = "border-rose-500 bg-rose-50 text-rose-800";
                                } else {
                                  btnClass = "border-zinc-100 bg-zinc-50 text-zinc-400 opacity-50";
                                }
                              } else if (oIdx === selectedOpt) {
                                btnClass = "border-emerald-500 bg-emerald-50 text-emerald-800";
                              }

                              return (
                                <button 
                                  key={opt} 
                                  onClick={() => handleQuizAnswer(task.id, qIdx, oIdx)}
                                  disabled={isSubmitted}
                                  className={`text-left px-4 py-3 rounded-xl border transition-colors text-sm flex items-center justify-between ${btnClass}`}
                                >
                                  <span><span className="font-bold text-zinc-400 mr-2">{String.fromCharCode(65 + oIdx)})</span> {opt}</span>
                                  {isSubmitted && oIdx === correctIdx && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                </button>
                              );
                            })}
                          </div>
                          {isSubmitted && (
                            <p className="mt-2 text-xs text-zinc-500 bg-zinc-100 p-2 rounded-lg">
                              Resposta correta: <strong>{q.answer}</strong>
                            </p>
                          )}
                        </div>
                      );
                    })}
                    {!quizSubmitted.has(task.id) && (
                      <button
                        onClick={() => submitQuiz(task.id)}
                        disabled={!quizAnswers[task.id] || Object.keys(quizAnswers[task.id] || {}).length < (task.quiz?.length || 0)}
                        className="w-full mt-2 px-4 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                      >
                        Corrigir Respostas
                      </button>
                    )}
                  </div>
                )}

                {/* Marcar como concluido (para tarefas de teoria/video) */}
                {task.type !== 'quiz' && (
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isCompleted 
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    {isCompleted ? 'Concluido' : 'Marcar como concluido'}
                  </button>
                )}
              </div>
            </div>
            
          </div>
        );
      })}
    </div>
  );
};

export default StudyDay;
