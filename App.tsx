import React, { useState, useEffect, useRef } from 'react';
import StudyPlanConfig from './components/StudyPlanConfig';
import ProgressBar from './components/ProgressBar';
import StudyDay from './components/StudyDay';
import TutorChat from './components/TutorChat';
import ContentArea from './components/ContentArea';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { Flashcards } from './components/Flashcards';
import { Pomodoro } from './components/Pomodoro';
import { ClinicalCases } from './components/ClinicalCases';
import { ErrorNotebook } from './components/ErrorNotebook';
import { TourTip } from './components/TourTip';
import { LogViewer } from './components/LogViewer/LogViewer';
import { logger } from './utils/logger';
import { LayoutDashboard, GraduationCap, MessageSquare, Archive, LogOut, Activity, Clock, Layers, FileQuestion, BookX, Lightbulb } from 'lucide-react';
import { authApi } from './components/api/authApi';
import { apiClient } from './components/api/apiClient';

const App: React.FC = () => {
  const [days, setDays] = useState(30);
  const [currentDay, setCurrentDay] = useState(1);
  const [difficulties, setDifficulties] = useState<any[]>([]);
  const [studentInfo, setStudentInfo] = useState<{ name: string, profile: string } | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'study' | 'materials' | 'chat' | 'dashboard' | 'flashcards' | 'pomodoro' | 'cases' | 'errors' | 'mindmaps'>('study');
  const [matricula, setMatricula] = useState<string | null>(null);
  const [showTour, setShowTour] = useState<boolean>(true);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [dayTasksCompleted, setDayTasksCompleted] = useState<{ [day: number]: Set<string> }>({});

  // LogViewer state
  const [showLogViewer, setShowLogViewer] = useState(false);
  const logoClickCount = useRef(0);
  const lastLogoClickTime = useRef(0);

  // Load Session if exists
  React.useEffect(() => {
    const saved = localStorage.getItem('medtutor_session');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.matricula) {
          setMatricula(data.matricula);
          setDays(data.days);
          setCurrentDay(data.currentDay);
          setStudentInfo(data.studentInfo);
          setPlan(data.plan);
          setDifficulties(data.difficulties || []);
          if (data.showTour !== undefined) setShowTour(data.showTour);
        }
      } catch (e) {
        console.error("Failed to load session", e);
      }
    }
  }, []);

  // Save changes to localStorage seamlessly
  React.useEffect(() => {
    if (matricula && studentInfo && plan) {
      localStorage.setItem('medtutor_session', JSON.stringify({
        matricula, days, currentDay, studentInfo, plan, difficulties, showTour
      }));
    }
  }, [matricula, days, currentDay, studentInfo, plan, difficulties, showTour]);

  // Log app initialization
  useEffect(() => {
    logger.info('App', 'App inicializado', {
      currentDay,
      activeTab,
      hasSession: !!matricula,
    });
  }, []);

  // Log navigation changes
  useEffect(() => {
    logger.info('Navigation', `Navegação para: ${activeTab}`);
  }, [activeTab]);

  // Secret button handler (5 clicks on logo)
  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastLogoClickTime.current < 1000) {
      logoClickCount.current += 1;
    } else {
      logoClickCount.current = 1;
    }
    lastLogoClickTime.current = now;

    if (logoClickCount.current === 5) {
      logger.info('App', 'Botão secreto acionado - Abrindo LogViewer');
      setShowLogViewer(true);
      logoClickCount.current = 0;
    }
  };

  const handleSaveConfig = async (daysConfig: number, diffConfig: any, name: string, profile: string) => {
    const newMatricula = `MT-${Math.floor(1000 + Math.random() * 9000)}`;
    setMatricula(newMatricula);

    setDays(daysConfig);
    setDifficulties(diffConfig);
    setStudentInfo({ name, profile });

    setPlan({ loading: true });

    try {
      // 1. Tentar login ou registro automático para isolar o usuário
      // Usamos o nome como email simbólico para este MVP de login simples
      const email = `${name.toLowerCase().replace(/\s+/g, '.')}@medtutor.com`;
      const password = 'password123'; // Senha padrão para login simplificado

      let authResponse;
      try {
        authResponse = await authApi.login({ email, password });
      } catch (e) {
        // Se falhar login, tenta registrar
        authResponse = await authApi.register({ email, password, name });
      }

      const token = authResponse.access_token;
      apiClient.setToken(token);
      localStorage.setItem('medtutor_token', token);

      // 2. Chamar API de plano autenticada
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: 'plan',
          payload: {
            days: daysConfig,
            difficulties: diffConfig,
            name: name,
            profile: profile
          }
        })
      });

      if (!res.ok) throw new Error('Falha ao gerar plano');

      const data = await res.json();
      setPlan(data.text ? JSON.parse(data.text) : data);
    } catch (error) {
      console.error(error);
      // Fallback: gera plano basico local para cada dia com as materias do aluno
      const subjects = diffConfig.map((d: any) => d.subject);
      const schedule = Array.from({ length: daysConfig }, (_, i) => ({
        day: i + 1,
        tasks: [
          {
            id: `${i + 1}-1`,
            subject: subjects[i % subjects.length],
            topic: `Estudo dirigido - ${subjects[i % subjects.length]}`,
            duration: '45 min',
            objective: `Revisao dos conceitos-chave de ${subjects[i % subjects.length]} para o vestibular`,
            type: 'teoria',
            completed: false
          },
          {
            id: `${i + 1}-2`,
            subject: subjects[(i + 1) % subjects.length],
            topic: `Exercicios - ${subjects[(i + 1) % subjects.length]}`,
            duration: '30 min',
            objective: `Resolver questoes no estilo UNIOESTE de ${subjects[(i + 1) % subjects.length]}`,
            type: 'quiz',
            quiz: [
              {
                question: `Questao de revisao de ${subjects[(i + 1) % subjects.length]} - Dia ${i + 1}`,
                options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
                answer: 'Alternativa A'
              }
            ],
            completed: false
          }
        ],
        summary: `Resumo do dia ${i + 1}: ${subjects[i % subjects.length]} e ${subjects[(i + 1) % subjects.length]}`
      }));
      setPlan({ days: daysConfig, schedule });
    }
  };

  const handleTaskComplete = (taskId: string) => {
    setDayTasksCompleted(prev => {
      const dayTasks = new Set(prev[currentDay] || []);
      if (dayTasks.has(taskId)) {
        dayTasks.delete(taskId);
      } else {
        dayTasks.add(taskId);
      }
      return { ...prev, [currentDay]: dayTasks };
    });
  };

  const getCurrentDayTasks = () => {
    return plan?.schedule?.[currentDay - 1]?.tasks || [];
  };

  const isCurrentDayComplete = () => {
    const tasks = getCurrentDayTasks();
    if (tasks.length === 0) return true;
    const completed = dayTasksCompleted[currentDay] || new Set();
    return tasks.every((t: any) => completed.has(t.id));
  };

  const handleNextDay = () => {
    if (currentDay < days) {
      setCompletedDays(prev => new Set(prev).add(currentDay));
      setCurrentDay(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPrimarySubject = () => {
    const hardDiff = difficulties.find(d => d.level === 'alta');
    if (hardDiff) return hardDiff.subject;
    return difficulties.length > 0 ? difficulties[0].subject : 'Biologia';
  };

  const handleLogout = () => {
    authApi.logout();
    window.location.reload();
  };

  if (!plan || plan.loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        {plan?.loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
            <p className="text-zinc-600 font-medium animate-pulse">Montando seu plano de estudos personalizado...</p>
          </div>
        ) : (
          <StudyPlanConfig onSave={handleSaveConfig} />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 flex flex-col text-zinc-100">
        <div className="p-6 border-b border-zinc-800">
          <h1
            className="text-xl font-bold tracking-tight text-white flex items-center gap-2 cursor-pointer select-none"
            onClick={handleLogoClick}
            title="Clique 5x para abrir logs"
          >
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            MedTutor
          </h1>
          <p className="text-xs text-zinc-400 mt-1 uppercase tracking-wider">Vestibular UNIOESTE</p>
          {studentInfo && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-400 font-medium tracking-wider uppercase mb-1">ALUNO</p>
              <p className="text-sm text-emerald-400 font-bold truncate" title={studentInfo.name}>{studentInfo.name}</p>
              <p className="text-xs text-zinc-500 truncate" title={studentInfo.profile}>{studentInfo.profile}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
          {/* Grupo: Estudo */}
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2">Estudo</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('study')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'study' ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Plano do Dia
              </button>
              <button
                onClick={() => setActiveTab('cases')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'cases' ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
              >
                <FileQuestion className="w-4 h-4" />
                Simulado Questoes
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'flashcards' ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
              >
                <Layers className="w-4 h-4" />
                Flashcards
              </button>
            </div>
          </div>

          {/* Grupo: Revisao */}
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2">Revisao</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('errors')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'errors' ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
              >
                <BookX className="w-4 h-4" />
                Caderno de Erros
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'materials' ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
              >
                <Archive className="w-4 h-4" />
                Meus Materiais
              </button>
            </div>
          </div>

          {/* Grupo: Acompanhamento */}
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2">Acompanhamento</p>
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'dashboard' ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
              >
                <Activity className="w-4 h-4" />
                Desempenho
              </button>
              <button
                onClick={() => setActiveTab('pomodoro')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'pomodoro' ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
              >
                <Clock className="w-4 h-4" />
                Pomodoro
              </button>
            </div>
          </div>

          {/* Mobile only: Chat */}
          <div className="md:hidden">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${activeTab === 'chat' ? 'bg-zinc-800 text-emerald-400 font-medium' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}
              >
                <MessageSquare className="w-4 h-4" />
                Tutor IA
              </button>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-zinc-900">
              {studentInfo?.name.substring(0, 2).toUpperCase() || 'AL'}
            </div>
            <div>
              <p className="text-sm font-medium">{studentInfo?.name || 'Aluno'}</p>
              <p className="text-xs text-zinc-500">Matrícula: {matricula || 'N/A'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-rose-400 transition-colors">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-zinc-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900">
              {activeTab === 'study' && `Plano de Estudo - Dia ${currentDay}`}
              {activeTab === 'materials' && 'Meus Materiais e Resumos'}
              {activeTab === 'mindmaps' && 'Mapas Mentais e Resumos Visuais'}
              {activeTab === 'dashboard' && 'Meu Desempenho'}
              {activeTab === 'flashcards' && 'Flashcards de Revisao'}
              {activeTab === 'cases' && 'Simulado de Questoes UNIOESTE'}
              {activeTab === 'errors' && 'Caderno de Erros'}
              {activeTab === 'pomodoro' && 'Timer Pomodoro'}
              {activeTab === 'chat' && 'Tutor IA'}
            </h2>
            <p className="text-sm text-zinc-500 mt-1">
              Preparacao focada para o vestibular de Medicina da UNIOESTE.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowTour(!showTour)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${showTour ? 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100'}`}
            >
              <Lightbulb className="w-4 h-4" />
              {showTour ? 'Tour Ativado' : 'Tour Desativado'}
            </button>
            <span className="text-sm font-medium px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 shadow-sm">
              Dia {currentDay} de {days}
            </span>
          </div>
        </header>

        <div className="flex-1 p-8 flex flex-col md:flex-row gap-8">
          <div className="flex-1 max-w-4xl space-y-6">

            {activeTab === 'study' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <TourTip
                  show={showTour}
                  title="Plano do Dia"
                  description={`Este e o seu roteiro de estudos para hoje. Complete cada tarefa marcando como concluida e responda os quizzes. Quando todas estiverem finalizadas, o botao "Finalizar Dia e Avancar" sera liberado.`}
                />
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mb-6">
                  <ProgressBar currentDay={currentDay} totalDays={days} />
                </div>

                <StudyDay
                  day={currentDay}
                  onTaskComplete={handleTaskComplete}
                  tasks={plan.schedule?.[currentDay - 1]?.tasks || [
                    {
                      id: '1',
                      subject: getPrimarySubject(),
                      topic: `Teoria - ${getPrimarySubject()}`,
                      duration: '45 min',
                      objective: `Revisar os conceitos fundamentais de ${getPrimarySubject()} cobrados na UNIOESTE`,
                      type: 'teoria',
                      completed: false
                    },
                    {
                      id: '2',
                      subject: getPrimarySubject(),
                      topic: `Exercicios - ${getPrimarySubject()}`,
                      duration: '30 min',
                      objective: 'Resolver questoes no estilo da prova UNIOESTE',
                      type: 'quiz',
                      quiz: [
                        { question: `Questao de ${getPrimarySubject()} para revisao do dia ${currentDay}`, options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'], answer: 'Alternativa A' }
                      ],
                      completed: false
                    }
                  ]}
                />

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-zinc-800">Resumo do Dia</h3>
                  </div>
                  <p className="text-sm text-zinc-600">
                    {plan.schedule?.[currentDay - 1]?.summary || `Resumo do dia ${currentDay} - Continue estudando para aprovação em Medicina!`}
                  </p>
                </div>

                <div className="mt-8 flex flex-col items-end gap-3">
                  {!isCurrentDayComplete() && currentDay < days && (
                    <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg">
                      Complete todas as tarefas do dia para poder avancar.
                    </p>
                  )}
                  <button
                    onClick={handleNextDay}
                    disabled={currentDay >= days || !isCurrentDayComplete()}
                    className={`px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 ${currentDay >= days
                      ? 'bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200'
                      : !isCurrentDayComplete()
                        ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                        : 'bg-zinc-900 text-white hover:bg-emerald-500 hover:text-zinc-950 focus:ring-4 ring-emerald-100 transform active:scale-95'
                      }`}
                  >
                    {currentDay >= days ? "Plano Concluido!" : "Finalizar Dia e Avancar"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <TourTip
                  show={showTour}
                  title="Seus Materiais"
                  description="Aqui ficam os resumos gerados conforme voce avanca nos dias de estudo. Complete dias para acumular materiais."
                />
                <ContentArea summaries={
                  Array.from({ length: currentDay }, (_, i) => ({
                    day: i + 1,
                    summary: plan.schedule?.[i]?.summary || `Resumo do dia ${i + 1} - ${difficulties[i % difficulties.length]?.subject || 'Estudo geral'}`,
                    mindmapUrl: '#'
                  }))
                } />
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PerformanceDashboard
                  showTour={showTour}
                  currentDay={currentDay}
                  totalDays={days}
                  subjects={difficulties.map((d: any) => d.subject)}
                />
              </div>
            )}

            {activeTab === 'flashcards' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
                <Flashcards showTour={showTour} />
              </div>
            )}

            {activeTab === 'cases' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto w-full">
                <ClinicalCases showTour={showTour} />
              </div>
            )}

            {activeTab === 'errors' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                <ErrorNotebook showTour={showTour} />
              </div>
            )}

            {activeTab === 'pomodoro' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex justify-center mt-12 w-full">
                <Pomodoro showTour={showTour} />
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[700px] bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col md:hidden">
                <TutorChat profile={{ name: studentInfo?.name || 'Aluno' } as any} />
              </div>
            )}

          </div>

          {/* Desktop Right Sidebar Chat Panel */}
          <div className="hidden md:flex w-96 bg-white rounded-2xl shadow-sm border border-zinc-200 flex-col overflow-hidden h-[calc(100vh-140px)] sticky top-24">
            <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="font-medium text-sm">Tutor Assistente IA</span>
              </div>
              <MessageSquare className="w-4 h-4 text-zinc-400" />
            </div>
            <div className="flex-1 overflow-y-auto">
              <TutorChat profile={{ name: studentInfo?.name || 'Aluno' } as any} />
            </div>
          </div>

        </div>
      </main>

      {/* Log Viewer Modal */}
      <LogViewer isOpen={showLogViewer} onClose={() => setShowLogViewer(false)} />
    </div>
  );
};

export default App;
