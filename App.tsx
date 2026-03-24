import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { AppShell } from './components/layout/AppShell';
import TodayPage from './pages/TodayPage';
import TrailsPage from './pages/TrailsPage';
import QuestionsPage from './pages/QuestionsPage';
import TutorPage from './pages/TutorPage';
import ProgressPage from './pages/ProgressPage';
import { logger } from './utils/logger';
import { GraduationCap, MessageSquare, Archive, LogOut, Activity, Clock, Layers, FileQuestion, BookX, Lightbulb } from 'lucide-react';
import { apiClient } from './components/api/apiClient';
import { getOrCreateSessionId, getSessionData, setSessionData, clearSession } from './utils/session';

interface AppState {
  days: number;
  currentDay: number;
  difficulties: any[];
  studentInfo: { name: string; profile: string } | null;
  plan: any;
  matricula: string | null;
  showTour: boolean;
}

const OnboardingPage: React.FC<{ onComplete: (config: any) => void }> = ({ onComplete }) => {
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSaveConfig = async (daysConfig: number, diffConfig: any, name: string, profile: string) => {
    setPlan({ loading: true });
    setError(null);

    const sessionId = getOrCreateSessionId();

    setSessionData({
      sessionId,
      name,
      days: daysConfig,
      difficulties: diffConfig,
      createdAt: new Date().toISOString()
    });

    try {
      const email = `${sessionId}@medtutor.com`;
      const password = sessionId;

      let token: string;
      try {
        const loginResponse = await apiClient.post<{ access_token: string }>('/auth/login', {
          email,
          password
        });
        token = loginResponse.access_token;
      } catch (loginError: any) {
        if (loginError.status === 422) {
          throw loginError;
        }
        try {
          const registerResponse = await apiClient.post<{ access_token: string }>('/auth/register', {
            email,
            password,
            name
          });
          token = registerResponse.access_token;
        } catch (registerError: any) {
          if (registerError.status === 422) {
            const errorMsg = registerError.message || 'Erro de validação. Verifique seus dados.';
            setError(errorMsg);
            setPlan(null);
            return;
          }
          throw registerError;
        }
      }

      apiClient.setToken(token);
      localStorage.setItem('medtutor_token', token);

      try {
        const res = await apiClient.post('/study-plan', {
          profile: {
            days: daysConfig,
            difficulties: diffConfig,
            name: name,
            profile: profile
          }
        });

        const planData = (res as any).text ? JSON.parse((res as any).text) : res;
        onComplete({ days: daysConfig, difficulties: diffConfig, studentInfo: { name, profile }, plan: planData, matricula: `MT-${Math.floor(1000 + Math.random() * 9000)}` });
      } catch {
        const subjects = diffConfig.map((d: any) => d.subject);
        const schedule = Array.from({ length: daysConfig }, (_, i) => ({
          day: i + 1,
          tasks: [
            { id: `${i + 1}-1`, subject: subjects[i % subjects.length], topic: `Estudo dirigido - ${subjects[i % subjects.length]}`, duration: '45 min', objective: `Revisao dos conceitos-chave de ${subjects[i % subjects.length]} para o vestibular`, type: 'teoria', completed: false },
            { id: `${i + 1}-2`, subject: subjects[(i + 1) % subjects.length], topic: `Exercicios - ${subjects[(i + 1) % subjects.length]}`, duration: '30 min', objective: `Resolver questoes no estilo UNIOESTE de ${subjects[(i + 1) % subjects.length]}`, type: 'quiz', quiz: [{ question: `Questao de revisao de ${subjects[(i + 1) % subjects.length]} - Dia ${i + 1}`, options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'], answer: 'Alternativa A' }], completed: false }
          ],
          summary: `Resumo do dia ${i + 1}: ${subjects[i % subjects.length]} e ${subjects[(i + 1) % subjects.length]}`
        }));
        onComplete({ days: daysConfig, difficulties: diffConfig, studentInfo: { name, profile }, plan: { days: daysConfig, schedule }, matricula: `MT-${Math.floor(1000 + Math.random() * 9000)}` });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.status === 422) {
        setError(err.message || 'Erro de validação. Verifique seus dados.');
        setPlan(null);
        return;
      }
      setError('Erro ao conectar com o servidor. Tente novamente.');
      setPlan(null);
    }
  };

  if (plan?.loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-zinc-600 font-medium animate-pulse">Montando seu plano de estudos personalizado...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6 max-w-md w-full">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="font-bold text-lg">Erro no Cadastro</h3>
          </div>
          <p className="text-zinc-600 mb-4">{error}</p>
          <button
            onClick={() => setError(null)}
            className="w-full bg-zinc-900 text-white py-3 rounded-xl font-bold hover:bg-zinc-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return <StudyPlanConfig onSave={handleSaveConfig} />;
};

const MainApp: React.FC<{ state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }> = ({ state, setState }) => {
  const [activeTab, setActiveTab] = useState<'study' | 'materials' | 'chat' | 'dashboard' | 'flashcards' | 'pomodoro' | 'cases' | 'errors' | 'mindmaps'>('study');
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [dayTasksCompleted, setDayTasksCompleted] = useState<{ [day: number]: Set<string> }>({});
  const [showLogViewer, setShowLogViewer] = useState(false);
  const logoClickCount = useRef(0);
  const lastLogoClickTime = useRef(0);

  useEffect(() => {
    logger.info('App', 'App inicializado', { currentDay: state.currentDay, activeTab, hasSession: !!state.matricula });
  }, []);

  useEffect(() => {
    logger.info('Navigation', `Navegação para: ${activeTab}`);
  }, [activeTab]);

  useEffect(() => {
    if (state.studentInfo && state.plan) {
      setSessionData({
        sessionId: getOrCreateSessionId(),
        name: state.studentInfo.name,
        days: state.days,
        currentDay: state.currentDay,
        difficulties: state.difficulties,
        showTour: state.showTour
      });
    }
  }, [state.matricula, state.days, state.currentDay, state.studentInfo, state.plan, state.difficulties, state.showTour]);

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

  const handleTaskComplete = (taskId: string) => {
    setDayTasksCompleted(prev => {
      const dayTasks = new Set(prev[state.currentDay] || []);
      if (dayTasks.has(taskId)) {
        dayTasks.delete(taskId);
      } else {
        dayTasks.add(taskId);
      }
      return { ...prev, [state.currentDay]: dayTasks };
    });
  };

  const getCurrentDayTasks = () => state.plan?.schedule?.[state.currentDay - 1]?.tasks || [];

  const isCurrentDayComplete = () => {
    const tasks = getCurrentDayTasks();
    if (tasks.length === 0) return true;
    const completed = dayTasksCompleted[state.currentDay] || new Set();
    return tasks.every((t: any) => completed.has(t.id));
  };

  const handleNextDay = () => {
    if (state.currentDay < state.days) {
      setCompletedDays(prev => new Set(prev).add(state.currentDay));
      setState(prev => ({ ...prev, currentDay: prev.currentDay + 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPrimarySubject = () => {
    const hardDiff = state.difficulties.find((d: any) => d.level === 'alta');
    if (hardDiff) return hardDiff.subject;
    return state.difficulties.length > 0 ? state.difficulties[0].subject : 'Biologia';
  };

  const handleLogout = () => {
    clearSession();
    apiClient.setToken(null);
    window.location.reload();
  };

  const userInitials = state.studentInfo?.name?.substring(0, 2).toUpperCase() || 'AL';

  return (
    <BrowserRouter>
      <AppShell
        userName={state.studentInfo?.name || 'Aluno'}
        userInitials={userInitials}
        onLogout={handleLogout}
      >
        <div className="min-h-screen bg-neutral-50">
          <header className="bg-white border-b border-zinc-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">
                {activeTab === 'study' && `Plano de Estudo - Dia ${state.currentDay}`}
                {activeTab === 'materials' && 'Meus Materiais e Resumos'}
                {activeTab === 'dashboard' && 'Meu Desempenho'}
                {activeTab === 'flashcards' && 'Flashcards de Revisao'}
                {activeTab === 'cases' && 'Simulado de Questoes UNIOESTE'}
                {activeTab === 'errors' && 'Caderno de Erros'}
                {activeTab === 'pomodoro' && 'Timer Pomodoro'}
                {activeTab === 'chat' && 'Tutor IA'}
              </h2>
              <p className="text-sm text-zinc-500 mt-1">Preparacao focada para o vestibular de Medicina da UNIOESTE.</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setState(prev => ({ ...prev, showTour: !prev.showTour }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm border ${state.showTour ? 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200' : 'bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100'}`}
              >
                <Lightbulb className="w-4 h-4" />
                {state.showTour ? 'Tour Ativado' : 'Tour Desativado'}
              </button>
              <span className="text-sm font-medium px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200 shadow-sm">
                Dia {state.currentDay} de {state.days}
              </span>
            </div>
          </header>

          <div className="flex-1 p-8 flex flex-col md:flex-row gap-8">
            <div className="flex-1 max-w-4xl space-y-6">
              {activeTab === 'study' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <TourTip show={state.showTour} title="Plano do Dia" description="Este e o seu roteiro de estudos para hoje. Complete cada tarefa marcando como concluida e responda os quizzes. Quando todas estiverem finalizadas, o botao 'Finalizar Dia e Avancar' sera liberado." />
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mb-6">
                    <ProgressBar currentDay={state.currentDay} totalDays={state.days} />
                  </div>
                  <StudyDay day={state.currentDay} onTaskComplete={handleTaskComplete} tasks={state.plan.schedule?.[state.currentDay - 1]?.tasks || [
                    { id: '1', subject: getPrimarySubject(), topic: `Teoria - ${getPrimarySubject()}`, duration: '45 min', objective: `Revisar os conceitos fundamentais de ${getPrimarySubject()} cobrados na UNIOESTE`, type: 'teoria', completed: false },
                    { id: '2', subject: getPrimarySubject(), topic: `Exercicios - ${getPrimarySubject()}`, duration: '30 min', objective: 'Resolver questoes no estilo da prova UNIOESTE', type: 'quiz', quiz: [{ question: `Questao de ${getPrimarySubject()} para revisao do dia ${state.currentDay}`, options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'], answer: 'Alternativa A' }], completed: false }
                  ]} />
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100 mt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Lightbulb className="w-5 h-5 text-amber-500" />
                      <h3 className="font-bold text-zinc-800">Resumo do Dia</h3>
                    </div>
                    <p className="text-sm text-zinc-600">{state.plan.schedule?.[state.currentDay - 1]?.summary || `Resumo do dia ${state.currentDay} - Continue estudando para aprovação em Medicina!`}</p>
                  </div>
                  <div className="mt-8 flex flex-col items-end gap-3">
                    {!isCurrentDayComplete() && state.currentDay < state.days && (
                      <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2 rounded-lg">Complete todas as tarefas do dia para poder avancar.</p>
                    )}
                    <button onClick={handleNextDay} disabled={state.currentDay >= state.days || !isCurrentDayComplete()} className={`px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 ${state.currentDay >= state.days ? 'bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200' : !isCurrentDayComplete() ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-zinc-900 text-white hover:bg-emerald-500 hover:text-zinc-950 focus:ring-4 ring-emerald-100 transform active:scale-95'}`}>
                      {state.currentDay >= state.days ? "Plano Concluido!" : "Finalizar Dia e Avancar"}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'materials' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <TourTip show={state.showTour} title="Seus Materiais" description="Aqui ficam os resumos gerados conforme voce avanca nos dias de estudo. Complete dias para acumular materiais." />
                  <ContentArea summaries={Array.from({ length: state.currentDay }, (_, i) => ({ day: i + 1, summary: state.plan.schedule?.[i]?.summary || `Resumo do dia ${i + 1} - ${state.difficulties[i % state.difficulties.length]?.subject || 'Estudo geral'}`, mindmapUrl: '#' }))} />
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <PerformanceDashboard showTour={state.showTour} currentDay={state.currentDay} totalDays={state.days} />
                </div>
              )}

              {activeTab === 'flashcards' && <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full"><Flashcards showTour={state.showTour} /></div>}
              {activeTab === 'cases' && <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto w-full"><ClinicalCases showTour={state.showTour} /></div>}
              {activeTab === 'errors' && <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full"><ErrorNotebook showTour={state.showTour} /></div>}
              {activeTab === 'pomodoro' && <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex justify-center mt-12 w-full"><Pomodoro showTour={state.showTour} /></div>}
              {activeTab === 'chat' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-[700px] bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col">
                  <TutorChat profile={{ name: state.studentInfo?.name || 'Aluno' } as any} />
                </div>
              )}
            </div>

            <div className="hidden md:flex w-96 bg-white rounded-2xl shadow-sm border border-zinc-200 flex-col overflow-hidden h-[calc(100vh-140px)] sticky top-24">
              <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="font-medium text-sm">Tutor Assistente IA</span>
                </div>
                <MessageSquare className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex-1 overflow-y-auto">
                <TutorChat profile={{ name: state.studentInfo?.name || 'Aluno' } as any} />
              </div>
            </div>
          </div>
        </div>
        <LogViewer isOpen={showLogViewer} onClose={() => setShowLogViewer(false)} />
      </AppShell>
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    days: 30,
    currentDay: 1,
    difficulties: [],
    studentInfo: null,
    plan: null,
    matricula: null,
    showTour: true
  });

  useEffect(() => {
    const savedSession = getSessionData();
    if (savedSession) {
      setState(prev => ({
        ...prev,
        studentInfo: { name: savedSession.name, profile: 'Ciclo' },
        days: savedSession.days || 30,
        difficulties: savedSession.difficulties || [],
        showTour: savedSession.showTour !== undefined ? savedSession.showTour : true
      }));
      const token = localStorage.getItem('medtutor_token');
      if (token) {
        apiClient.setToken(token);
      }
    }
  }, []);

  if (!state.plan) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <StudyPlanConfig onSave={async (daysConfig, diffConfig, name, profile) => {
          const newMatricula = `MT-${Math.floor(1000 + Math.random() * 9000)}`;
          const sessionId = getOrCreateSessionId();

          setSessionData({
            sessionId,
            name,
            days: daysConfig,
            difficulties: diffConfig,
            createdAt: new Date().toISOString()
          });

          setState(prev => ({ ...prev, plan: { loading: true } }));

          try {
      const email = `${sessionId}@medtutor.com`;
            const password = sessionId;

            let token: string;
            try {
              const loginResponse = await apiClient.post<{ access_token: string }>('/auth/login', { email, password });
              token = loginResponse.access_token;
            } catch {
              const registerResponse = await apiClient.post<{ access_token: string }>('/auth/register', { email, password, name });
              token = registerResponse.access_token;
            }

            apiClient.setToken(token);
            localStorage.setItem('medtutor_token', token);

            // Fire and forget / background generation to not block UI
            apiClient.post('/study-plan', {
              profile: { days: daysConfig, difficulties: diffConfig, name, profile }
            }).catch(e => console.error("Detalhe: Plano BG info:", e));

            const subjects = diffConfig.map((d: any) => d.subject);
            const schedule = Array.from({ length: daysConfig }, (_, i) => ({
              day: i + 1,
              tasks: [
                { id: `${i + 1}-1`, subject: subjects[i % subjects.length], topic: `Estudo dirigido - ${subjects[i % subjects.length]}`, duration: '45 min', objective: `Revisao dos conceitos-chave de ${subjects[i % subjects.length]} para o vestibular`, type: 'teoria', completed: false },
                { id: `${i + 1}-2`, subject: subjects[(i + 1) % subjects.length], topic: `Exercicios - ${subjects[(i + 1) % subjects.length]}`, duration: '30 min', objective: `Resolver questoes no estilo UNIOESTE de ${subjects[(i + 1) % subjects.length]}`, type: 'quiz', quiz: [{ question: `Questao de revisao de ${subjects[(i + 1) % subjects.length]} - Dia ${i + 1}`, options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'], answer: 'Alternativa A' }], completed: false }
              ],
              summary: `Resumo do dia ${i + 1}: ${subjects[i % subjects.length]} e ${subjects[(i + 1) % subjects.length]}`
            }));
            
            setState(prev => ({ ...prev, days: daysConfig, difficulties: diffConfig, studentInfo: { name, profile }, plan: { days: daysConfig, schedule }, matricula: newMatricula }));
          } catch (error) {
            console.error('Erro geral ao logar:', error);
            // Fallback manual local garantido em caso de falha de login
            const subjects = diffConfig.map((d: any) => d.subject);
            const schedule = Array.from({ length: daysConfig }, (_, i) => ({
              day: i + 1,
              tasks: [
                { id: `${i + 1}-1`, subject: subjects[i % subjects.length], topic: `Estudo dirigido - ${subjects[i % subjects.length]}`, duration: '45 min', objective: `Revisao dos conceitos-chave de ${subjects[i % subjects.length]} para o vestibular`, type: 'teoria', completed: false }
              ],
              summary: `Resumo do dia ${i + 1}`
            }));
            setState(prev => ({ ...prev, days: daysConfig, difficulties: diffConfig, studentInfo: { name, profile }, plan: { days: daysConfig, schedule }, matricula: newMatricula }));
          }
        }} />
      </div>
    );
  }

  if (state.plan.loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
          <p className="text-zinc-600 font-medium animate-pulse">Montando seu plano de estudos personalizado...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppShell
        userName={state.studentInfo?.name || 'Aluno'}
        userInitials={state.studentInfo?.name?.substring(0, 2).toUpperCase() || 'AL'}
        onLogout={() => {
          clearSession();
          apiClient.setToken(null);
          window.location.reload();
        }}
      >
        <Routes>
          <Route path="/hoje" element={
            <div className="max-w-4xl mx-auto p-6">
              <TodayPage userName={state.studentInfo?.name} currentDay={state.currentDay} totalDays={state.days} />
            </div>
          } />
          <Route path="/trilhas" element={<TrailsPage />} />
          <Route path="/questoes" element={<QuestionsPage />} />
          <Route path="/tutor" element={<TutorPage userName={state.studentInfo?.name} />} />
          <Route path="/progresso" element={<ProgressPage />} />
          <Route path="*" element={<Navigate to="/hoje" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

export default App;
