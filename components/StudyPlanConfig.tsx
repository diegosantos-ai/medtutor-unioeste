import React, { useState } from 'react';
import { Target, Calendar, ChevronRight, BookOpen, UserCircle, GraduationCap, AlertCircle } from 'lucide-react';

interface Difficulty {
  subject: string;
  level: 'baixa' | 'média' | 'alta';
}

interface StudyPlanConfigProps {
  onSave: (days: number, difficulties: Difficulty[], name: string, profile: string) => void;
}

const subjects = [
  'Biologia',
  'Quimica',
  'Fisica',
  'Matematica',
  'Portugues e Literatura',
  'Redacao',
  'Historia',
  'Geografia'
];

const validateName = (name: string): string | null => {
  const cleanName = name.trim();

  if (!cleanName || cleanName.length < 2) {
    return 'Nome deve ter pelo menos 2 caracteres';
  }

  if (/\s/.test(cleanName)) {
    return 'Nome não pode conter espaços. Use apenas letras e números (ex: diego86)';
  }

  if (!/[0-9]/.test(cleanName)) {
    return 'Nome deve conter pelo menos 1 número (ex: diego86)';
  }

  if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(cleanName)) {
    return 'Nome deve começar com letra e conter apenas letras e números';
  }

  return null;
};

export const StudyPlanConfig: React.FC<StudyPlanConfigProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [profileType, setProfileType] = useState('Estudando por conta propria');
  const [days, setDays] = useState(30);
  const [difficulties, setDifficulties] = useState<Difficulty[]>(subjects.map(subject => ({ subject, level: 'média' })));

  const handleNameChange = (value: string) => {
    setName(value);
    if (value.trim()) {
      const error = validateName(value);
      setNameError(error);
    } else {
      setNameError(null);
    }
  };

  const handleLevelChange = (subject: string, level: Difficulty['level']) => {
    setDifficulties(prev => prev.map(d => d.subject === subject ? { ...d, level } : d));
  };

  const handleSave = () => {
    const error = validateName(name);
    if (error) {
      setNameError(error);
      return;
    }
    if (!name.trim()) {
      setNameError('Por favor, preencha o seu nome');
      return;
    }
    onSave(days, difficulties, name, profileType);
  };

  return (
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl border border-zinc-100 overflow-hidden">
      <div className="bg-zinc-950 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <GraduationCap className="w-32 h-32" />
        </div>
        <h2 className="text-3xl font-bold mb-2 relative z-10 text-balance">Vestibular UNIOESTE - Medicina</h2>
        <p className="text-zinc-400 relative z-10">Monte seu perfil e configure seu plano de estudos personalizado.</p>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 mb-2">
              <UserCircle className="w-5 h-5 text-emerald-500" />
              Seu Nome de Usuário
            </label>
            <input
              type="text"
              placeholder="Ex: diego86"
              value={name}
              onChange={e => handleNameChange(e.target.value)}
              className={`w-full bg-zinc-50 border rounded-xl px-4 py-3 outline-none focus:ring-2 text-zinc-800 font-medium transition-colors ${
                nameError
                  ? 'border-rose-400 focus:ring-rose-300'
                  : name.trim() && !validateName(name)
                    ? 'border-emerald-400 focus:ring-emerald-300'
                    : 'border-zinc-200 focus:ring-emerald-500'
              }`}
            />
            {nameError ? (
              <div className="flex items-center gap-2 mt-2 text-rose-500 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{nameError}</span>
              </div>
            ) : name.trim() && !validateName(name) ? (
              <div className="flex items-center gap-2 mt-2 text-emerald-500 text-sm">
                <span className="w-4 h-4 shrink-0">✓</span>
                <span>Nome válido: {name.toLowerCase()}</span>
              </div>
            ) : (
              <p className="mt-2 text-zinc-500 text-sm">
                Sem espaços, pelo menos 1 número (ex: maria92)
              </p>
            )}
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 mb-2">
              <GraduationCap className="w-5 h-5 text-emerald-500" />
              Situacao Atual
            </label>
            <select
              value={profileType}
              onChange={e => setProfileType(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 text-zinc-800 font-medium"
            >
               <option>Estudando por conta propria</option>
               <option>Cursinho presencial</option>
               <option>Cursinho online</option>
               <option>3o ano do Ensino Medio</option>
               <option>Ja formado / Treineiro</option>
            </select>
          </div>
        </div>

        <div className="mb-8">
          <label className="flex items-center gap-3 text-lg font-bold text-zinc-800 mb-4">
            <Calendar className="w-6 h-6 text-emerald-500" />
            Meta de Dias de Estudo
          </label>
          <div className="flex items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
            <input
              type="range"
              min={7}
              max={365}
              value={days}
              onChange={e => setDays(Number(e.target.value))}
              className="flex-1 accent-emerald-500 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="bg-white border text-center border-zinc-200 font-bold text-xl px-6 py-2 rounded-xl w-32 shadow-sm text-zinc-800">
              {days} dias
            </div>
          </div>
        </div>

        <div className="mb-8">
          <label className="flex items-center gap-3 text-lg font-bold text-zinc-800 mb-4">
            <Target className="w-6 h-6 text-emerald-500" />
            Mapeamento de Dificuldade
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map(subject => (
              <div key={subject} className="flex justify-between items-center bg-zinc-50 border border-zinc-200 p-3 rounded-xl hover:border-emerald-200 transition-colors">
                <span className="font-medium text-zinc-700">{subject}</span>
                <select
                  value={difficulties.find(d => d.subject === subject)?.level}
                  onChange={e => handleLevelChange(subject, e.target.value as Difficulty['level'])}
                  className="bg-white border border-zinc-300 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500/20 text-zinc-700 font-medium"
                >
                  <option value="baixa">✌️ Baixa</option>
                  <option value="média">🤔 Média</option>
                  <option value="alta">🚨 Alta</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-zinc-950 text-white font-bold text-lg px-6 py-4 rounded-xl hover:bg-emerald-500 hover:text-zinc-950 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
        >
          Gerar Meu Plano de Estudos
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default StudyPlanConfig;
