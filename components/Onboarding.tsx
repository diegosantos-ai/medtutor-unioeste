import React, { useState } from 'react';
import { UserProfile, WeeklyPlan } from '../types';
import { generateStudyPlan } from '../geminiService';
import { Book, Clock, ArrowRight, CheckCircle, Loader2, Sparkles, GraduationCap } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile, plan: WeeklyPlan) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [hours, setHours] = useState(4);
  const [difficulties, setDifficulties] = useState<string[]>([]);

  const [learningStyle, setLearningStyle] = useState<'visual' | 'auditory' | 'kinesthetic' | 'reading'>('visual');

  const subjects = [
    { name: 'Biologia', category: 'biologicas', priority: 'Alta' },
    { name: 'Anatomia', category: 'biologicas', priority: 'Alta' },
    { name: 'Fisiologia', category: 'biologicas', priority: 'Alta' },
    { name: 'Bioquímica', category: 'biologicas', priority: 'Alta' },
    { name: 'Química', category: 'exatas', priority: 'Média' },
    { name: 'Física', category: 'exatas', priority: 'Média' },
    { name: 'Matemática', category: 'exatas', priority: 'Média' },
    { name: 'Português', category: 'linguagens', priority: 'Alta' },
    { name: 'Redação', category: 'linguagens', priority: 'Alta' },
    { name: 'História', category: 'humanas', priority: 'Baixa' },
    { name: 'Geografia', category: 'humanas', priority: 'Baixa' },
    { name: 'Filosofia', category: 'humanas', priority: 'Baixa' },
  ];

  const toggleDifficulty = (subject: string) => {
    setDifficulties(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const profile: UserProfile = {
        name,
        dailyHours: hours,
        difficulties,
        learningStyle,
        academicHistory: '',
        hasOnboarded: true,
        streak: 0
      };

      const plan = await generateStudyPlan(profile);
      onComplete(profile, plan);
    } catch (error) {
      console.error(error);
      alert("Erro ao criar cronograma. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Decorative Background Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 max-w-lg w-full relative z-10 transition-all duration-300">

        {/* Header / Progress */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-brand-700">
            <GraduationCap size={28} />
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight">MedTutor</span>
              <span className="text-xs text-emerald-600 font-medium">Medicina UNIOESTE</span>
            </div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step >= i ? 'w-8 bg-brand-500' : 'w-2 bg-surface-200'}`} />
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-6 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <Loader2 className="relative animate-spin text-brand-600" size={64} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-surface-900 mb-2">Preparando sua Jornada...</h3>
              <p className="text-surface-600 max-w-xs mx-auto">A IA está criando seu plano de estudos personalizado para a aprovação em Medicina na UNIOESTE.</p>
            </div>
          </div>
        ) : (
          <div className="min-h-[320px] flex flex-col justify-between">
            {step === 1 && (
              <div className="space-y-8 animate-slide-up">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-800">
                    Sua jornada para Medicina começa aqui
                  </h2>
                  <p className="text-surface-600 text-lg">Vamos criar um plano de estudos personalizado para você conquistar a aprovação na UNIOESTE.</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-surface-700 uppercase tracking-wide">Seu Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-surface-50 border border-surface-200 focus:bg-white focus:ring-4 focus:ring-brand-100 focus:border-brand-500 outline-none transition-all text-lg mb-2"
                    placeholder="Digite seu nome..."
                    autoFocus
                  />
                </div>

                <button
                  onClick={() => name && setStep(2)}
                  disabled={!name}
                  className="w-full group relative overflow-hidden bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-brand-200/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Continuar <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-brand-500 to-brand-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-slide-up">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-surface-900">Tempo Diário</h2>
                  <p className="text-surface-600">Quanto tempo você pode dedicar aos estudos por dia?</p>
                </div>

                <div className="flex flex-col items-center gap-6 py-4">
                  <div className="relative group cursor-pointer">
                    <div className="absolute inset-0 bg-brand-200 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <Clock size={64} className="text-brand-500 relative z-10" />
                  </div>

                  <div className="text-center">
                    <div className="text-5xl font-black text-surface-900 mb-1">{hours}h</div>
                    <span className="text-surface-500 font-medium bg-surface-100 px-3 py-1 rounded-full text-sm">por dia</span>
                  </div>

                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={hours}
                    onChange={(e) => setHours(Number(e.target.value))}
                    className="w-full h-3 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-brand-500 hover:accent-brand-600 transition-all"
                  />
                </div>

                <button
                  onClick={() => setStep(3)}
                  className="w-full group bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-brand-200/50 transition-all flex items-center justify-center gap-2"
                >
                  Confirmar Tempo <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-slide-up">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-surface-900">Como você aprende melhor?</h2>
                  <p className="text-surface-600">Selecione o estilo que mais combina com você.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'visual', label: 'Visual', icon: <Book size={20} /> },
                    { id: 'auditory', label: 'Auditivo', icon: <Clock size={20} /> }, // Using Clock as placeholder, could be improved
                    { id: 'reading', label: 'Leitura/Escrita', icon: <Book size={20} /> },
                    { id: 'kinesthetic', label: 'Prático', icon: <CheckCircle size={20} /> }
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setLearningStyle(style.id as any)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${learningStyle === style.id
                        ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'bg-white border-surface-100 hover:border-brand-200 text-surface-600'
                        }`}
                    >
                      {style.icon}
                      <span className="font-semibold">{style.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setStep(4)}
                    className="w-full group bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Confirmar Estilo <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-slide-up">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-surface-900">Seus Desafios</h2>
                  <p className="text-surface-600">Selecione as matérias que você considera mais difíceis.</p>
                </div>

                <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto pr-1">
                  {subjects.map(sub => (
                    <button
                      key={sub.name}
                      onClick={() => toggleDifficulty(sub.name)}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-all duration-200 flex items-center justify-between gap-2 ${difficulties.includes(sub.name)
                        ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                        : 'bg-white border-surface-100 text-surface-500 hover:border-brand-200 hover:text-brand-600 hover:bg-surface-50'
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        {sub.name}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          sub.priority === 'Alta' ? 'bg-emerald-100 text-emerald-700' :
                          sub.priority === 'Média' ? 'bg-blue-100 text-blue-700' :
                          'bg-surface-100 text-surface-600'
                        }`}>
                          {sub.priority}
                        </span>
                      </span>
                      {difficulties.includes(sub.name) && <CheckCircle size={14} />}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full group relative overflow-hidden bg-surface-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
                >
                  <Sparkles size={20} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="relative z-10">Gerar Meu Cronograma IA</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
